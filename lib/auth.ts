import { hash, compare } from "bcryptjs";
import { prisma } from "./db";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

const SESSION_COOKIE = "ac_session";
const SESSION_DAYS = 7;
const PIN_SALT_ROUNDS = 10;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 min
const RATE_LIMIT_MAX_ATTEMPTS = 10;

// In-memory rate limit (use Redis in production for multi-instance)
const loginAttempts = new Map<string, { count: number; firstAt: number }>();

function getRateLimitKey(email: string): string {
  return `login:${email.toLowerCase().trim()}`;
}

export function isRateLimited(email: string): boolean {
  const key = getRateLimitKey(email);
  const entry = loginAttempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.delete(key);
    return false;
  }
  return entry.count >= RATE_LIMIT_MAX_ATTEMPTS;
}

export function recordLoginAttempt(email: string): void {
  const key = getRateLimitKey(email);
  const entry = loginAttempts.get(key);
  const now = Date.now();
  if (!entry) {
    loginAttempts.set(key, { count: 1, firstAt: now });
    return;
  }
  if (now - entry.firstAt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAt: now });
    return;
  }
  entry.count += 1;
}

export function clearLoginRateLimit(email: string): void {
  loginAttempts.delete(getRateLimitKey(email));
}

export async function hashPin(pin: string): Promise<string> {
  return hash(pin, PIN_SALT_ROUNDS);
}

export async function verifyPin(plain: string, hashed: string): Promise<boolean> {
  return compare(plain, hashed);
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: { token, userId, expiresAt },
  });
  return token;
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findFirst({
    where: { token, expiresAt: { gt: new Date() } },
    select: { userId: true },
  });
  return session?.userId ?? null;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } });
}

export { loginAttempts };
