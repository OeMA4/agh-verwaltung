import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultUsers = [
  { username: "admin", password: "admin123", name: "Administrator" },
  { username: "oemer", password: "oemer", name: "Ömer" },
];

async function createOrUpdateUser(username, password, name) {
  const hashedPassword = await bcrypt.hash(password, 12);

  const existingUser = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (existingUser) {
    await prisma.adminUser.update({
      where: { username },
      data: { password: hashedPassword, name },
    });
    console.log(`✓ User "${username}" updated`);
  } else {
    await prisma.adminUser.create({
      data: {
        username,
        password: hashedPassword,
        name,
      },
    });
    console.log(`✓ User "${username}" created`);
  }

  return { username, password };
}

async function main() {
  console.log("Seeding admin users...\n");

  const createdUsers = [];
  for (const user of defaultUsers) {
    const result = await createOrUpdateUser(user.username, user.password, user.name);
    createdUsers.push(result);
  }

  console.log("\nLogin credentials:");
  for (const user of createdUsers) {
    console.log(`  ${user.username} / ${user.password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
