// backend/middleware/rateLimiter.js - Best version
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

// Mock rate limiter
const mockRateLimiter = {
  limit: async () => ({ success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 })
};

let rateLimiter;

// Only initialize in production with credentials
if (process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_URL) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    
    rateLimiter = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(100, "60 s"),
      analytics: true,
    });
    console.log("✅ Upstash rate limiter initialized");
  } catch (error) {
    console.error("⚠️ Rate limiter init error:", error.message);
    rateLimiter = mockRateLimiter;
  }
} else {
  console.log("⚠️ Rate limiter disabled (development or missing credentials)");
  rateLimiter = mockRateLimiter;
}

const rateLimiterMiddleware = async (req, res, next) => {
  // Skip in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  try {
    const identifier = req.userId || req.ip || 'anonymous';
    const { success, limit, remaining, reset } = await rateLimiter.limit(identifier);
    
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', new Date(reset).toISOString());
    
    if (!success) {
      return res.status(429).json({ 
        message: "Too many requests, please try again later.",
        retryAfter: Math.ceil((reset - Date.now()) / 1000)
      });
    }
    
    next();
  } catch (error) {
    console.error("Rate limiter error:", error.message);
    next();
  }
};

export default rateLimiterMiddleware;