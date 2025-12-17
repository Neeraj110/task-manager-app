import mongoose, { Schema } from "mongoose";
import { ITask, TaskPriority, TaskStatus } from "../types/types";

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedToId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

TaskSchema.index({ assignedToId: 1, status: 1 });
TaskSchema.index({ creatorId: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ status: 1, priority: 1 });

export const Task = mongoose.model<ITask>("Task", TaskSchema);
