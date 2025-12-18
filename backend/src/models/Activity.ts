import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  action: string; // e.g., "Updated Task Status"
  task: mongoose.Types.ObjectId; // Reference to the task
  details: string; // e.g., "Changed status from 'To Do' to 'In Progress'"
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    details: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IActivity>("Activity", ActivitySchema);
