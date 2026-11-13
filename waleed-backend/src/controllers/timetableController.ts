import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";

export const getMySchedule = async (req: AuthRequest, res: Response) => {
  try {
    // Find the faculty profile attached to the logged-in user
    const faculty = await prisma.faculty.findUnique({
      where: { userId: req.user!.id },
    });

    if (!faculty)
      return res.status(404).json({ error: "Faculty profile not found" });

    // Fetch all timetable entries for this faculty
    const schedule = await prisma.timetableEntry.findMany({
      where: { facultyId: faculty.id, status: "PUBLISHED" },
      include: {
        course: true,
        classroom: true,
        timeSlot: true,
        semester: true,
      },
      orderBy: { timeSlot: { dayOfWeek: "asc" } },
    });

    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
