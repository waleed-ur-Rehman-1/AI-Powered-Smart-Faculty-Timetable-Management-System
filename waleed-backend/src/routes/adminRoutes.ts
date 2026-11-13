import { Router } from "express";
import {
    createCourse,
    createFaculty,
    createRoom,
    getAdminData,
    triggerAIGeneration,
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.post("/generate", triggerAIGeneration);
router.get("/data", getAdminData);

// New Routes
router.post("/faculty", createFaculty);
router.post("/courses", createCourse);
router.post("/rooms", createRoom);

export default router;
