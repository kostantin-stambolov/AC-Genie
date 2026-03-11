import { hash, compare } from "bcryptjs";
import { prisma } from "./db";
import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const SESSION_COOKIE = "ac_session";
const ADMIN_CONTEXT_COOKIE = "ac_admin_ctx";
const SESSION_DAYS = 7;
const PIN_SALT_ROUNDS = 10;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 min
const RATE_LIMIT_MAX_ATTEMPTS = 10;

// In-memory rate limit (use Redis in production for multi-instance)
const loginAttempts = new Map<string, { count: number; firstAt: number }>();

export type AdminContext = {
  isAdmin: true;
  adminEmail: string;
  impersonatedUserId: string | null;
  impersonatedEmail: string | null;
  issuedAt: number;
};

export type AuthContext = {
  isAdmin: boolean;
  adminEmail: string | null;
  userId: string | null;
  effectiveUserId: string | null;
  impersonatedUserId: string | null;
  impersonatedEmail: string | null;
};

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
  const context = await getAuthContext();
  return context.effectiveUserId;
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function getRawSessionUserId(): Promise<string | null> {
  const token = await getSessionToken();
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

function getAdminSecret(): string {
  const secret = process.env.SESSION_SECRET ?? "";
  if (!secret) {
    throw new Error("SESSION_SECRET is required for admin context");
  }
  return secret;
}

function base64UrlFromString(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function stringFromBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string): string {
  return createHmac("sha256", getAdminSecret())
    .update(payload)
    .digest("base64url");
}

function encodeAdminContext(ctx: AdminContext): string {
  const payload = base64UrlFromString(JSON.stringify(ctx));
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

function decodeAdminContext(raw: string): AdminContext | null {
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;
  const expected = signPayload(payload);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const parsed = JSON.parse(stringFromBase64Url(payload)) as Partial<AdminContext>;
    if (!parsed || parsed.isAdmin !== true || typeof parsed.adminEmail !== "string") {
      return null;
    }
    return {
      isAdmin: true,
      adminEmail: parsed.adminEmail,
      impersonatedUserId:
        typeof parsed.impersonatedUserId === "string" ? parsed.impersonatedUserId : null,
      impersonatedEmail:
        typeof parsed.impersonatedEmail === "string" ? parsed.impersonatedEmail : null,
      issuedAt: typeof parsed.issuedAt === "number" ? parsed.issuedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export async function setAdminContextCookie(context: AdminContext): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_CONTEXT_COOKIE, encodeAdminContext(context), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearAdminContextCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_CONTEXT_COOKIE);
}

export async function getAdminContext(): Promise<AdminContext | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_CONTEXT_COOKIE)?.value;
  if (!raw) return null;
  return decodeAdminContext(raw);
}

export function isAdminCredentials(email: string, pin: string): boolean {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const adminPin = (process.env.ADMIN_PIN ?? "").trim();
  if (!adminEmail || !adminPin) return false;
  return email.trim().toLowerCase() === adminEmail && pin === adminPin;
}

export async function getAuthContext(): Promise<AuthContext> {
  const [admin, userId] = await Promise.all([getAdminContext(), getRawSessionUserId()]);
  let effectiveUserId: string | null = userId;
  if (admin && !admin.impersonatedUserId) {
    effectiveUserId = null;
  } else if (admin && admin.impersonatedUserId) {
    effectiveUserId = userId === admin.impersonatedUserId ? userId : null;
  }
  return {
    isAdmin: !!admin,
    adminEmail: admin?.adminEmail ?? null,
    userId,
    effectiveUserId,
    impersonatedUserId: admin?.impersonatedUserId ?? null,
    impersonatedEmail: admin?.impersonatedEmail ?? null,
  };
}

export async function clearCurrentSession(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    await deleteSession(token);
  }
  await clearSessionCookie();
}

export { loginAttempts };
