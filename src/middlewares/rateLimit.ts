import {rateLimit} from "express-rate-limit";

// Rate limit middleware
export const rateLimitMiddleware = rateLimit({
  windowMs: 1000,
  max: 5,
  message: "You have exceeded your 5 requests per second limit.",
  headers: true,
});