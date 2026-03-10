import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error.middleware';

export interface SignupPayload {
  email: string;
  name: string;
  password: string;
  country?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export class StudentsService {
  async signup(payload: SignupPayload) {
    const existing = await prisma.student.findUnique({
      where: { email: payload.email },
    });

    if (existing) {
      throw new AppError(409, 'An account with this email already exists');
    }

    const hashed = await bcrypt.hash(payload.password, 10);

    const student = await prisma.student.create({
      data: {
        email: payload.email,
        name: payload.name,
        password: hashed,
        country: payload.country,
      },
      select: { id: true, email: true, name: true, country: true, createdAt: true },
    });

    const token = jwt.sign(
      { id: student.id, email: student.email, role: 'student' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );

    return { token, student };
  }

  async login(payload: LoginPayload) {
    const student = await prisma.student.findUnique({
      where: { email: payload.email },
    });

    if (!student) {
      throw new AppError(401, 'Invalid email or password');
    }

    const valid = await bcrypt.compare(payload.password, student.password);
    if (!valid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = jwt.sign(
      { id: student.id, email: student.email, role: 'student' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const { password: _, ...safeStudent } = student;
    return { token, student: safeStudent };
  }

  async getById(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, country: true, createdAt: true },
    });

    if (!student) throw new AppError(404, 'Student not found');
    return student;
  }
}

export const studentsService = new StudentsService();
