import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response } from 'express';
import { config } from '../config';
import logger from '../utils/logger';

// Custom key generator that considers user ID if available, but prioritizes IP
const keyGenerator = (req: Request): string => {
  // For the requirement of 100 req/5 min/IP, we use IP as primary identifier
  return `rate_limit:ip:${req.ip}`;
};

// Main rate limiter: 100 requests per 5 minutes per IP
export const generalRateLimit = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS, // 5 minutes
  max: config.RATE_LIMIT.MAX_REQUESTS, // 100 requests
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded: 100 requests per 5 minutes per IP. Please try again later.',
    retryAfter: Math.ceil(config.RATE_LIMIT.WINDOW_MS / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  skipSuccessfulRequests: config.RATE_LIMIT.SKIP_SUCCESSFUL_REQUESTS,
  skip: (req: Request): boolean => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/ready';
  },
  onLimitReached: (req: Request, res: Response) => {
    logger.warn('Rate limit reached', {
      ip: req.ip,
      userId: req.headers['x-user-id'],
      path: req.path,
      userAgent: req.get('User-Agent'),
    });
  },
});

// Strict rate limiter for sensitive endpoints
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests to sensitive endpoint, please try again later.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  onLimitReached: (req: Request, res: Response) => {
    logger.warn('Strict rate limit reached', {
      ip: req.ip,
      userId: req.headers['x-user-id'],
      path: req.path,
      userAgent: req.get('User-Agent'),
    });
  },
});

// Authentication rate limiter
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 authentication attempts per windowMs
  message: {
    error: 'Too Many Authentication Attempts',
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => `auth:${req.ip}`,
  onLimitReached: (req: Request, res: Response) => {
    logger.warn('Authentication rate limit reached', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
    });
  },
});

// Slow down middleware for progressive delays
export const slowDownMiddleware = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per windowMs without delay
  delayMs: 500, // add 500ms delay per request after delayAfter
  maxDelayMs: 5000, // maximum delay of 5 seconds
  keyGenerator,
  onLimitReached: (req: Request, res: Response) => {
    logger.warn('Slow down limit reached', {
      ip: req.ip,
      userId: req.headers['x-user-id'],
      path: req.path,
      userAgent: req.get('User-Agent'),
    });
  },
});

// Premium user rate limiter (higher limits) - but still IP-based for this requirement
export const premiumRateLimit = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REQUESTS * 2, // 2x higher limit for premium users
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded, please try again later.',
    retryAfter: Math.ceil(config.RATE_LIMIT.WINDOW_MS / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  skip: (req: Request): boolean => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/ready';
  },
});

// Dynamic rate limiter based on user type - still respecting IP-based limits
export const dynamicRateLimit = (req: Request, res: Response, next: Function) => {
  const userRoles = req.headers['x-user-roles'] ? 
    JSON.parse(req.headers['x-user-roles'] as string) : [];
  
  const isPremium = userRoles.includes('premium');
  const isAdmin = userRoles.includes('admin');
  
  // Admins get higher limits but still IP-based
  if (isAdmin) {
    return premiumRateLimit(req, res, next);
  }
  
  // Premium users get slightly higher limits
  if (isPremium) {
    return premiumRateLimit(req, res, next);
  }
  
  // Use general rate limiter for regular users (100 req/5 min/IP)
  return generalRateLimit(req, res, next);
};
