import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Ensure Department exists
  const dept = await prisma.department.upsert({
    where: { name: "Computer Science" },
    update: {},
    create: { name: "Computer Science" },
  });
  console.log("✅ Department ready:", dept.name);

  // 2. Ensure Faculty User exists with password 'faculty123'
  const hashedPassword = await bcrypt.hash("faculty123", 10);

  const user = await prisma.user.upsert({
    where: { email: "waleed@university.edu" },
    update: { password: hashedPassword },
    create: {
      email: "waleed@university.edu",
      password: hashedPassword,
      role: "FACULTY",
      faculty: {
        create: {
          name: "Waleed Ahmed",
          departmentId: dept.id,
        },
      },
    },
  });
  console.log("✅ User ready:", user.email, "| Password: faculty123");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
