import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🧹 Wiping database for a fresh start...");
  await prisma.timetableEntry.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();
  await prisma.course.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.timeSlot.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Admin
  await prisma.user.create({
    data: {
      email: "admin@university.edu",
      password: passwordHash,
      role: "ADMIN",
    },
  });
  console.log("👑 Admin Created: admin@university.edu | password123");

  // 2. Create Department & Semester
  const dept = await prisma.department.upsert({
    where: { name: "Computer Science" },
    update: {},
    create: { name: "Computer Science" },
  });
  await prisma.semester.upsert({
    where: { name: "Fall 2026" },
    update: {},
    create: { name: "Fall 2026" },
  });

  // 3. Create Teachers
  const user1 = await prisma.user.create({
    data: {
      email: "ali@university.edu",
      password: passwordHash,
      role: "FACULTY",
    },
  });
  const teacher1 = await prisma.faculty.create({
    data: {
      name: "Dr. Ali",
      departmentId: dept.id,
      userId: user1.id,
      maxHours: 12,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "sara@university.edu",
      password: passwordHash,
      role: "FACULTY",
    },
  });
  const teacher2 = await prisma.faculty.create({
    data: {
      name: "Prof. Sara",
      departmentId: dept.id,
      userId: user2.id,
      maxHours: 12,
    },
  });
  console.log(
    "👨‍🏫 Teachers Created: ali@university.edu & sara@university.edu (password123)",
  );

  // 4. Create Courses (Admin assigns these conceptually)
  await prisma.course.create({
    data: {
      code: "CS101",
      name: "Intro to Programming",
      departmentId: dept.id,
    },
  });
  await prisma.course.create({
    data: { code: "CS102", name: "Data Structures", departmentId: dept.id },
  });
  await prisma.course.create({
    data: { code: "CS103", name: "Web Development", departmentId: dept.id },
  });

  // 5. Create Rooms & Timeslots
  await prisma.classroom.create({ data: { name: "Room A", capacity: 40 } });
  await prisma.classroom.create({ data: { name: "Room B", capacity: 40 } });
  await prisma.timeSlot.create({
    data: { dayOfWeek: 1, startTime: "09:00", endTime: "10:30" },
  });
  await prisma.timeSlot.create({
    data: { dayOfWeek: 1, startTime: "11:00", endTime: "12:30" },
  });
  await prisma.timeSlot.create({
    data: { dayOfWeek: 2, startTime: "09:00", endTime: "10:30" },
  });

  console.log("✅ Setup Complete. Database is ready.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
