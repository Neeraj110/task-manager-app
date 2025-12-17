import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate);

router.get("/stats", dashboardController.getStats);
router.get("/activity", dashboardController.getRecentActivity);
router.get("/deadlines", dashboardController.getUpcomingDeadlines);
router.get("/overdue", dashboardController.getOverdueTasks);

export default router;
