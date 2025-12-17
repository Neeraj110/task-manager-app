import { Router } from "express";
import { TaskController } from "../controllers/TaskController";
import { validateBody } from "../middleware/validation.middleware";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/task.dto";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const taskController = new TaskController();

router.use(authenticate);

router.post("/", validateBody(CreateTaskDto), taskController.createTask);

router.get("/", taskController.getTasks);

router.get("/:id", taskController.getTaskById);

router.patch("/:id", validateBody(UpdateTaskDto), taskController.updateTask);

router.patch("/:id/status", taskController.updateTaskStatus);

router.delete("/:id", taskController.deleteTask);

export default router;
