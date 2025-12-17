import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { UnauthorizedError } from "../utils/errors";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token || req.headers.authorization;

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

   
    const decoded = jwt.verify(token, JWT_SECRET) as { _id: string };

    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      throw new UnauthorizedError("Invalid token - user not found");
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid token"));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError("Token expired"));
    } else {
      next(error);
    }
  }
};
