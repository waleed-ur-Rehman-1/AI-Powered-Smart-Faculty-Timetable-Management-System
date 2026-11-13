import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@university.edu" },
    update: {},
    create: {
      email: "admin@university.edu",
      password: hash,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin created:", admin.email);

  const dept = await prisma.department.upsert({
    where: { name: "Computer Science" },
    update: {},
    create: { name: "Computer Science" },
  });
  console.log("✅ Department created:", dept.name, "| ID:", dept.id);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
