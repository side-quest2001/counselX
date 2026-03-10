import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { studentsService } from './students.service';

const SignupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  country: z.string().max(100).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class StudentsController {
  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = SignupSchema.parse(req.body);
      const result = await studentsService.signup(body);
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = LoginSchema.parse(req.body);
      const result = await studentsService.login(body);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const student = await studentsService.getById(req.user!.id!);
      res.json({ success: true, data: student });
    } catch (err) {
      next(err);
    }
  };
}

export const studentsController = new StudentsController();
