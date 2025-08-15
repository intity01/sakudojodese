// Security Middleware Integration
// Comprehensive security middleware for Express applications

import { Request, Response, NextFunction } from 'express';
import { securityValidator, DEFAULT_SECURITY_CONFIG } from './securityConfig';
import { privacyComplianceService } from './privacyCompliance';
import { auditLogger } from './auditLogger';

// Extended request interface with security context
export interface SecureRequest extends Request {
  security?: {
    userId?: string;
    sessionId?: string;
    permissions?: string[];
    rateLimit?: {
      remaining: number;
      resetTime: number;
    };
    validation?: {
      contentSafe: boolean;
      filesSafe: boolean;
    };
  };
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security middleware collection
export class SecurityMiddleware {
  
  // Authentication middleware
  static authenticate(required: boolean = true) {
    return async (req: SecureRequest, res: Response, next: NextFunction) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          if (required) {
            await auditLogger.logAuthentication(
              'unknown',
              'token_missing',
              'failure',
              { path: req.path },
              { ipAddress: req.ip, userAgent: req.get('User-Agent') }
            );
            return res.status(401).json({ error: 'Authentication token required' });
          }
          return next();
        }

        // Validate token (simplified - in production use proper JWT validation)
        const userId = await SecurityMiddleware.validateToken(token);
        
        if (!userId) {
          await auditLogger.logAuthentication(
            'unknown',
            'token_invalid',
            'failure',
            { token: token.substring(0, 10) + '...', path: req.path },
            { ipAddress: req.ip, userAgent: req.get('User-Agent') }
          );
          return res.status(401).json({ error: 'Invalid authentication token' });
        }

        // Set security context
        req.security = {
          userId,
          sessionId: req.sessionID,
          permissions: await SecurityMiddleware.getUserPermissions(userId)
        };

        await auditLogger.logAuthentication(
          userId,
          'token_validated',
          'success',
          { path: req.path },
          { ipAddress: req.ip, userAgent: req.get('User-Agent') }
        );

        next();
      } catch (error) {
        await auditLogger.logSecurityEvent(
          'authentication_error',
          'high',
          { error: error instanceof Error ? error.message : 'Unknown error', path: req.path },
          undefined,
          { ipAddress: req.ip, userAgent: req.get('User-Agent') }
        );
        res.status(500).json({ error: 'Authentication error' });
      }
    };
  }

  // Authorization middleware
  static authorize(requiredPermissions: string[]) {
    return async (req: SecureRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.security?.userId) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const userPermissions = req.security.permissions || [];
        const hasPermission = requiredPermissions.every(permission => 
          userPermissions.includes(permission) || userPermissions.includes('admin')
        );

        if (!hasPermission) {
          await auditLogger.logEvent({
            userId: req.security.userId,
            eventType: 'authorization',
            category: 'security',
            severity: 'medium',
            action: 'permission_denied',
            outcome: 'failure',
            details: {
              requiredPermissions,
              userPermissions,
              path: req.path
            },
            ipAddress: req.ip
          });

          return res.status(403).json({ 
            error: 'Insufficient permissions',
            required: requiredPermissions
          });
        }

        await auditLogger.logEvent({
          userId: req.security.userId,
          eventType: 'authorization',
          category: 'security',
          severity: 'low',
          action: 'permission_granted',
          outcome: 'success',
          details: { requiredPermissions, path: req.path },
          ipAddress: req.ip
        });

        next();
      } catch (error) {
        await auditLogger.logSecurityEvent(
          'authorization_error',
          'high',
          { error: error instanceof Error ? error.message : 'Unknown error' },
          req.security?.userId
        );
        res.status(500).json({ error: 'Authorization error' });
      }
    };
  }

  // Rate limiting middleware
  static rateLimit(options: {
    windowMs?: number;
    maxRequests?: number;
    keyGenerator?: (req: Request) => string;
    skipSuccessfulRequests?: boolean;
  } = {}) {
    const config = {
      windowMs: options.windowMs || DEFAULT_SECURITY_CONFIG.rateLimiting.windowMs,
      maxRequests: options.maxRequests || DEFAULT_SECURITY_CONFIG.rateLimiting.maxRequests,
      keyGenerator: options.keyGenerator || ((req: Request) => req.ip),
      skipSuccessfulRequests: options.skipSuccessfulRequests || false
    };

    return async (req: SecureRequest, res: Response, next: NextFunction) => {
      try {
        const key = config.keyGenerator(req);
        const now = Date.now();
        const windowStart = now - config.windowMs;

        // Get or create rate limit record
        let record = rateLimitStore.get(key);
        if (!record || record.resetTime <= now) {
          record = { count: 0, resetTime: now + config.windowMs };
          rateLimitStore.set(key, record);
        }

        // Check if limit exceeded
        if (record.count >= config.maxRequests) {
          await auditLogger.logSecurityEvent(
            'rate_limit_exceeded',
            'medium',
            { 
              key, 
              count: record.count, 
              limit: config.maxRequests,
              path: req.path
            },
            req.security?.userId,
            { ipAddress: req.ip, userAgent: req.get('User-Agent') }
          );

          return res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil((record.resetTime - now) / 1000)
          });
        }

        // Increment counter
        record.count++;

        // Set rate limit context
        if (!req.security) req.security = {};
        req.security.rateLimit = {
          remaining: config.maxRequests - record.count,
          resetTime: record.resetTime
        };

        // Set response headers
        res.setHeader('X-RateLimit-Limit', config.maxRequests);
        res.setHeader('X-RateLimit-Remaining', req.security.rateLimit.remaining);
        res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

        next();
      } catch (error) {
        await auditLogger.logSecurityEvent(
          'rate_limit_error',
          'high',
          { error: error instanceof Error ? error.message : 'Unknown error' },
          req.security?.userId
        );
        next(); // Continue on rate limit errors
      }
    };
  }

  // Content validation middleware
  static validateContent() {
    return async (req: SecureRequest, res: Response, next: NextFunction) => {
      try {
        let contentSafe = true;
        const validationErrors: string[] = [];

        // Validate request body content
        if (req.body && typeof req.body === 'object') {
          for (const [key, value] of Object.entries(req.body)) {
            if (typeof value === 'string') {
              const validation = securityValidator.validateMessageContent(value);
              if (!validation.valid) {
                contentSafe = false;
                validationErrors.push(...validation.errors);
              } else {
                // Update with sanitized content
                req.body[key] = validation.sanitized;
              }
            }
          }
        }

        // Set validation context
        if (!req.security) req.security = {};
        req.security.validation = { contentSafe, filesSafe: true };

        if (!contentSafe) {
          await auditLogger.logSecurityEvent(
            'content_validation_failed',
            'medium',
            { 
              errors: validationErrors,
              path: req.path,
              contentKeys: Object.keys(req.body || {})
            },
            req.security?.userId,
            { ipAddress: req.ip, userAgent: req.get('User-Agent') }
          );

          return res.status(400).json({
            error: 'Content validation failed',
            details: validationErrors
          });
        }

        next();
      } catch (error) {
        await auditLogger.logSecurityEvent(
          'content_validation_error',
          'high',
          { error: error instanceof Error ? error.message : 'Unknown error' },
          req.security?.userId
        );
        res.status(500).json({ error: 'Content validation error' });
      }
    };
  }

  // File upload validation middleware
  static validateFileUpload() {
    return async (req: SecureRequest, res: Response, next: NextFunction) => {
      try {
        let filesSafe = true;
        const validationErrors: string[] = [];

        // Check if files are present
        if (req.files) {
          const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
          
          for (const file of files) {
            const validation = securityValidator.validateFile(file as File);
            if (!validation.valid) {
              filesSafe = false;
              validationErrors.push(...validation.errors);
            }
          }
        }

        // Update validation context
        if (req.security?.validation) {
          req.security.validation.filesSafe = filesSafe;
        }

        if (!filesSafe) {
          await auditLogger.logSecurityEvent(
            'file_validation_failed',
            'high',
            { 
              errors: validationErrors,
              fileCount: req.files ? Object.keys(req.files).length : 0,
              path: req.path
            },
            req.security?.userId,
            { ipAddress: req.ip, userAgent: req.get('User-Agent') }
          );

          return res.status(400).json({
            error: 'File validation failed',
            details: validationErrors
          });
        }

        next();
      } catch (error) {
        await auditLogger.logSecurityEvent(
          'file_validation_error',
          'high',
          { error: error instanceof Error ? error.message : 'Unknown error' },
          req.security?.userId
        );
        res.status(500).json({ error: 'File validation error' });
      }
    };
  }

  // Privacy consent middleware
  static requireConsent(purpose: string) {
    return async (req: SecureRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.security?.userId) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const hasConsent = await privacyComplianceService.hasValidConsent(
          req.security.userId,
          purpose
        );

        if (!hasConsent) {
          await auditLogger.logPrivacyEvent(
            req.security.userId,
            'consent_required',
            { purpose, path: req.path },
            'failure'
          );

          return res.status(403).json({
            error: 'Consent required',
            purpose,
            consentUrl: '/privacy/consent',
            message: `This action requires consent for: ${purpose}`
          });
        }

        await auditLogger.logPrivacyEvent(
          req.security.userId,
          'consent_verified',
          { purpose, path: req.path }
        );

        next();
      } catch (error) {
        await auditLogger.logSecurityEvent(
          'consent_check_error',
          'high',
          { error: error instanceof Error ? error.message : 'Unknown error', purpose },
          req.security?.userId
        );
        res.status(500).json({ error: 'Consent verification error' });
      }
    };
  }

  // IP validation middleware
  static validateIP() {
    return async (req: SecureRequest, res: Response, next: NextFunction) => {
      try {
        const clientIP = req.ip;
        const validation = securityValidator.validateIP(clientIP);

        if (!validation.allowed) {
          await auditLogger.logSecurityEvent(
            'ip_blocked',
            'high',
            { 
              ip: clientIP,
              reason: validation.reason,
              path: req.path
            },
            req.security?.userId,
            { ipAddress: clientIP, userAgent: req.get('User-Agent') }
          );

          return res.status(403).json({
            error: 'Access denied',
            reason: validation.reason
          });
        }

        next();
      } catch (error) {
        await auditLogger.logSecurityEvent(
          'ip_validation_error',
          'high',
          { error: error instanceof Error ? error.message : 'Unknown error' },
          req.security?.userId
        );
        next(); // Continue on IP validation errors
      }
    };
  }

  // Security headers middleware
  static securityHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Basic security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      // HSTS (if HTTPS)
      if (req.secure) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      }

      // CSP (Content Security Policy)
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' wss: https:",
        "media-src 'self'",
        "object-src 'none'",
        "frame-src 'none'"
      ].join('; ');
      
      res.setHeader('Content-Security-Policy', csp);

      next();
    };
  }

  // Data access logging middleware
  static logDataAccess(resourceType: string) {
    return async (req: SecureRequest, res: Response, next: NextFunction) => {
      const originalSend = res.send;
      
      res.send = function(data: any) {
        const success = res.statusCode < 400;
        const userId = req.security?.userId;
        const resourceId = req.params.id || req.query.id || 'unknown';

        if (userId) {
          auditLogger.logDataAccess(
            userId,
            resourceType,
            resourceId as string,
            `${req.method} ${req.path}`,
            success ? 'success' : 'failure',
            {
              statusCode: res.statusCode,
              method: req.method,
              path: req.path,
              query: req.query,
              params: req.params
            }
          );
        }

        return originalSend.call(this, data);
      };

      next();
    };
  }

  // Helper methods
  private static async validateToken(token: string): Promise<string | null> {
    // Simplified token validation - in production use proper JWT validation
    try {
      // Mock validation - replace with actual JWT verification
      if (token.startsWith('valid_')) {
        return token.replace('valid_', '');
      }
      return null;
    } catch {
      return null;
    }
  }

  private static async getUserPermissions(userId: string): Promise<string[]> {
    // Mock permissions - in production, fetch from database
    const mockPermissions: Record<string, string[]> = {
      'admin': ['admin', 'read', 'write', 'delete'],
      'user': ['read', 'write'],
      'guest': ['read']
    };

    return mockPermissions[userId] || ['read'];
  }
}

// Convenience middleware combinations
export const securityMiddleware = {
  // Basic security for all routes
  basic: [
    SecurityMiddleware.securityHeaders(),
    SecurityMiddleware.validateIP(),
    SecurityMiddleware.rateLimit()
  ],

  // Authentication required
  authenticated: [
    ...securityMiddleware.basic,
    SecurityMiddleware.authenticate(true)
  ],

  // Content validation for user input
  userContent: [
    ...securityMiddleware.authenticated,
    SecurityMiddleware.validateContent()
  ],

  // File upload security
  fileUpload: [
    ...securityMiddleware.authenticated,
    SecurityMiddleware.validateFileUpload()
  ],

  // Admin routes
  admin: [
    ...securityMiddleware.authenticated,
    SecurityMiddleware.authorize(['admin'])
  ],

  // Privacy-sensitive operations
  privacySensitive: (purpose: string) => [
    ...securityMiddleware.authenticated,
    SecurityMiddleware.requireConsent(purpose)
  ],

  // Data access logging
  dataAccess: (resourceType: string) => [
    ...securityMiddleware.authenticated,
    SecurityMiddleware.logDataAccess(resourceType)
  ]
};

export default SecurityMiddleware;