import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/UserRepository";
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
} from "../dtos/auth.dto";
import { IUser } from "../types/types";
import { generateToken } from "../utils/jwt";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/errors";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: RegisterInput): Promise<{ user: IUser; token: string }> {
    const emailExists = await this.userRepository.emailExists(data.email);
    if (emailExists) {
      throw new ConflictError("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    return { user, token };
  }

  async login(data: LoginInput): Promise<{ user: IUser; token: string }> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return { user, token };
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileInput
  ): Promise<IUser> {
    const user = await this.userRepository.update(userId, data);
    return user;
  }

  async verifyUser(userId: string): Promise<IUser> {
    return await this.userRepository.findByIdOrFail(userId);
  }

  async getAllUsers(): Promise<IUser[]> {
    return await this.userRepository.findAll();
  }
}
