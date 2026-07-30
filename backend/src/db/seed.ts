import { scryptSync, randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

async function main() {
  const email = process.env.ADMIN_OWNER_EMAIL;
  const password = process.env.ADMIN_OWNER_PASSWORD;

  if (!email || !password) {
    console.log("Seed skipped: ADMIN_OWNER_EMAIL and ADMIN_OWNER_PASSWORD are required.");
    return;
  }

  await prisma.user.upsert({
    where: { email },
    update: {
      role: "admin",
      permissions: ["*"],
      isActive: true,
    },
    create: {
      name: "Owner THE BOARD",
      email,
      passwordHash: hashPassword(password),
      role: "admin",
      permissions: ["*"],
      isActive: true,
    },
  });

  console.log(`Seeded owner admin: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
