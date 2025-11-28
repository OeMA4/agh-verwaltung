import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2] || "admin";
  const password = process.argv[3] || "admin123";
  const name = process.argv[4] || "Administrator";

  const hashedPassword = await bcrypt.hash(password, 12);

  const existingUser = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (existingUser) {
    console.log(`Admin user "${username}" already exists. Updating password...`);
    await prisma.adminUser.update({
      where: { username },
      data: { password: hashedPassword, name },
    });
    console.log(`Password updated for user "${username}"`);
  } else {
    await prisma.adminUser.create({
      data: {
        username,
        password: hashedPassword,
        name,
      },
    });
    console.log(`Admin user "${username}" created successfully!`);
  }

  console.log("\nLogin credentials:");
  console.log(`  Username: ${username}`);
  console.log(`  Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
