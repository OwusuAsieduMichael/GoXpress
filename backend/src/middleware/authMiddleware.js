import { ApiError } from "../utils/apiError.js";
import { verifyToken } from "../utils/jwt.js";

const extractToken = (req) => {
  const cookieToken = req.cookies?.token;
  if (cookieToken) return cookieToken;

  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
};

export const requireAuth = (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "Insufficient permissions"));
  }

  return next();
};
