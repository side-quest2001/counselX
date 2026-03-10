import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error.middleware';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  email: string;
  role: string;
}

export class AuthService {
  login(credentials: LoginCredentials): { token: string; user: AuthUser } {
    const { email, password } = credentials;

    if (
      email !== env.ADMIN_EMAIL ||
      password !== env.ADMIN_PASSWORD
    ) {
      throw new AppError(401, 'Invalid email or password');
    }

    const user: AuthUser = { email, role: 'admin' };
    const token = jwt.sign(user, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    return { token, user };
  }

  getMe(email: string): AuthUser {
    return { email, role: 'admin' };
  }
}

export const authService = new AuthService();
