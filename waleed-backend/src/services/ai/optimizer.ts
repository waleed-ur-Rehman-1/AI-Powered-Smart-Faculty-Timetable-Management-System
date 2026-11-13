import { prisma } from "../../config/prisma.js";

export const generateAITimetable = async () => {
  const semester = await prisma.semester.findFirst();
  if (!semester) throw new Error("No semester found");

  // Clear existing draft schedules
  await prisma.timetableEntry.deleteMany({
    where: { semesterId: semester.id },
  });

  const courses = await prisma.course.findMany();
  const teachers = await prisma.faculty.findMany();
  const rooms = await prisma.classroom.findMany();
  const slots = await prisma.timeSlot.findMany();

  const results = [];

  // Simple AI: Assign courses round-robin to teachers, find free room and slot
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const teacher = teachers[i % teachers.length]; // Distribute equally
    let assigned = false;

    for (const slot of slots) {
      if (assigned) break;
      for (const room of rooms) {
        // Check conflicts
        const teacherBusy = await prisma.timetableEntry.findFirst({
          where: {
            facultyId: teacher.id,
            timeSlotId: slot.id,
            semesterId: semester.id,
          },
        });
        const roomBusy = await prisma.timetableEntry.findFirst({
          where: {
            classroomId: room.id,
            timeSlotId: slot.id,
            semesterId: semester.id,
          },
        });

        if (!teacherBusy && !roomBusy) {
          const entry = await prisma.timetableEntry.create({
            data: {
              courseId: course.id,
              facultyId: teacher.id,
              classroomId: room.id,
              timeSlotId: slot.id,
              semesterId: semester.id,
              status: "PUBLISHED",
            },
          });
          results.push(entry);
          assigned = true;
          break;
        }
      }
    }
  }
  return results;
};
