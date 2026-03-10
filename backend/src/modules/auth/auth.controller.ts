import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';

const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = LoginSchema.parse(req.body);
      const result = authService.login(body);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = authService.getMe(req.user!.email);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
