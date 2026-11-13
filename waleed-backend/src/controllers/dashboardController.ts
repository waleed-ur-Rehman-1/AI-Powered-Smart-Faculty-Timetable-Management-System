import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";

export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user!.role;

    if (role === "ADMIN") {
      // ADMIN DASHBOARD DATA
      const teacherCount = await prisma.user.count({
        where: { role: "FACULTY" },
      });
      const courseCount = await prisma.course.count();
      const roomCount = await prisma.classroom.count();
      const scheduledCount = await prisma.timetableEntry.count();

      return res.json({
        type: "ADMIN",
        stats: {
          teachers: teacherCount,
          courses: courseCount,
          rooms: roomCount,
          scheduledClasses: scheduledCount,
        },
      });
    } else {
      // FACULTY DASHBOARD DATA
      const faculty = await prisma.faculty.findUnique({
        where: { userId: req.user!.id },
      });

      if (!faculty)
        return res.status(404).json({ error: "Faculty profile not found" });

      // Get today's day of week (1 = Monday, 7 = Sunday)
      const today = new Date().getDay() || 7;

      const todaysClasses = await prisma.timetableEntry.findMany({
        where: {
          facultyId: faculty.id,
          timeSlot: { dayOfWeek: today },
        },
        include: { course: true, classroom: true, timeSlot: true },
        orderBy: { timeSlot: { startTime: "asc" } },
      });

      const totalClasses = await prisma.timetableEntry.count({
        where: { facultyId: faculty.id },
      });

      return res.json({
        type: "FACULTY",
        name: faculty.name,
        stats: {
          todayClasses: todaysClasses.length,
          totalWeeklyClasses: totalClasses,
          maxHours: faculty.maxHours,
        },
        todaysSchedule: todaysClasses,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
