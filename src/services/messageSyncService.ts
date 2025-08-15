// Message Synchronization Service
// Bidirectional sync between internal chat system and external channels

import { telegramBot } from '../integrations/telegramBot';
import { emailService } from '../integrations/emailIntegration';
import { messengerBot } from '../integrations/messengerIntegration';
import { websocketService } from './websocketService';
import { auditLogger } from '../security/auditLogger';

export interface ChannelConfig {
  telegram: {
    enabled: boolean;
    botUsername?: string;
    chatId?: string;
  };
  email: {
    enabled: boolean;
    address: string;
    name?: string;
  };
  messenger: {
    enabled: boolean;
    pageId?: string;
    userId?: string;
  };
}

export interface SyncMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  channel: 'internal' | 'telegram' | 'email' | 'messenger';
  channelMessageId?: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  metadata?: Record<string, any>;
}

export interface ChannelMapping {
  conversationId: string;
  userId: string;
  channels: {
    telegram?: {
      chatId: string;
      username?: string;
    };
    email?: {
      address: string;
      name?: string;
    };
    messenger?: {
      userId: string;
      pageId?: string;
    };
  };
  preferences: {
    notifications: boolean;
    autoReply: boolean;
    channels: ('telegram' | 'email' | 'messenger')[];
  };
}

// Message synchronization service
export class MessageSyncService {
  private channelMappings: Map<string, ChannelMapping> = new Map();
  private messageQueue: Map<string, SyncMessage[]> = new Map();
  private syncInProgress: Set<string> = new Set();

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    console.log('[MessageSync] Initializing message synchronization service');
    
    // Set up periodic sync check
    setInterval(() => {
      this.processPendingMessages();
    }, 5000); // Check every 5 seconds
  }

  // Channel mapping management
  async createChannelMapping(
    conversationId: string,
    userId: string,
    channels: ChannelMapping['channels'],
    preferences: ChannelMapping['preferences']
  ): Promise<ChannelMapping> {
    const mapping: ChannelMapping = {
      conversationId,
      userId,
      channels,
      preferences
    };

    this.channelMappings.set(conversationId, mapping);
    
    await auditLogger.logEvent({
      userId,
      eventType: 'system_access',
      category: 'system',
      severity: 'low',
      action: 'channel_mapping_created',
      outcome: 'success',
      details: {
        conversationId,
        channels: Object.keys(channels),
        preferences
      }
    });

    console.log('[MessageSync] Channel mapping created:', conversationId);
    return mapping;
  }

  async updateChannelMapping(
    conversationId: string,
    updates: Partial<ChannelMapping>
  ): Promise<ChannelMapping | null> {
    const existing = this.channelMappings.get(conversationId);
    if (!existing) {
      return null;
    }

    const updated = {
      ...existing,
      ...updates,
      channels: { ...existing.channels, ...updates.channels },
      preferences: { ...existing.preferences, ...updates.preferences }
    };

    this.channelMappings.set(conversationId, updated);
    
    await auditLogger.logEvent({
      userId: existing.userId,
      eventType: 'system_access',
      category: 'system',
      severity: 'low',
      action: 'channel_mapping_updated',
      outcome: 'success',
      details: { conversationId, updates }
    });

    console.log('[MessageSync] Channel mapping updated:', conversationId);
    return updated;
  }

  getChannelMapping(conversationId: string): ChannelMapping | null {
    return this.channelMappings.get(conversationId) || null;
  }

  // Message synchronization
  async syncMessageToChannels(message: SyncMessage): Promise<{
    success: boolean;
    results: Record<string, { success: boolean; messageId?: string; error?: string }>;
  }> {
    const mapping = this.channelMappings.get(message.conversationId);
    if (!mapping) {
      console.warn('[MessageSync] No channel mapping found for conversation:', message.conversationId);
      return { success: false, results: {} };
    }

    // Skip if message originated from external channel to avoid loops
    if (message.channel !== 'internal') {
      console.log('[MessageSync] Skipping external message to avoid loop:', message.id);
      return { success: true, results: {} };
    }

    const results: Record<string, { success: boolean; messageId?: string; error?: string }> = {};
    let overallSuccess = true;

    // Sync to enabled channels
    for (const channelType of mapping.preferences.channels) {
      try {
        let result: { success: boolean; messageId?: string; error?: string };

        switch (channelType) {
          case 'telegram':
            result = await this.syncToTelegram(message, mapping);
            break;
          case 'email':
            result = await this.syncToEmail(message, mapping);
            break;
          case 'messenger':
            result = await this.syncToMessenger(message, mapping);
            break;
          default:
            result = { success: false, error: `Unknown channel type: ${channelType}` };
        }

        results[channelType] = result;
        if (!result.success) {
          overallSuccess = false;
        }
      } catch (error) {
        results[channelType] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        overallSuccess = false;
      }
    }

    // Log sync results
    await auditLogger.logEvent({
      userId: mapping.userId,
      eventType: 'system_access',
      category: 'system',
      severity: overallSuccess ? 'low' : 'medium',
      action: 'message_sync',
      outcome: overallSuccess ? 'success' : 'failure',
      details: {
        messageId: message.id,
        conversationId: message.conversationId,
        channels: Object.keys(results),
        results
      }
    });

    return { success: overallSuccess, results };
  }

  // Sync from external channels to internal
  async syncFromExternalChannel(
    channelType: 'telegram' | 'email' | 'messenger',
    externalMessage: any,
    conversationId?: string
  ): Promise<{ success: boolean; message?: SyncMessage; error?: string }> {
    try {
      let syncMessage: SyncMessage;

      switch (channelType) {
        case 'telegram':
          syncMessage = await this.processTelegramMessage(externalMessage, conversationId);
          break;
        case 'email':
          syncMessage = await this.processEmailMessage(externalMessage, conversationId);
          break;
        case 'messenger':
          syncMessage = await this.processMessengerMessage(externalMessage, conversationId);
          break;
        default:
          throw new Error(`Unsupported channel type: ${channelType}`);
      }

      // Send to internal chat system via WebSocket
      await this.syncToInternal(syncMessage);

      // Add channel indicator
      await this.addChannelIndicator(syncMessage);

      await auditLogger.logEvent({
        eventType: 'system_access',
        category: 'system',
        severity: 'low',
        action: 'external_message_synced',
        outcome: 'success',
        details: {
          channel: channelType,
          messageId: syncMessage.id,
          conversationId: syncMessage.conversationId
        }
      });

      console.log(`[MessageSync] Message synced from ${channelType}:`, syncMessage.id);
      return { success: true, message: syncMessage };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await auditLogger.logEvent({
        eventType: 'system_access',
        category: 'system',
        severity: 'high',
        action: 'external_message_sync_failed',
        outcome: 'failure',
        details: {
          channel: channelType,
          error: errorMessage,
          conversationId
        }
      });

      console.error(`[MessageSync] Failed to sync from ${channelType}:`, error);
      return { success: false, error: errorMessage };
    }
  }

  // Channel-specific sync methods
  private async syncToTelegram(
    message: SyncMessage,
    mapping: ChannelMapping
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!mapping.channels.telegram?.chatId) {
        return { success: false, error: 'No Telegram chat ID configured' };
      }

      let text = `💬 ${message.senderName}: ${message.content}`;
      
      // Add attachment info
      if (message.attachments && message.attachments.length > 0) {
        text += `\n\n📎 ไฟล์แนบ: ${message.attachments.length} ไฟล์`;
        message.attachments.forEach(att => {
          text += `\n• ${att.name} (${this.formatFileSize(att.size)})`;
        });
      }

      const result = await telegramBot.sendMessage({
        chatId: mapping.channels.telegram.chatId,
        text: text,
        parseMode: 'HTML'
      });

      return { success: true, messageId: result.message_id.toString() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async syncToEmail(
    message: SyncMessage,
    mapping: ChannelMapping
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!mapping.channels.email?.address) {
        return { success: false, error: 'No email address configured' };
      }

      const result = await emailService.sendChatNotification(
        mapping.channels.email.address,
        message.conversationId,
        {
          from: message.senderName,
          content: message.content,
          timestamp: message.timestamp,
          attachments: message.attachments?.map(att => ({
            name: att.name,
            url: att.url
          }))
        }
      );

      return { success: true, messageId: result.messageId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async syncToMessenger(
    message: SyncMessage,
    mapping: ChannelMapping
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!mapping.channels.messenger?.userId) {
        return { success: false, error: 'No Messenger user ID configured' };
      }

      let text = `💬 ${message.senderName}: ${message.content}`;
      
      // Add attachment info
      if (message.attachments && message.attachments.length > 0) {
        text += `\n\n📎 ไฟล์แนบ: ${message.attachments.length} ไฟล์`;
      }

      const result = await messengerBot.sendTextMessage(
        mapping.channels.messenger.userId,
        text
      );

      return { success: true, messageId: result.message_id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Process external messages
  private async processTelegramMessage(
    telegramMessage: any,
    conversationId?: string
  ): Promise<SyncMessage> {
    const message: SyncMessage = {
      id: `telegram_${telegramMessage.message_id}_${Date.now()}`,
      conversationId: conversationId || `telegram_${telegramMessage.chat.id}`,
      content: telegramMessage.text || '[ไฟล์แนบ]',
      senderId: telegramMessage.from.id.toString(),
      senderName: `${telegramMessage.from.first_name} ${telegramMessage.from.last_name || ''}`.trim(),
      timestamp: new Date(telegramMessage.date * 1000).toISOString(),
      channel: 'telegram',
      channelMessageId: telegramMessage.message_id.toString(),
      attachments: [],
      metadata: {
        telegramUserId: telegramMessage.from.id,
        telegramChatId: telegramMessage.chat.id,
        telegramUsername: telegramMessage.from.username
      }
    };

    // Process attachments
    if (telegramMessage.photo) {
      // Handle photo
      const photo = telegramMessage.photo[telegramMessage.photo.length - 1]; // Get largest size
      message.attachments?.push({
        id: photo.file_id,
        name: 'photo.jpg',
        url: `telegram://photo/${photo.file_id}`,
        type: 'image/jpeg',
        size: photo.file_size || 0
      });
    }

    if (telegramMessage.document) {
      // Handle document
      message.attachments?.push({
        id: telegramMessage.document.file_id,
        name: telegramMessage.document.file_name || 'document',
        url: `telegram://document/${telegramMessage.document.file_id}`,
        type: telegramMessage.document.mime_type || 'application/octet-stream',
        size: telegramMessage.document.file_size || 0
      });
    }

    return message;
  }

  private async processEmailMessage(
    emailMessage: any,
    conversationId?: string
  ): Promise<SyncMessage> {
    const parsedEmail = emailService.parseEmail(emailMessage.raw || emailMessage.body);
    
    const message: SyncMessage = {
      id: `email_${parsedEmail.messageId}_${Date.now()}`,
      conversationId: conversationId || emailService.extractConversationId(parsedEmail) || `email_${Date.now()}`,
      content: parsedEmail.text || parsedEmail.html || '[ไม่มีเนื้อหา]',
      senderId: parsedEmail.from.address,
      senderName: parsedEmail.from.name || parsedEmail.from.address,
      timestamp: parsedEmail.date.toISOString(),
      channel: 'email',
      channelMessageId: parsedEmail.messageId,
      attachments: parsedEmail.attachments.map(att => ({
        id: `email_att_${Date.now()}_${Math.random()}`,
        name: att.filename,
        url: `email://attachment/${att.filename}`,
        type: att.contentType,
        size: att.size || 0
      })),
      metadata: {
        emailFrom: parsedEmail.from,
        emailTo: parsedEmail.to,
        emailSubject: parsedEmail.subject,
        inReplyTo: parsedEmail.inReplyTo,
        references: parsedEmail.references
      }
    };

    return message;
  }

  private async processMessengerMessage(
    messengerMessage: any,
    conversationId?: string
  ): Promise<SyncMessage> {
    // Get user profile for sender name
    let senderName = messengerMessage.senderId;
    try {
      const profile = await messengerBot.getUserProfile(messengerMessage.senderId);
      senderName = `${profile.first_name} ${profile.last_name || ''}`.trim();
    } catch (error) {
      console.warn('[MessageSync] Failed to get Messenger user profile:', error);
    }

    const message: SyncMessage = {
      id: `messenger_${messengerMessage.data.messageId}_${Date.now()}`,
      conversationId: conversationId || `messenger_${messengerMessage.senderId}`,
      content: messengerMessage.data.text || '[ไฟล์แนบ]',
      senderId: messengerMessage.senderId,
      senderName: senderName,
      timestamp: new Date(messengerMessage.timestamp).toISOString(),
      channel: 'messenger',
      channelMessageId: messengerMessage.data.messageId,
      attachments: [],
      metadata: {
        messengerUserId: messengerMessage.senderId,
        messengerRecipientId: messengerMessage.recipientId
      }
    };

    // Process attachments
    if (messengerMessage.data.attachments) {
      for (const attachment of messengerMessage.data.attachments) {
        if (attachment.payload.url) {
          message.attachments?.push({
            id: `messenger_att_${Date.now()}_${Math.random()}`,
            name: `${attachment.type}_attachment`,
            url: attachment.payload.url,
            type: this.getMessengerAttachmentMimeType(attachment.type),
            size: 0 // Messenger doesn't provide file size
          });
        }
      }
    }

    return message;
  }

  // Sync to internal chat system
  private async syncToInternal(message: SyncMessage): Promise<void> {
    try {
      // Send via WebSocket to all connected clients for this conversation
      await websocketService.sendToConversation(message.conversationId, {
        type: 'message',
        data: message
      });

      console.log('[MessageSync] Message synced to internal system:', message.id);
    } catch (error) {
      console.error('[MessageSync] Failed to sync to internal system:', error);
      throw error;
    }
  }

  // Add channel indicator to message
  private async addChannelIndicator(message: SyncMessage): Promise<void> {
    const channelNames = {
      telegram: 'Telegram',
      email: 'Email',
      messenger: 'Messenger',
      internal: 'Internal'
    };

    const indicator = {
      type: 'channel_indicator',
      channel: message.channel,
      channelName: channelNames[message.channel],
      messageId: message.id,
      timestamp: new Date().toISOString()
    };

    await websocketService.sendToConversation(message.conversationId, {
      type: 'channel_indicator',
      data: indicator
    });
  }

  // Queue management
  private async processPendingMessages(): Promise<void> {
    for (const [conversationId, messages] of this.messageQueue.entries()) {
      if (this.syncInProgress.has(conversationId)) {
        continue; // Skip if sync is already in progress
      }

      if (messages.length === 0) {
        this.messageQueue.delete(conversationId);
        continue;
      }

      this.syncInProgress.add(conversationId);
      
      try {
        const message = messages.shift()!;
        await this.syncMessageToChannels(message);
      } catch (error) {
        console.error('[MessageSync] Failed to process pending message:', error);
      } finally {
        this.syncInProgress.delete(conversationId);
      }
    }
  }

  // Utility methods
  private formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  private getMessengerAttachmentMimeType(type: string): string {
    const mimeTypes: Record<string, string> = {
      image: 'image/jpeg',
      audio: 'audio/mpeg',
      video: 'video/mp4',
      file: 'application/octet-stream'
    };
    return mimeTypes[type] || 'application/octet-stream';
  }

  // Health check
  async healthCheck(): Promise<{
    success: boolean;
    channels: Record<string, { enabled: boolean; healthy: boolean; error?: string }>;
    stats: {
      activeMappings: number;
      pendingMessages: number;
      syncInProgress: number;
    };
  }> {
    const channels: Record<string, { enabled: boolean; healthy: boolean; error?: string }> = {};

    // Check Telegram
    try {
      const telegramHealth = await telegramBot.getMe();
      channels.telegram = { enabled: true, healthy: true };
    } catch (error) {
      channels.telegram = {
        enabled: true,
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Check Email
    try {
      const emailHealth = await emailService.testConnection();
      channels.email = { enabled: true, healthy: emailHealth.success, error: emailHealth.error };
    } catch (error) {
      channels.email = {
        enabled: true,
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Check Messenger
    try {
      const messengerHealth = await messengerBot.testConnection();
      channels.messenger = { enabled: true, healthy: messengerHealth.success, error: messengerHealth.error };
    } catch (error) {
      channels.messenger = {
        enabled: true,
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    const stats = {
      activeMappings: this.channelMappings.size,
      pendingMessages: Array.from(this.messageQueue.values()).reduce((sum, messages) => sum + messages.length, 0),
      syncInProgress: this.syncInProgress.size
    };

    const allHealthy = Object.values(channels).every(channel => channel.healthy);

    return {
      success: allHealthy,
      channels,
      stats
    };
  }
}

// Export singleton service
export const messageSyncService = new MessageSyncService();