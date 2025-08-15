// Webhook Endpoints
// API endpoints for receiving webhooks from external channels

import { Request, Response } from 'express';
import { messageSyncService } from '../services/messageSyncService';
import { telegramBot } from '../integrations/telegramBot';
import { messengerBot } from '../integrations/messengerIntegration';
import { emailService } from '../integrations/emailIntegration';
import { auditLogger } from '../security/auditLogger';
import { securityValidator } from '../security/securityConfig';

// Telegram webhook endpoint
export const telegramWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-telegram-bot-api-secret-token'] as string;
    const body = JSON.stringify(req.body);

    // Validate webhook signature
    if (!telegramBot.validateWebhook(body, signature)) {
      await auditLogger.logSecurityEvent(
        'webhook_signature_invalid',
        'high',
        { channel: 'telegram', signature: signature?.substring(0, 10) + '...' },
        undefined,
        { ipAddress: req.ip, userAgent: req.get('User-Agent') }
      );
      
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }

    const update = req.body;
    
    // Process the update
    const processedUpdate = telegramBot.processUpdate(update);
    if (!processedUpdate) {
      console.log('[Webhook] Unsupported Telegram update type');
      res.status(200).json({ status: 'ignored' });
      return;
    }

    // Log webhook received
    await auditLogger.logEvent({
      eventType: 'system_access',
      category: 'system',
      severity: 'low',
      action: 'telegram_webhook_received',
      outcome: 'success',
      details: {
        updateId: update.update_id,
        messageType: processedUpdate.type,
        chatId: processedUpdate.chat.id,
        userId: processedUpdate.user?.id
      },
      ipAddress: req.ip
    });

    // Only process messages for now
    if (processedUpdate.type === 'message') {
      // Find conversation ID from chat mapping or create new one
      const conversationId = await findOrCreateConversationFromTelegram(
        processedUpdate.chat.id.toString(),
        processedUpdate.user?.id.toString()
      );

      // Sync message to internal system
      const syncResult = await messageSyncService.syncFromExternalChannel(
        'telegram',
        processedUpdate.message,
        conversationId
      );

      if (!syncResult.success) {
        console.error('[Webhook] Failed to sync Telegram message:', syncResult.error);
        res.status(500).json({ error: 'Failed to process message' });
        return;
      }

      console.log('[Webhook] Telegram message processed successfully:', syncResult.message?.id);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook] Telegram webhook error:', error);
    
    await auditLogger.logSecurityEvent(
      'webhook_processing_error',
      'high',
      { 
        channel: 'telegram',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      undefined,
      { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    );

    res.status(500).json({ error: 'Internal server error' });
  }
};

// Messenger webhook endpoint
export const messengerWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // Handle webhook verification
    if (req.method === 'GET') {
      const mode = req.query['hub.mode'] as string;
      const token = req.query['hub.verify_token'] as string;
      const challenge = req.query['hub.challenge'] as string;

      const verificationResult = messengerBot.verifyWebhook(mode, token, challenge);
      
      if (verificationResult) {
        console.log('[Webhook] Messenger webhook verified');
        res.status(200).send(verificationResult);
        return;
      } else {
        console.error('[Webhook] Messenger webhook verification failed');
        res.status(403).json({ error: 'Webhook verification failed' });
        return;
      }
    }

    // Handle webhook events
    const signature = req.headers['x-hub-signature-256'] as string;
    const body = JSON.stringify(req.body);

    // Validate webhook signature
    if (!messengerBot.validateSignature(body, signature)) {
      await auditLogger.logSecurityEvent(
        'webhook_signature_invalid',
        'high',
        { channel: 'messenger', signature: signature?.substring(0, 10) + '...' },
        undefined,
        { ipAddress: req.ip, userAgent: req.get('User-Agent') }
      );
      
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }

    const webhookData = req.body;
    
    // Process webhook events
    const events = messengerBot.processWebhook(webhookData);
    
    for (const event of events) {
      // Log webhook received
      await auditLogger.logEvent({
        eventType: 'system_access',
        category: 'system',
        severity: 'low',
        action: 'messenger_webhook_received',
        outcome: 'success',
        details: {
          eventType: event.type,
          senderId: event.senderId,
          recipientId: event.recipientId,
          timestamp: event.timestamp
        },
        ipAddress: req.ip
      });

      // Only process messages for now
      if (event.type === 'message') {
        // Find conversation ID from sender mapping or create new one
        const conversationId = await findOrCreateConversationFromMessenger(
          event.senderId,
          event.recipientId
        );

        // Sync message to internal system
        const syncResult = await messageSyncService.syncFromExternalChannel(
          'messenger',
          event,
          conversationId
        );

        if (!syncResult.success) {
          console.error('[Webhook] Failed to sync Messenger message:', syncResult.error);
          continue; // Continue processing other events
        }

        console.log('[Webhook] Messenger message processed successfully:', syncResult.message?.id);
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook] Messenger webhook error:', error);
    
    await auditLogger.logSecurityEvent(
      'webhook_processing_error',
      'high',
      { 
        channel: 'messenger',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      undefined,
      { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    );

    res.status(500).json({ error: 'Internal server error' });
  }
};

// Email webhook endpoint (for inbound email processing)
export const emailWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate webhook (implementation depends on email service provider)
    const signature = req.headers['x-email-signature'] as string;
    const body = JSON.stringify(req.body);

    // Basic signature validation (would be more sophisticated in production)
    if (signature && !validateEmailWebhookSignature(body, signature)) {
      await auditLogger.logSecurityEvent(
        'webhook_signature_invalid',
        'high',
        { channel: 'email', signature: signature?.substring(0, 10) + '...' },
        undefined,
        { ipAddress: req.ip, userAgent: req.get('User-Agent') }
      );
      
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }

    const emailData = req.body;
    
    // Log webhook received
    await auditLogger.logEvent({
      eventType: 'system_access',
      category: 'system',
      severity: 'low',
      action: 'email_webhook_received',
      outcome: 'success',
      details: {
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        messageId: emailData.messageId
      },
      ipAddress: req.ip
    });

    // Parse email content
    const parsedEmail = emailService.parseEmail(emailData.raw || emailData.body);
    
    // Extract or create conversation ID
    const conversationId = emailService.extractConversationId(parsedEmail) || 
                          await createConversationFromEmail(parsedEmail);

    // Sync message to internal system
    const syncResult = await messageSyncService.syncFromExternalChannel(
      'email',
      emailData,
      conversationId
    );

    if (!syncResult.success) {
      console.error('[Webhook] Failed to sync email message:', syncResult.error);
      res.status(500).json({ error: 'Failed to process email' });
      return;
    }

    console.log('[Webhook] Email message processed successfully:', syncResult.message?.id);
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook] Email webhook error:', error);
    
    await auditLogger.logSecurityEvent(
      'webhook_processing_error',
      'high',
      { 
        channel: 'email',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      undefined,
      { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    );

    res.status(500).json({ error: 'Internal server error' });
  }
};

// Generic webhook health check
export const webhookHealthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    const healthStatus = await messageSyncService.healthCheck();
    
    res.status(healthStatus.success ? 200 : 503).json({
      status: healthStatus.success ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      channels: healthStatus.channels,
      stats: healthStatus.stats
    });
  } catch (error) {
    console.error('[Webhook] Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Webhook configuration endpoints
export const getWebhookConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = {
      telegram: {
        webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
        botUsername: process.env.TELEGRAM_BOT_USERNAME,
        enabled: !!process.env.TELEGRAM_BOT_TOKEN
      },
      messenger: {
        webhookUrl: process.env.MESSENGER_WEBHOOK_URL,
        pageId: process.env.MESSENGER_PAGE_ID,
        enabled: !!process.env.MESSENGER_PAGE_ACCESS_TOKEN
      },
      email: {
        webhookUrl: process.env.EMAIL_WEBHOOK_URL,
        enabled: !!process.env.SMTP_HOST
      }
    };

    res.json(config);
  } catch (error) {
    console.error('[Webhook] Failed to get webhook config:', error);
    res.status(500).json({ error: 'Failed to get webhook configuration' });
  }
};

export const updateWebhookConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channel, config } = req.body;

    // Validate input
    if (!channel || !config) {
      res.status(400).json({ error: 'Channel and config are required' });
      return;
    }

    let result: { success: boolean; error?: string } = { success: false };

    switch (channel) {
      case 'telegram':
        if (config.webhookUrl) {
          try {
            await telegramBot.setWebhook({
              url: config.webhookUrl,
              secretToken: config.secretToken,
              allowedUpdates: config.allowedUpdates
            });
            result = { success: true };
          } catch (error) {
            result = {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        }
        break;

      case 'messenger':
        // Messenger webhook is configured through Facebook Developer Console
        result = { success: true };
        break;

      case 'email':
        // Email webhook configuration depends on email service provider
        result = { success: true };
        break;

      default:
        result = { success: false, error: 'Unknown channel' };
    }

    // Log configuration change
    await auditLogger.logEvent({
      eventType: 'configuration_change',
      category: 'system',
      severity: 'medium',
      action: 'webhook_config_updated',
      outcome: result.success ? 'success' : 'failure',
      details: {
        channel,
        config: { ...config, secretToken: '[REDACTED]' },
        result
      },
      ipAddress: req.ip
    });

    if (result.success) {
      res.json({ status: 'updated', channel, result });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('[Webhook] Failed to update webhook config:', error);
    res.status(500).json({ error: 'Failed to update webhook configuration' });
  }
};

// Helper functions
async function findOrCreateConversationFromTelegram(
  chatId: string,
  userId?: string
): Promise<string> {
  // In production, would query database for existing conversation
  // For now, create a deterministic conversation ID
  return `telegram_${chatId}`;
}

async function findOrCreateConversationFromMessenger(
  senderId: string,
  recipientId: string
): Promise<string> {
  // In production, would query database for existing conversation
  // For now, create a deterministic conversation ID
  return `messenger_${senderId}`;
}

async function createConversationFromEmail(parsedEmail: any): Promise<string> {
  // Create conversation ID based on email thread
  const emailHash = Buffer.from(parsedEmail.from.address).toString('base64').replace(/[+/=]/g, '');
  return `email_${emailHash}_${Date.now()}`;
}

function validateEmailWebhookSignature(body: string, signature: string): boolean {
  // Simplified email webhook signature validation
  // In production, would use proper HMAC validation based on email service provider
  const expectedSignature = securityValidator['generateWebhookSignature'](
    body,
    process.env.EMAIL_WEBHOOK_SECRET || 'default_secret'
  );
  
  return signature === expectedSignature;
}

// Rate limiting for webhooks
export const webhookRateLimit = {
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many webhook requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use IP + User-Agent for more specific rate limiting
    return `${req.ip}_${req.get('User-Agent')}`;
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path.includes('/health');
  }
};

// Webhook security middleware
export const webhookSecurity = {
  // Validate webhook source IP
  validateSourceIP: (allowedIPs: string[]) => {
    return (req: Request, res: Response, next: any) => {
      const clientIP = req.ip;
      
      if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
        auditLogger.logSecurityEvent(
          'webhook_unauthorized_ip',
          'high',
          { ip: clientIP, path: req.path },
          undefined,
          { ipAddress: clientIP, userAgent: req.get('User-Agent') }
        );
        
        res.status(403).json({ error: 'Unauthorized IP address' });
        return;
      }
      
      next();
    };
  },

  // Log all webhook requests
  logWebhookRequest: (req: Request, res: Response, next: any) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      auditLogger.logEvent({
        eventType: 'system_access',
        category: 'system',
        severity: 'low',
        action: 'webhook_request',
        outcome: res.statusCode < 400 ? 'success' : 'failure',
        details: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          contentLength: req.get('Content-Length'),
          userAgent: req.get('User-Agent')
        },
        ipAddress: req.ip
      });
    });
    
    next();
  }
};