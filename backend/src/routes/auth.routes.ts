import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validateBody } from "../middleware/validation.middleware";
import { RegisterDto, LoginDto, UpdateProfileDto } from "../dtos/auth.dto";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", validateBody(RegisterDto), authController.register);

router.post("/login", validateBody(LoginDto), authController.login);

router.get("/profile", authenticate, authController.getProfile);

router.put(
  "/profile",
  authenticate,
  validateBody(UpdateProfileDto),
  authController.updateProfile
);

router.get("/users", authenticate, authController.getAllUsers);

router.post("/logout", authController.logout);

export default router;
