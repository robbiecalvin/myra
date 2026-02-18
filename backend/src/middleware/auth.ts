import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/authService.js";
import type { JwtClaims, UserRole } from "../types/phase2.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtClaims;
  }
}

const bearerToken = (header: string | undefined): string | null => {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token;
};

export const requireAuth = (request: Request, response: Response, next: NextFunction): void => {
  try {
    const token = bearerToken(request.headers.authorization);
    if (!token) {
      response.status(401).json({ message: "Missing bearer token.", code: "UNAUTHORIZED" });
      return;
    }
    request.user = verifyToken(token);
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token.", code: "UNAUTHORIZED" });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (request: Request, response: Response, next: NextFunction): void => {
    if (!request.user) {
      response.status(401).json({ message: "Authentication required.", code: "UNAUTHORIZED" });
      return;
    }

    if (!roles.includes(request.user.role)) {
      response.status(403).json({ message: "Insufficient role permissions.", code: "FORBIDDEN" });
      return;
    }

    next();
  };
};
