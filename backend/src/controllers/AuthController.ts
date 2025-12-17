import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
} from "../dtos/auth.dto";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: RegisterInput = req.body;
      const result = await this.authService.register(data);

      res
        .cookie("token", result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        .status(201)
        .json({
          success: true,
          message: "User registered successfully",
          data: {
            user: {
              _id: result.user._id,
              name: result.user.name,
              email: result.user.email,
            },
          },
        });
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: LoginInput = req.body;
      const result = await this.authService.login(data);

      res
        .cookie("token", result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        .status(200)
        .json({
          success: true,
          message: "Login successful",
          data: {
            user: {
              _id: result.user._id,
              name: result.user.name,
              email: result.user.email,
            },
          },
        });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const user = await this.authService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const data: UpdateProfileInput = req.body;
      const user = await this.authService.updateProfile(userId, data);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })
        .status(200)
        .json({
          success: true,
          message: "Logout successful",
        });
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const users = await this.authService.getAllUsers();

      res.status(200).json({
        success: true,
        data: users.map((user) => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  };
}
