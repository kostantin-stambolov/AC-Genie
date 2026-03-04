import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hash } from "bcryptjs";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

const TEST_EMAIL = "test@test.com";
const TEST_PIN = "1234";

async function main() {
  const pinHash = await hash(TEST_PIN, 10);
  await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    create: { email: TEST_EMAIL, pinHash },
    update: { pinHash },
  });
  console.log("Seed done. You can log in with:");
  console.log("  Email:", TEST_EMAIL);
  console.log("  PIN:", TEST_PIN);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
