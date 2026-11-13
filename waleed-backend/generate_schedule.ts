import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("⏳ Setting up mock data (Rooms, TimeSlots, Courses)...");

  // 1. Create Classrooms
  const room1 = await prisma.classroom.upsert({
    where: { name: "Room A" },
    update: {},
    create: { name: "Room A", capacity: 40 },
  });
  const room2 = await prisma.classroom.upsert({
    where: { name: "Room B" },
    update: {},
    create: { name: "Room B", capacity: 30 },
  });

  // 2. Create TimeSlots (Monday 9AM, Monday 11AM, Tuesday 9AM)
  const ts1 = await prisma.timeSlot.upsert({
    where: { id: "ts1" },
    update: {},
    create: { id: "ts1", dayOfWeek: 1, startTime: "09:00", endTime: "10:30" },
  });
  const ts2 = await prisma.timeSlot.upsert({
    where: { id: "ts2" },
    update: {},
    create: { id: "ts2", dayOfWeek: 1, startTime: "11:00", endTime: "12:30" },
  });
  const ts3 = await prisma.timeSlot.upsert({
    where: { id: "ts3" },
    update: {},
    create: { id: "ts3", dayOfWeek: 2, startTime: "09:00", endTime: "10:30" },
  });

  // 3. Create Course & Get Faculty
  const dept = await prisma.department.findFirst();
  const faculty = await prisma.faculty.findFirst();

  if (!dept || !faculty)
    throw new Error(
      "Run the seed script first to create a Department and Faculty!",
    );

  const course = await prisma.course.upsert({
    where: { code: "CS101" },
    update: {},
    create: {
      code: "CS101",
      name: "Intro to Programming",
      departmentId: dept.id,
    },
  });

  const semester = await prisma.semester.upsert({
    where: { name: "Fall 2026" },
    update: {},
    create: { name: "Fall 2026" },
  });

  console.log(
    "🧠 AI Engine: Analyzing constraints and generating timetable...",
  );

  // AI ALGORITHM: Find a slot where BOTH Faculty and Room are free
  const rooms = [room1, room2];
  const slots = [ts1, ts2, ts3];
  let generated = false;

  for (const slot of slots) {
    for (const room of rooms) {
      // Check Hard Constraint: Is faculty busy?
      const facultyConflict = await prisma.timetableEntry.findFirst({
        where: {
          facultyId: faculty.id,
          timeSlotId: slot.id,
          semesterId: semester.id,
        },
      });

      // Check Hard Constraint: Is room busy?
      const roomConflict = await prisma.timetableEntry.findFirst({
        where: {
          classroomId: room.id,
          timeSlotId: slot.id,
          semesterId: semester.id,
        },
      });

      if (!facultyConflict && !roomConflict && !generated) {
        // Save the recommended schedule
        await prisma.timetableEntry.create({
          data: {
            courseId: course.id,
            facultyId: faculty.id,
            classroomId: room.id,
            timeSlotId: slot.id,
            semesterId: semester.id,
            status: "PUBLISHED",
          },
        });
        console.log(
          `✅ SUCCESS: Scheduled ${course.code} in ${room.name} on Day ${slot.dayOfWeek} at ${slot.startTime}`,
        );
        generated = true;
      }
    }
  }
  if (!generated) console.log("❌ AI could not find a conflict-free slot.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
