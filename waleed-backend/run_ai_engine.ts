import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🧹 Cleaning old data for a fresh AI run...");
  await prisma.timetableEntry.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany({ where: { role: "FACULTY" } });
  await prisma.course.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.timeSlot.deleteMany();

  console.log("🌱 Creating Departments, Rooms, and TimeSlots...");
  const dept = await prisma.department.upsert({
    where: { name: "Computer Science" },
    update: {},
    create: { name: "Computer Science" },
  });
  const sem = await prisma.semester.upsert({
    where: { name: "Fall 2026" },
    update: {},
    create: { name: "Fall 2026" },
  });

  const roomA = await prisma.classroom.create({
    data: { name: "Room A", capacity: 40 },
  });
  const roomB = await prisma.classroom.create({
    data: { name: "Room B", capacity: 40 },
  });

  const t1 = await prisma.timeSlot.create({
    data: { dayOfWeek: 1, startTime: "09:00", endTime: "10:30" },
  }); // Mon 9am
  const t2 = await prisma.timeSlot.create({
    data: { dayOfWeek: 1, startTime: "11:00", endTime: "12:30" },
  }); // Mon 11am
  const t3 = await prisma.timeSlot.create({
    data: { dayOfWeek: 2, startTime: "09:00", endTime: "10:30" },
  }); // Tue 9am

  console.log("👨‍🏫 Creating Faculty (Teachers)...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Teacher 1
  const user1 = await prisma.user.create({
    data: {
      email: "ali@university.edu",
      password: hashedPassword,
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

  // Teacher 2
  const user2 = await prisma.user.create({
    data: {
      email: "sara@university.edu",
      password: hashedPassword,
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

  console.log("📚 Creating Courses and Allocating them to Teachers...");
  const course1 = await prisma.course.create({
    data: {
      code: "CS101",
      name: "Intro to Programming",
      departmentId: dept.id,
    },
  });
  const course2 = await prisma.course.create({
    data: { code: "CS102", name: "Data Structures", departmentId: dept.id },
  });
  const course3 = await prisma.course.create({
    data: { code: "CS103", name: "Web Development", departmentId: dept.id },
  });

  // We pretend the Admin assigned: Ali -> CS101 & CS102. Sara -> CS103.
  const assignments = [
    { course: course1, teacher: teacher1 },
    { course: course2, teacher: teacher1 },
    { course: course3, teacher: teacher2 },
  ];

  console.log("\n🧠 AI SCHEDULING ENGINE STARTING...\n");

  const rooms = [roomA, roomB];
  const slots = [t1, t2, t3];

  for (const item of assignments) {
    let assigned = false;

    for (const slot of slots) {
      if (assigned) break;

      // 1. Check Faculty Conflict (Is Teacher busy at this slot?)
      const isTeacherBusy = await prisma.timetableEntry.findFirst({
        where: {
          facultyId: item.teacher.id,
          timeSlotId: slot.id,
          semesterId: sem.id,
        },
      });

      // 2. Check Room Conflicts (Find a room that is NOT busy at this slot)
      for (const room of rooms) {
        const isRoomBusy = await prisma.timetableEntry.findFirst({
          where: {
            classroomId: room.id,
            timeSlotId: slot.id,
            semesterId: sem.id,
          },
        });

        if (!isTeacherBusy && !isRoomBusy) {
          // AI found a perfect slot and room with 0 conflicts!
          await prisma.timetableEntry.create({
            data: {
              courseId: item.course.id,
              facultyId: item.teacher.id,
              classroomId: room.id,
              timeSlotId: slot.id,
              semesterId: sem.id,
              status: "PUBLISHED",
            },
          });
          console.log(
            `✅ AI Assigned: ${item.course.code} | Teacher: ${item.teacher.name} | ${room.name} | Day ${slot.dayOfWeek} at ${slot.startTime}`,
          );
          assigned = true;
          break; // Break room loop
        }
      }
    }

    if (!assigned) {
      console.log(
        `❌ AI Failed: Could not find a conflict-free slot for ${item.course.code}`,
      );
    }
  }
  console.log("\n🎉 AI Generation Complete. Timetable Published.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
