import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;

if (!JWT_SECRET || !JWT_EXPIRES_IN) {
  throw new Error(
    "JWT_SECRET or JWT_EXPIRES_IN is not defined in environment variables"
  );
}

export const generateToken = (userId: Types.ObjectId): string => {
  // Check if JWT_EXPIRES_IN is a number string (e.g., "3600") or a time string (e.g., "7d")
  const expiresIn = /^\d+$/.test(JWT_EXPIRES_IN)
    ? parseInt(JWT_EXPIRES_IN, 10)
    : JWT_EXPIRES_IN;

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign({ _id: userId.toString() }, JWT_SECRET, options);
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_SECRET as string) as { userId: string };
};
