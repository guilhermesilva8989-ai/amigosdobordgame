import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedAdmin {
  id: string;
  name: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  admin: AuthenticatedAdmin;
}
