import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { generateAITimetable } from "../services/ai/optimizer.js";

export const triggerAIGeneration = async (req: Request, res: Response) => {
  try {
    const schedule = await generateAITimetable();
    res.json({
      message: "AI Timetable Generated Successfully",
      count: schedule.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminData = async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: "FACULTY" },
      include: { faculty: true },
    });
    const courses = await prisma.course.findMany();
    const rooms = await prisma.classroom.findMany();
    const scheduledClassesCount = await prisma.timetableEntry.count();

    res.json({ teachers, courses, rooms, scheduledClassesCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// NEW: Add a Teacher
export const createFaculty = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Auto-assign to the first department for simplicity
    const dept = await prisma.department.findFirst();
    if (!dept) return res.status(400).json({ error: "No department exists" });

    const hashedPassword = await bcrypt.hash(password || "password123", 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "FACULTY",
        faculty: {
          create: { name, departmentId: dept.id },
        },
      },
    });

    res.json({ message: "Faculty created successfully", user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// NEW: Add a Course
export const createCourse = async (req: Request, res: Response) => {
  try {
    const { code, name } = req.body;
    const dept = await prisma.department.findFirst();

    const course = await prisma.course.create({
      data: { code, name, departmentId: dept!.id },
    });
    res.json({ message: "Course created successfully", course });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// NEW: Add a Room
export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, capacity } = req.body;
    const room = await prisma.classroom.create({
      data: { name, capacity: parseInt(capacity) },
    });
    res.json({ message: "Room created successfully", room });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
