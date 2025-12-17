import { User } from "../models/User";
import { IUser } from "../types/types";
import { NotFoundError } from "../utils/errors";

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  async findByIdOrFail(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async create(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async update(userId: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async delete(userId: string): Promise<void> {
    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      throw new NotFoundError("User not found");
    }
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email });
    return count > 0;
  }

  async findAll(): Promise<IUser[]> {
    return await User.find().select("-password");
  }
}
