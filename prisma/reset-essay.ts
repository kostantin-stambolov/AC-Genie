/**
 * One-off script: deletes all in-progress Part 1 (essay) attempts.
 * Run with: npx tsx prisma/reset-essay.ts
 * After this, "Start new essay" will show the topic picker (3 suggestions) again.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.attempt.deleteMany({
    where: { part: 1, section: null, status: "in_progress" },
  });
  console.log(`Deleted ${result.count} in-progress essay attempt(s).`);
  console.log("Go to Home → Start new essay to see the 3 topic suggestions.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
