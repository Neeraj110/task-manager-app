import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;

if (!JWT_SECRET || !JWT_EXPIRES_IN) {
  throw new Error(
    "JWT_SECRET or JWT_EXPIRES_IN is not defined in environment variables"
  );
}

export const generateToken = (userId: Types.ObjectId): string => {
  return jwt.sign({ _id: userId.toString() }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
};
