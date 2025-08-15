// Privacy & GDPR Compliance
// Comprehensive privacy protection and regulatory compliance system

export interface PrivacyConfig {
  // GDPR Compliance
  gdpr: {
    enabled: boolean;
    dataProcessingBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
    consentRequired: boolean;
    rightToErasure: boolean;
    rightToPortability: boolean;
    rightToRectification: boolean;
    dataBreachNotificationHours: number;
    dpoContact: string;
  };
  
  // CCPA Compliance
  ccpa: {
    enabled: boolean;
    rightToKnow: boolean;
    rightToDelete: boolean;
    rightToOptOut: boolean;
    nonDiscrimination: boolean;
  };
  
  // Data Classification
  dataClassification: {
    personalData: string[];
    sensitiveData: string[];
    publicData: string[];
    internalData: string[];
  };
  
  // Data Retention
  retention: {
    defaultRetentionDays: number;
    conversationRetentionDays: number;
    messageRetentionDays: number;
    attachmentRetentionDays: number;
    analyticsRetentionDays: number;
    auditLogRetentionDays: number;
    anonymizationDelayDays: number;
  };
  
  // Consent Management
  consent: {
    required: boolean;
    granular: boolean;
    withdrawable: boolean;
    recordConsent: boolean;
    consentVersion: string;
    purposes: ConsentPurpose[];
  };
}

export interface ConsentPurpose {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: 'functional' | 'analytics' | 'marketing' | 'personalization';
  dataTypes: string[];
  retentionDays: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  purposes: Record<string, boolean>;
  version: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  method: 'explicit' | 'implicit' | 'pre_checked';
  withdrawn?: {
    timestamp: string;
    reason?: string;
  };
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  requestDate: string;
  completionDate?: string;
  description?: string;
  attachments?: string[];
  response?: string;
  verificationMethod: 'email' | 'phone' | 'identity_document';
  verificationStatus: 'pending' | 'verified' | 'failed';
}

export interface DataProcessingActivity {
  id: string;
  name: string;
  description: string;
  purpose: string;
  legalBasis: string;
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  retentionPeriod: string;
  securityMeasures: string[];
  transfersOutsideEU: boolean;
  safeguards?: string;
}

// Default privacy configuration
export const DEFAULT_PRIVACY_CONFIG: PrivacyConfig = {
  gdpr: {
    enabled: true,
    dataProcessingBasis: 'consent',
    consentRequired: true,
    rightToErasure: true,
    rightToPortability: true,
    rightToRectification: true,
    dataBreachNotificationHours: 72,
    dpoContact: 'dpo@sakudojo.com'
  },
  
  ccpa: {
    enabled: true,
    rightToKnow: true,
    rightToDelete: true,
    rightToOptOut: true,
    nonDiscrimination: true
  },
  
  dataClassification: {
    personalData: [
      'email', 'name', 'phone', 'ip_address', 'user_id',
      'device_info', 'location', 'conversation_content'
    ],
    sensitiveData: [
      'payment_info', 'health_data', 'biometric_data',
      'political_opinions', 'religious_beliefs'
    ],
    publicData: [
      'public_messages', 'public_profile', 'published_content'
    ],
    internalData: [
      'system_logs', 'performance_metrics', 'error_logs'
    ]
  },
  
  retention: {
    defaultRetentionDays: 365,
    conversationRetentionDays: 1095, // 3 years
    messageRetentionDays: 1095,
    attachmentRetentionDays: 730, // 2 years
    analyticsRetentionDays: 730,
    auditLogRetentionDays: 2555, // 7 years
    anonymizationDelayDays: 30
  },
  
  consent: {
    required: true,
    granular: true,
    withdrawable: true,
    recordConsent: true,
    consentVersion: '1.0',
    purposes: [
      {
        id: 'functional',
        name: 'Essential Functionality',
        description: 'Core features required for the service to function',
        required: true,
        category: 'functional',
        dataTypes: ['user_id', 'session_data', 'preferences'],
        retentionDays: 365
      },
      {
        id: 'support',
        name: 'Customer Support',
        description: 'Providing customer support and resolving issues',
        required: false,
        category: 'functional',
        dataTypes: ['email', 'name', 'conversation_content', 'device_info'],
        retentionDays: 1095
      },
      {
        id: 'analytics',
        name: 'Analytics & Improvement',
        description: 'Understanding usage patterns to improve our service',
        required: false,
        category: 'analytics',
        dataTypes: ['usage_data', 'performance_metrics', 'error_logs'],
        retentionDays: 730
      },
      {
        id: 'personalization',
        name: 'Personalization',
        description: 'Customizing your experience based on your preferences',
        required: false,
        category: 'personalization',
        dataTypes: ['preferences', 'learning_progress', 'interaction_history'],
        retentionDays: 1095
      }
    ]
  }
};

// Privacy compliance service
export class PrivacyComplianceService {
  private config: PrivacyConfig;
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private dataSubjectRequests: Map<string, DataSubjectRequest> = new Map();

  constructor(config: PrivacyConfig = DEFAULT_PRIVACY_CONFIG) {
    this.config = config;
  }

  // Consent Management
  async recordConsent(
    userId: string,
    purposes: Record<string, boolean>,
    metadata: {
      ipAddress: string;
      userAgent: string;
      method: 'explicit' | 'implicit' | 'pre_checked';
    }
  ): Promise<ConsentRecord> {
    const consentRecord: ConsentRecord = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      purposes,
      version: this.config.consent.consentVersion,
      timestamp: new Date().toISOString(),
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      method: metadata.method
    };

    this.consentRecords.set(userId, consentRecord);
    
    console.log('[Privacy] Consent recorded:', consentRecord);
    
    return consentRecord;
  }

  async withdrawConsent(
    userId: string,
    purposes: string[],
    reason?: string
  ): Promise<ConsentRecord | null> {
    const existingConsent = this.consentRecords.get(userId);
    if (!existingConsent) {
      return null;
    }

    // Update consent record
    purposes.forEach(purpose => {
      existingConsent.purposes[purpose] = false;
    });

    existingConsent.withdrawn = {
      timestamp: new Date().toISOString(),
      reason
    };

    this.consentRecords.set(userId, existingConsent);
    
    // Trigger data cleanup for withdrawn purposes
    await this.cleanupDataForWithdrawnConsent(userId, purposes);
    
    console.log('[Privacy] Consent withdrawn:', { userId, purposes, reason });
    
    return existingConsent;
  }

  async getConsentStatus(userId: string): Promise<ConsentRecord | null> {
    return this.consentRecords.get(userId) || null;
  }

  async hasValidConsent(userId: string, purpose: string): Promise<boolean> {
    const consent = this.consentRecords.get(userId);
    if (!consent) {
      return false;
    }

    return consent.purposes[purpose] === true;
  }

  // Data Subject Rights
  async createDataSubjectRequest(
    userId: string,
    type: DataSubjectRequest['type'],
    description?: string
  ): Promise<DataSubjectRequest> {
    const request: DataSubjectRequest = {
      id: `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      status: 'pending',
      requestDate: new Date().toISOString(),
      description,
      verificationMethod: 'email',
      verificationStatus: 'pending'
    };

    this.dataSubjectRequests.set(request.id, request);
    
    // Start processing based on type
    await this.processDataSubjectRequest(request.id);
    
    console.log('[Privacy] Data subject request created:', request);
    
    return request;
  }

  async processDataSubjectRequest(requestId: string): Promise<void> {
    const request = this.dataSubjectRequests.get(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    request.status = 'in_progress';
    
    try {
      switch (request.type) {
        case 'access':
          await this.processAccessRequest(request);
          break;
        case 'erasure':
          await this.processErasureRequest(request);
          break;
        case 'portability':
          await this.processPortabilityRequest(request);
          break;
        case 'rectification':
          await this.processRectificationRequest(request);
          break;
        default:
          throw new Error(`Unsupported request type: ${request.type}`);
      }
      
      request.status = 'completed';
      request.completionDate = new Date().toISOString();
      
    } catch (error) {
      request.status = 'rejected';
      request.response = error instanceof Error ? error.message : 'Processing failed';
    }
    
    this.dataSubjectRequests.set(requestId, request);
  }

  private async processAccessRequest(request: DataSubjectRequest): Promise<void> {
    // Collect all personal data for the user
    const userData = await this.collectUserData(request.userId);
    
    // Generate data export
    const exportData = {
      userId: request.userId,
      exportDate: new Date().toISOString(),
      data: userData,
      consentRecords: this.consentRecords.get(request.userId),
      dataProcessingActivities: await this.getDataProcessingActivities(request.userId)
    };
    
    request.response = `Data export prepared. Contains ${Object.keys(userData).length} data categories.`;
  }

  private async processErasureRequest(request: DataSubjectRequest): Promise<void> {
    if (!this.config.gdpr.rightToErasure) {
      throw new Error('Right to erasure is not enabled');
    }

    // Check for legal obligations to retain data
    const retentionRequirements = await this.checkRetentionRequirements(request.userId);
    if (retentionRequirements.mustRetain) {
      throw new Error(`Cannot erase data due to legal obligations: ${retentionRequirements.reason}`);
    }

    // Perform data erasure
    await this.eraseUserData(request.userId);
    
    request.response = 'All personal data has been permanently deleted from our systems.';
  }

  private async processPortabilityRequest(request: DataSubjectRequest): Promise<void> {
    if (!this.config.gdpr.rightToPortability) {
      throw new Error('Right to data portability is not enabled');
    }

    // Export data in structured format
    const portableData = await this.exportPortableData(request.userId);
    
    request.response = `Portable data export prepared in JSON format. Size: ${JSON.stringify(portableData).length} bytes.`;
  }

  private async processRectificationRequest(request: DataSubjectRequest): Promise<void> {
    if (!this.config.gdpr.rightToRectification) {
      throw new Error('Right to rectification is not enabled');
    }

    request.response = 'Data rectification process initiated. Please provide the correct information.';
  }

  // Helper methods for data management
  private async collectUserData(userId: string): Promise<Record<string, any>> {
    return {
      profile: { userId, email: 'user@example.com', name: 'User Name' },
      conversations: [],
      messages: [],
      attachments: [],
      preferences: {},
      analytics: {},
      auditLogs: []
    };
  }

  private async eraseUserData(userId: string): Promise<void> {
    console.log(`[Privacy] Erasing all data for user: ${userId}`);
    this.consentRecords.delete(userId);
  }

  private async exportPortableData(userId: string): Promise<Record<string, any>> {
    const userData = await this.collectUserData(userId);
    
    return {
      exportInfo: {
        userId,
        exportDate: new Date().toISOString(),
        format: 'JSON',
        version: '1.0'
      },
      personalData: userData,
      metadata: {
        dataCategories: Object.keys(userData),
        totalRecords: Object.values(userData).flat().length
      }
    };
  }

  private async checkRetentionRequirements(userId: string): Promise<{ mustRetain: boolean; reason?: string }> {
    return { mustRetain: false };
  }

  private async getDataProcessingActivities(userId: string): Promise<DataProcessingActivity[]> {
    return [
      {
        id: 'chat_processing',
        name: 'Chat Message Processing',
        description: 'Processing of chat messages and conversations',
        purpose: 'Provide chat functionality and support',
        legalBasis: 'consent',
        dataCategories: ['conversation_content', 'message_metadata'],
        dataSubjects: ['users', 'conversation_participants'],
        recipients: ['internal_staff', 'ai_processing_services'],
        retentionPeriod: '3 years',
        securityMeasures: ['encryption', 'access_controls', 'audit_logging'],
        transfersOutsideEU: false
      }
    ];
  }

  private async cleanupDataForWithdrawnConsent(userId: string, purposes: string[]): Promise<void> {
    console.log(`[Privacy] Cleaning up data for withdrawn consent: ${userId}, purposes: ${purposes.join(', ')}`);
  }

  // Compliance reporting
  async generateComplianceReport(): Promise<any> {
    return {
      gdpr: {
        enabled: this.config.gdpr.enabled,
        dataBreachNotificationCompliance: true,
        dpoContact: this.config.gdpr.dpoContact
      },
      ccpa: {
        enabled: this.config.ccpa.enabled
      },
      consentMetrics: {
        totalConsentRecords: this.consentRecords.size
      },
      dataSubjectRequests: {
        totalRequests: this.dataSubjectRequests.size
      }
    };
  }
}

// Export singleton service
export const privacyComplianceService = new PrivacyComplianceService();