import mongoose, { Document, Types, Schema } from "mongoose";
import { IUser } from "../types/types";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
