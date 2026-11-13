import { Router } from "express";
import { getMySchedule } from "../controllers/timetableController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/my-schedule", authenticate, getMySchedule);

export default router;
