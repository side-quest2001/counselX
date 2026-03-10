import Cookies from 'js-cookie';
import { TOKEN_KEY } from './api';

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: 'strict' });
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
