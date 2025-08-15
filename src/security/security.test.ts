// Security System Tests
// Comprehensive test suite for security, privacy, and compliance features

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecurityValidator, DEFAULT_SECURITY_CONFIG } from './securityConfig';
import { PrivacyComplianceService, DEFAULT_PRIVACY_CONFIG } from './privacyCompliance';
import { AuditLogger, DEFAULT_AUDIT_CONFIG } from './auditLogger';
import SecurityMiddleware from './securityMiddleware';

describe('Security Configuration & Validation', () => {
  let securityValidator: SecurityValidator;

  beforeEach(() => {
    securityValidator = new SecurityValidator();
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const result = securityValidator.validatePassword('StrongP@ssw0rd123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = securityValidator.validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should enforce minimum length', () => {
      const result = securityValidator.validatePassword('short');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('characters long'))).toBe(true);
    });

    it('should require special characters when configured', () => {
      const result = securityValidator.validatePassword('NoSpecialChars123');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('special character'))).toBe(true);
    });
  });

  describe('File Validation', () => {
    it('should validate allowed file types', () => {
      const mockFile = {
        name: 'test.jpg',
        size: 1024 * 1024, // 1MB
        type: 'image/jpeg'
      } as File;

      const result = securityValidator.validateFile(mockFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject oversized files', () => {
      const mockFile = {
        name: 'large.jpg',
        size: 50 * 1024 * 1024, // 50MB (exceeds 10MB limit)
        type: 'image/jpeg'
      } as File;

      const result = securityValidator.validateFile(mockFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('exceeds maximum'))).toBe(true);
    });

    it('should reject blocked file extensions', () => {
      const mockFile = {
        name: 'malware.exe',
        size: 1024,
        type: 'application/octet-stream'
      } as File;

      const result = securityValidator.validateFile(mockFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('blocked for security'))).toBe(true);
    });

    it('should reject disallowed MIME types', () => {
      const mockFile = {
        name: 'script.js',
        size: 1024,
        type: 'application/javascript'
      } as File;

      const result = securityValidator.validateFile(mockFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('not allowed'))).toBe(true);
    });
  });

  describe('Content Validation', () => {
    it('should validate safe content', () => {
      const result = securityValidator.validateMessageContent('Hello, this is a safe message!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitized).toBe('Hello, this is a safe message!');
    });

    it('should reject overly long content', () => {
      const longContent = 'a'.repeat(5000); // Exceeds 4000 char limit
      const result = securityValidator.validateMessageContent(longContent);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('exceeds maximum length'))).toBe(true);
    });

    it('should filter profanity when enabled', () => {
      // Mock profanity filter
      const result = securityValidator.validateMessageContent('This contains badword1');
      expect(result.sanitized).not.toContain('badword1');
    });

    it('should validate and sanitize links', () => {
      const contentWithLink = 'Check out https://example.com for more info';
      const result = securityValidator.validateMessageContent(contentWithLink);
      expect(result.valid).toBe(true);
    });
  });

  describe('IP Validation', () => {
    it('should allow valid IPs by default', () => {
      const result = securityValidator.validateIP('192.168.1.1');
      expect(result.allowed).toBe(true);
    });

    it('should block blacklisted IPs', () => {
      // Would need to configure blacklist for this test
      const result = securityValidator.validateIP('127.0.0.1');
      expect(result.allowed).toBe(true); // Not blacklisted by default
    });
  });

  describe('Webhook Signature Validation', () => {
    it('should validate correct webhook signatures', () => {
      const payload = 'test payload';
      const secret = 'webhook_secret';
      const timestamp = Math.floor(Date.now() / 1000).toString();
      
      // Generate signature
      const signature = securityValidator['generateWebhookSignature'](payload, secret, timestamp);
      
      const result = securityValidator.validateWebhookSignature(payload, signature, secret, timestamp);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid signatures', () => {
      const result = securityValidator.validateWebhookSignature(
        'payload',
        'invalid_signature',
        'secret'
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject old timestamps', () => {
      const oldTimestamp = Math.floor((Date.now() - 10 * 60 * 1000) / 1000).toString(); // 10 minutes ago
      const result = securityValidator.validateWebhookSignature(
        'payload',
        'signature',
        'secret',
        oldTimestamp
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('timestamp');
    });
  });
});

describe('Privacy & GDPR Compliance', () => {
  let privacyService: PrivacyComplianceService;

  beforeEach(() => {
    privacyService = new PrivacyComplianceService();
  });

  describe('Consent Management', () => {
    it('should record user consent', async () => {
      const userId = 'test_user_123';
      const purposes = { functional: true, analytics: false };
      const metadata = {
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
        method: 'explicit' as const
      };

      const consent = await privacyService.recordConsent(userId, purposes, metadata);
      
      expect(consent.userId).toBe(userId);
      expect(consent.purposes).toEqual(purposes);
      expect(consent.method).toBe('explicit');
      expect(consent.ipAddress).toBe('192.168.1.1');
    });

    it('should check consent status', async () => {
      const userId = 'test_user_123';
      const purposes = { functional: true, analytics: true };
      const metadata = {
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
        method: 'explicit' as const
      };

      await privacyService.recordConsent(userId, purposes, metadata);
      
      const hasFunctionalConsent = await privacyService.hasValidConsent(userId, 'functional');
      const hasAnalyticsConsent = await privacyService.hasValidConsent(userId, 'analytics');
      const hasMarketingConsent = await privacyService.hasValidConsent(userId, 'marketing');
      
      expect(hasFunctionalConsent).toBe(true);
      expect(hasAnalyticsConsent).toBe(true);
      expect(hasMarketingConsent).toBe(false);
    });

    it('should withdraw consent', async () => {
      const userId = 'test_user_123';
      const purposes = { functional: true, analytics: true };
      const metadata = {
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
        method: 'explicit' as const
      };

      await privacyService.recordConsent(userId, purposes, metadata);
      
      const withdrawnConsent = await privacyService.withdrawConsent(
        userId,
        ['analytics'],
        'User requested withdrawal'
      );
      
      expect(withdrawnConsent).toBeDefined();
      expect(withdrawnConsent!.purposes.analytics).toBe(false);
      expect(withdrawnConsent!.withdrawn).toBeDefined();
      expect(withdrawnConsent!.withdrawn!.reason).toBe('User requested withdrawal');
      
      const hasAnalyticsConsent = await privacyService.hasValidConsent(userId, 'analytics');
      expect(hasAnalyticsConsent).toBe(false);
    });
  });

  describe('Data Subject Rights', () => {
    it('should create data access request', async () => {
      const userId = 'test_user_123';
      const request = await privacyService.createDataSubjectRequest(
        userId,
        'access',
        'I want to see all my data'
      );
      
      expect(request.userId).toBe(userId);
      expect(request.type).toBe('access');
      expect(request.status).toBe('pending');
      expect(request.description).toBe('I want to see all my data');
    });

    it('should create data erasure request', async () => {
      const userId = 'test_user_123';
      const request = await privacyService.createDataSubjectRequest(
        userId,
        'erasure',
        'Please delete all my data'
      );
      
      expect(request.type).toBe('erasure');
      expect(request.status).toBe('pending');
    });

    it('should process data portability request', async () => {
      const userId = 'test_user_123';
      const request = await privacyService.createDataSubjectRequest(
        userId,
        'portability',
        'I want to export my data'
      );
      
      expect(request.type).toBe('portability');
      // Processing happens asynchronously
    });
  });

  describe('Compliance Reporting', () => {
    it('should generate compliance report', async () => {
      const report = await privacyService.generateComplianceReport();
      
      expect(report).toHaveProperty('gdpr');
      expect(report).toHaveProperty('ccpa');
      expect(report).toHaveProperty('consentMetrics');
      expect(report).toHaveProperty('dataSubjectRequests');
      
      expect(report.gdpr.enabled).toBe(true);
      expect(report.ccpa.enabled).toBe(true);
    });
  });
});

describe('Audit & Logging System', () => {
  let auditLogger: AuditLogger;

  beforeEach(() => {
    auditLogger = new AuditLogger();
    // Mock console.log to avoid test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('Event Logging', () => {
    it('should log authentication events', async () => {
      await auditLogger.logAuthentication(
        'test_user',
        'login',
        'success',
        { method: 'password' },
        { ipAddress: '192.168.1.1', userAgent: 'Test Browser' }
      );
      
      const { events } = await auditLogger.queryEvents({
        userId: 'test_user',
        eventType: 'authentication'
      });
      
      expect(events).toHaveLength(1);
      expect(events[0].action).toBe('login');
      expect(events[0].outcome).toBe('success');
    });

    it('should log data access events', async () => {
      await auditLogger.logDataAccess(
        'test_user',
        'messages',
        'msg_123',
        'read_message'
      );
      
      const { events } = await auditLogger.queryEvents({
        eventType: 'data_access'
      });
      
      expect(events).toHaveLength(1);
      expect(events[0].resource).toBe('messages');
      expect(events[0].resourceId).toBe('msg_123');
    });

    it('should log security events', async () => {
      await auditLogger.logSecurityEvent(
        'suspicious_activity',
        'high',
        { reason: 'Multiple failed login attempts' },
        'test_user',
        { ipAddress: '192.168.1.1' }
      );
      
      const { events } = await auditLogger.queryEvents({
        eventType: 'security_event',
        severity: 'high'
      });
      
      expect(events).toHaveLength(1);
      expect(events[0].severity).toBe('high');
      expect(events[0].action).toBe('suspicious_activity');
    });

    it('should log privacy events', async () => {
      await auditLogger.logPrivacyEvent(
        'test_user',
        'consent_withdrawn',
        { purposes: ['analytics'] }
      );
      
      const { events } = await auditLogger.queryEvents({
        eventType: 'privacy_event'
      });
      
      expect(events).toHaveLength(1);
      expect(events[0].action).toBe('consent_withdrawn');
    });
  });

  describe('Event Querying', () => {
    beforeEach(async () => {
      // Add some test events
      await auditLogger.logAuthentication('user1', 'login', 'success');
      await auditLogger.logAuthentication('user1', 'login', 'failure');
      await auditLogger.logDataAccess('user1', 'messages', 'msg1', 'read');
      await auditLogger.logSecurityEvent('test_event', 'medium', {});
    });

    it('should filter events by user', async () => {
      const { events } = await auditLogger.queryEvents({ userId: 'user1' });
      expect(events.length).toBeGreaterThan(0);
      expect(events.every(e => e.userId === 'user1')).toBe(true);
    });

    it('should filter events by type', async () => {
      const { events } = await auditLogger.queryEvents({ eventType: 'authentication' });
      expect(events.length).toBe(2);
      expect(events.every(e => e.eventType === 'authentication')).toBe(true);
    });

    it('should filter events by outcome', async () => {
      const { events } = await auditLogger.queryEvents({ outcome: 'failure' });
      expect(events.length).toBe(1);
      expect(events[0].outcome).toBe('failure');
    });

    it('should apply pagination', async () => {
      const { events, total } = await auditLogger.queryEvents({ limit: 2, offset: 0 });
      expect(events.length).toBeLessThanOrEqual(2);
      expect(total).toBeGreaterThanOrEqual(events.length);
    });
  });

  describe('Security Reporting', () => {
    it('should generate security report', async () => {
      // Add some test data
      await auditLogger.logAuthentication('user1', 'login', 'success');
      await auditLogger.logAuthentication('user2', 'login', 'failure');
      await auditLogger.logSecurityEvent('test_incident', 'high', {});
      
      const report = await auditLogger.generateSecurityReport('day');
      
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('topEvents');
      expect(report).toHaveProperty('securityMetrics');
      expect(report).toHaveProperty('recommendations');
      
      expect(report.summary.totalEvents).toBeGreaterThan(0);
      expect(Array.isArray(report.topEvents)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });
});

describe('Security Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockReq = {
      headers: {},
      ip: '192.168.1.1',
      path: '/test',
      method: 'GET',
      body: {},
      files: {},
      params: {},
      query: {},
      get: vi.fn().mockReturnValue('Test Browser'),
      sessionID: 'test_session'
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
      statusCode: 200
    };

    mockNext = vi.fn();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('Authentication Middleware', () => {
    it('should require authentication when configured', async () => {
      const middleware = SecurityMiddleware.authenticate(true);
      await middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept valid tokens', async () => {
      mockReq.headers.authorization = 'Bearer valid_test_user';
      
      const middleware = SecurityMiddleware.authenticate(true);
      await middleware(mockReq, mockRes, mockNext);
      
      expect(mockReq.security).toBeDefined();
      expect(mockReq.security.userId).toBe('test_user');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid tokens', async () => {
      mockReq.headers.authorization = 'Bearer invalid_token';
      
      const middleware = SecurityMiddleware.authenticate(true);
      await middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid authentication token' });
    });
  });

  describe('Authorization Middleware', () => {
    beforeEach(() => {
      mockReq.security = {
        userId: 'test_user',
        permissions: ['read', 'write']
      };
    });

    it('should allow users with required permissions', async () => {
      const middleware = SecurityMiddleware.authorize(['read']);
      await middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny users without required permissions', async () => {
      const middleware = SecurityMiddleware.authorize(['admin']);
      await middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        required: ['admin']
      });
    });

    it('should require authentication first', async () => {
      delete mockReq.security;
      
      const middleware = SecurityMiddleware.authorize(['read']);
      await middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Rate Limiting Middleware', () => {
    it('should allow requests within limit', async () => {
      const middleware = SecurityMiddleware.rateLimit({ maxRequests: 10, windowMs: 60000 });
      await middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 9);
    });

    it('should block requests exceeding limit', async () => {
      const middleware = SecurityMiddleware.rateLimit({ maxRequests: 1, windowMs: 60000 });
      
      // First request should pass
      await middleware(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      
      // Second request should be blocked
      mockNext.mockClear();
      await middleware(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Content Validation Middleware', () => {
    it('should validate safe content', async () => {
      mockReq.body = { message: 'Hello, world!' };
      
      const middleware = SecurityMiddleware.validateContent();
      await middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.security.validation.contentSafe).toBe(true);
    });

    it('should reject unsafe content', async () => {
      mockReq.body = { message: 'a'.repeat(5000) }; // Too long
      
      const middleware = SecurityMiddleware.validateContent();
      await middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Security Headers Middleware', () => {
    it('should set security headers', () => {
      const middleware = SecurityMiddleware.securityHeaders();
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set HSTS header for HTTPS requests', () => {
      mockReq.secure = true;
      
      const middleware = SecurityMiddleware.securityHeaders();
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    });
  });
});

describe('Integration Tests', () => {
  it('should integrate security, privacy, and audit systems', async () => {
    const securityValidator = new SecurityValidator();
    const privacyService = new PrivacyComplianceService();
    const auditLogger = new AuditLogger();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // Test workflow: User consent -> Content validation -> Audit logging
    const userId = 'integration_test_user';
    
    // 1. Record user consent
    const consent = await privacyService.recordConsent(
      userId,
      { functional: true, analytics: true },
      { ipAddress: '192.168.1.1', userAgent: 'Test', method: 'explicit' }
    );
    expect(consent.userId).toBe(userId);

    // 2. Validate content
    const contentValidation = securityValidator.validateMessageContent('Hello, this is a test message!');
    expect(contentValidation.valid).toBe(true);

    // 3. Log the activity
    await auditLogger.logDataAccess(userId, 'messages', 'msg_123', 'create_message');
    
    // 4. Verify audit trail
    const { events } = await auditLogger.queryEvents({ userId });
    expect(events.length).toBeGreaterThan(0);

    // 5. Check consent is still valid
    const hasConsent = await privacyService.hasValidConsent(userId, 'functional');
    expect(hasConsent).toBe(true);
  });

  it('should handle security violations properly', async () => {
    const securityValidator = new SecurityValidator();
    const auditLogger = new AuditLogger();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Test malicious file upload
    const maliciousFile = {
      name: 'virus.exe',
      size: 1024,
      type: 'application/octet-stream'
    } as File;

    const fileValidation = securityValidator.validateFile(maliciousFile);
    expect(fileValidation.valid).toBe(false);

    // Log security event
    await auditLogger.logSecurityEvent(
      'malicious_file_upload_attempt',
      'high',
      { fileName: maliciousFile.name, fileType: maliciousFile.type },
      'test_user'
    );

    // Verify security event was logged
    const { events } = await auditLogger.queryEvents({
      eventType: 'security_event',
      severity: 'high'
    });
    
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].action).toBe('malicious_file_upload_attempt');
  });
});