// Audit & Logging System
// Comprehensive security audit logging and monitoring

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  eventType: AuditEventType;
  category: AuditCategory;
  severity: AuditSeverity;
  action: string;
  resource?: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  outcome: 'success' | 'failure' | 'warning';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export type AuditEventType = 
  | 'authentication'
  | 'authorization' 
  | 'data_access'
  | 'data_modification'
  | 'data_deletion'
  | 'system_access'
  | 'configuration_change'
  | 'security_event'
  | 'privacy_event'
  | 'compliance_event';

export type AuditCategory = 
  | 'security'
  | 'privacy'
  | 'data'
  | 'system'
  | 'user'
  | 'admin'
  | 'compliance';

export type AuditSeverity = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export interface AuditConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  retentionDays: number;
  realTimeAlerts: boolean;
  encryptLogs: boolean;
  logPersonalData: boolean;
  
  // Event filtering
  enabledCategories: AuditCategory[];
  enabledEventTypes: AuditEventType[];
  minimumSeverity: AuditSeverity;
  
  // Storage configuration
  storage: {
    type: 'file' | 'database' | 'external';
    location: string;
    rotationSize: number; // MB
    compressionEnabled: boolean;
  };
  
  // Alert configuration
  alerts: {
    enabled: boolean;
    channels: ('email' | 'webhook' | 'sms')[];
    thresholds: {
      failedLogins: number;
      dataAccess: number;
      securityEvents: number;
    };
    recipients: string[];
  };
}

export const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  enabled: true,
  logLevel: 'info',
  retentionDays: 2555, // 7 years for compliance
  realTimeAlerts: true,
  encryptLogs: true,
  logPersonalData: false,
  
  enabledCategories: ['security', 'privacy', 'data', 'system', 'compliance'],
  enabledEventTypes: [
    'authentication', 'authorization', 'data_access', 'data_modification',
    'data_deletion', 'security_event', 'privacy_event', 'compliance_event'
  ],
  minimumSeverity: 'low',
  
  storage: {
    type: 'file',
    location: './logs/audit',
    rotationSize: 100, // 100MB
    compressionEnabled: true
  },
  
  alerts: {
    enabled: true,
    channels: ['email', 'webhook'],
    thresholds: {
      failedLogins: 5,
      dataAccess: 100,
      securityEvents: 1
    },
    recipients: ['security@sakudojo.com', 'admin@sakudojo.com']
  }
};

// Audit logger service
export class AuditLogger {
  private config: AuditConfig;
  private eventBuffer: AuditEvent[] = [];
  private alertCounts: Map<string, number> = new Map();

  constructor(config: AuditConfig = DEFAULT_AUDIT_CONFIG) {
    this.config = config;
    this.initializeLogger();
  }

  private initializeLogger(): void {
    if (!this.config.enabled) {
      return;
    }

    // Set up log rotation and cleanup
    setInterval(() => {
      this.rotateLogsIfNeeded();
      this.cleanupOldLogs();
    }, 60 * 60 * 1000); // Check every hour

    console.log('[Audit] Audit logger initialized');
  }

  // Main logging method
  async logEvent(event: Partial<AuditEvent>): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // Check if event should be logged
    if (!this.shouldLogEvent(event)) {
      return;
    }

    // Create complete audit event
    const auditEvent: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      outcome: 'success',
      details: {},
      ...event
    } as AuditEvent;

    // Sanitize personal data if needed
    if (!this.config.logPersonalData) {
      auditEvent.details = this.sanitizePersonalData(auditEvent.details);
    }

    // Add to buffer
    this.eventBuffer.push(auditEvent);

    // Process event
    await this.processEvent(auditEvent);

    // Check for alerts
    if (this.config.alerts.enabled) {
      await this.checkAlertThresholds(auditEvent);
    }

    // Flush buffer if needed
    if (this.eventBuffer.length >= 100) {
      await this.flushBuffer();
    }
  }

  // Convenience methods for common events
  async logAuthentication(
    userId: string,
    action: string,
    outcome: 'success' | 'failure',
    details: Record<string, any> = {},
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType: 'authentication',
      category: 'security',
      severity: outcome === 'failure' ? 'medium' : 'low',
      action,
      outcome,
      details,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent
    });
  }

  async logDataAccess(
    userId: string,
    resource: string,
    resourceId: string,
    action: string,
    outcome: 'success' | 'failure' = 'success',
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType: 'data_access',
      category: 'data',
      severity: 'low',
      action,
      resource,
      resourceId,
      outcome,
      details
    });
  }

  async logDataModification(
    userId: string,
    resource: string,
    resourceId: string,
    action: string,
    changes: Record<string, any>,
    outcome: 'success' | 'failure' = 'success'
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType: 'data_modification',
      category: 'data',
      severity: 'medium',
      action,
      resource,
      resourceId,
      outcome,
      details: { changes }
    });
  }

  async logSecurityEvent(
    eventType: string,
    severity: AuditSeverity,
    details: Record<string, any>,
    userId?: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType: 'security_event',
      category: 'security',
      severity,
      action: eventType,
      outcome: 'warning',
      details,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent
    });
  }

  async logPrivacyEvent(
    userId: string,
    action: string,
    details: Record<string, any>,
    outcome: 'success' | 'failure' = 'success'
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType: 'privacy_event',
      category: 'privacy',
      severity: 'medium',
      action,
      outcome,
      details
    });
  }

  async logComplianceEvent(
    action: string,
    details: Record<string, any>,
    severity: AuditSeverity = 'medium',
    userId?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType: 'compliance_event',
      category: 'compliance',
      severity,
      action,
      outcome: 'success',
      details
    });
  }

  // Query and reporting methods
  async queryEvents(filters: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    eventType?: AuditEventType;
    category?: AuditCategory;
    severity?: AuditSeverity;
    outcome?: 'success' | 'failure' | 'warning';
    limit?: number;
    offset?: number;
  }): Promise<{ events: AuditEvent[]; total: number }> {
    // In production, would query from persistent storage
    let filteredEvents = [...this.eventBuffer];

    // Apply filters
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) <= endDate);
    }

    if (filters.userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === filters.userId);
    }

    if (filters.eventType) {
      filteredEvents = filteredEvents.filter(e => e.eventType === filters.eventType);
    }

    if (filters.category) {
      filteredEvents = filteredEvents.filter(e => e.category === filters.category);
    }

    if (filters.severity) {
      filteredEvents = filteredEvents.filter(e => e.severity === filters.severity);
    }

    if (filters.outcome) {
      filteredEvents = filteredEvents.filter(e => e.outcome === filters.outcome);
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const total = filteredEvents.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 100;
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    return {
      events: paginatedEvents,
      total
    };
  }

  async generateSecurityReport(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    summary: any;
    topEvents: any[];
    securityMetrics: any;
    recommendations: string[];
  }> {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
    }

    const { events } = await this.queryEvents({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      category: 'security'
    });

    // Generate summary
    const summary = {
      totalEvents: events.length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      highSeverityEvents: events.filter(e => e.severity === 'high').length,
      failedAuthentications: events.filter(e => 
        e.eventType === 'authentication' && e.outcome === 'failure'
      ).length,
      securityIncidents: events.filter(e => e.eventType === 'security_event').length
    };

    // Top events by frequency
    const eventCounts = new Map<string, number>();
    events.forEach(event => {
      const key = `${event.eventType}:${event.action}`;
      eventCounts.set(key, (eventCounts.get(key) || 0) + 1);
    });

    const topEvents = Array.from(eventCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([event, count]) => ({ event, count }));

    // Security metrics
    const securityMetrics = {
      authenticationSuccessRate: this.calculateSuccessRate(events, 'authentication'),
      dataAccessPatterns: this.analyzeDataAccessPatterns(events),
      suspiciousActivities: this.detectSuspiciousActivities(events)
    };

    // Generate recommendations
    const recommendations = this.generateSecurityRecommendations(summary, securityMetrics);

    return {
      summary,
      topEvents,
      securityMetrics,
      recommendations
    };
  }

  // Private helper methods
  private shouldLogEvent(event: Partial<AuditEvent>): boolean {
    if (!event.category || !this.config.enabledCategories.includes(event.category)) {
      return false;
    }

    if (!event.eventType || !this.config.enabledEventTypes.includes(event.eventType)) {
      return false;
    }

    if (event.severity && !this.meetsSeverityThreshold(event.severity)) {
      return false;
    }

    return true;
  }

  private meetsSeverityThreshold(severity: AuditSeverity): boolean {
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const eventLevel = severityLevels[severity];
    const thresholdLevel = severityLevels[this.config.minimumSeverity];
    return eventLevel >= thresholdLevel;
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizePersonalData(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };
    const personalDataFields = ['email', 'name', 'phone', 'address', 'ssn', 'creditCard'];
    
    personalDataFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private async processEvent(event: AuditEvent): Promise<void> {
    // In production, would write to persistent storage
    console.log(`[Audit] ${event.severity.toUpperCase()}: ${event.category}/${event.eventType} - ${event.action}`);
    
    if (event.severity === 'critical' || event.severity === 'high') {
      console.warn('[Audit] High severity event:', event);
    }
  }

  private async checkAlertThresholds(event: AuditEvent): Promise<void> {
    const alertKey = `${event.eventType}:${event.action}`;
    const currentCount = this.alertCounts.get(alertKey) || 0;
    this.alertCounts.set(alertKey, currentCount + 1);

    // Check thresholds
    if (event.eventType === 'authentication' && event.outcome === 'failure') {
      if (currentCount >= this.config.alerts.thresholds.failedLogins) {
        await this.sendAlert('Failed Login Threshold Exceeded', event);
      }
    }

    if (event.eventType === 'security_event') {
      if (currentCount >= this.config.alerts.thresholds.securityEvents) {
        await this.sendAlert('Security Event Threshold Exceeded', event);
      }
    }

    // Reset counts periodically
    setTimeout(() => {
      this.alertCounts.delete(alertKey);
    }, 60 * 60 * 1000); // Reset after 1 hour
  }

  private async sendAlert(alertType: string, event: AuditEvent): Promise<void> {
    console.log(`[Audit] ALERT: ${alertType}`, event);
    
    // In production, would send actual alerts via configured channels
    if (this.config.alerts.channels.includes('email')) {
      // Send email alert
    }
    
    if (this.config.alerts.channels.includes('webhook')) {
      // Send webhook alert
    }
  }

  private async flushBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    // In production, would batch write to persistent storage
    console.log(`[Audit] Flushing ${this.eventBuffer.length} events to storage`);
    this.eventBuffer = [];
  }

  private rotateLogsIfNeeded(): void {
    // In production, would check file sizes and rotate logs
    console.log('[Audit] Checking log rotation...');
  }

  private cleanupOldLogs(): void {
    // In production, would delete logs older than retention period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
    console.log(`[Audit] Cleaning up logs older than ${cutoffDate.toISOString()}`);
  }

  private calculateSuccessRate(events: AuditEvent[], eventType: AuditEventType): number {
    const relevantEvents = events.filter(e => e.eventType === eventType);
    if (relevantEvents.length === 0) return 100;
    
    const successfulEvents = relevantEvents.filter(e => e.outcome === 'success');
    return (successfulEvents.length / relevantEvents.length) * 100;
  }

  private analyzeDataAccessPatterns(events: AuditEvent[]): any {
    const dataAccessEvents = events.filter(e => e.eventType === 'data_access');
    
    return {
      totalAccesses: dataAccessEvents.length,
      uniqueUsers: new Set(dataAccessEvents.map(e => e.userId)).size,
      topResources: this.getTopResources(dataAccessEvents),
      accessTimes: this.analyzeAccessTimes(dataAccessEvents)
    };
  }

  private getTopResources(events: AuditEvent[]): any[] {
    const resourceCounts = new Map<string, number>();
    
    events.forEach(event => {
      if (event.resource) {
        resourceCounts.set(event.resource, (resourceCounts.get(event.resource) || 0) + 1);
      }
    });

    return Array.from(resourceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([resource, count]) => ({ resource, count }));
  }

  private analyzeAccessTimes(events: AuditEvent[]): any {
    const hourCounts = new Array(24).fill(0);
    
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour]++;
    });

    return {
      peakHour: hourCounts.indexOf(Math.max(...hourCounts)),
      hourlyDistribution: hourCounts
    };
  }

  private detectSuspiciousActivities(events: AuditEvent[]): string[] {
    const suspicious: string[] = [];
    
    // Check for multiple failed logins
    const failedLogins = events.filter(e => 
      e.eventType === 'authentication' && e.outcome === 'failure'
    );
    
    if (failedLogins.length > 10) {
      suspicious.push(`High number of failed login attempts: ${failedLogins.length}`);
    }

    // Check for unusual access patterns
    const accessEvents = events.filter(e => e.eventType === 'data_access');
    const uniqueIPs = new Set(accessEvents.map(e => e.ipAddress).filter(Boolean));
    
    if (uniqueIPs.size > 20) {
      suspicious.push(`Access from many different IP addresses: ${uniqueIPs.size}`);
    }

    return suspicious;
  }

  private generateSecurityRecommendations(summary: any, metrics: any): string[] {
    const recommendations: string[] = [];

    if (summary.failedAuthentications > 50) {
      recommendations.push('Consider implementing additional authentication security measures');
    }

    if (summary.criticalEvents > 0) {
      recommendations.push('Review and address all critical security events immediately');
    }

    if (metrics.authenticationSuccessRate < 90) {
      recommendations.push('Investigate causes of authentication failures');
    }

    if (metrics.suspiciousActivities.length > 0) {
      recommendations.push('Investigate suspicious activities detected in the system');
    }

    return recommendations;
  }
}

// Export singleton logger
export const auditLogger = new AuditLogger();

// Audit middleware for Express
export const auditMiddleware = {
  // Log all requests
  logRequest: (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    res.on('finish', async () => {
      const duration = Date.now() - startTime;
      const userId = req.user?.id;
      
      await auditLogger.logEvent({
        userId,
        eventType: 'system_access',
        category: 'system',
        severity: 'low',
        action: `${req.method} ${req.path}`,
        outcome: res.statusCode < 400 ? 'success' : 'failure',
        details: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          userAgent: req.get('User-Agent')
        },
        ipAddress: req.ip
      });
    });
    
    next();
  },

  // Log authentication events
  logAuth: (action: string) => {
    return async (req: any, res: any, next: any) => {
      const originalSend = res.send;
      
      res.send = function(data: any) {
        const success = res.statusCode < 400;
        const userId = req.user?.id || req.body?.userId || req.body?.email;
        
        auditLogger.logAuthentication(
          userId,
          action,
          success ? 'success' : 'failure',
          { statusCode: res.statusCode },
          { ipAddress: req.ip, userAgent: req.get('User-Agent') }
        );
        
        return originalSend.call(this, data);
      };
      
      next();
    };
  }
};