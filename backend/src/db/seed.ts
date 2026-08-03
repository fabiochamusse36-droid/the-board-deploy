import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../shared/password.js";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_OWNER_PASSWORD;

  if (!email || !password) {
    console.log("Seed skipped: ADMIN_OWNER_EMAIL and ADMIN_OWNER_PASSWORD are required.");
    return;
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Owner THE BOARD",
      role: "admin",
      permissions: ["*"],
      isActive: true,
      passwordHash,
    },
    create: {
      name: "Owner THE BOARD",
      email,
      passwordHash,
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
