// Telegram Bot Integration
// Webhook integration for receiving and sending messages via Telegram

export interface TelegramConfig {
  botToken: string;
  webhookUrl: string;
  secretToken?: string;
  allowedUpdates: string[];
  maxConnections?: number;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  photo?: TelegramPhotoSize[];
  document?: TelegramDocument;
  reply_to_message?: TelegramMessage;
}

export interface TelegramPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface TelegramDocument {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
}

export interface TelegramWebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  ip_address?: string;
  last_error_date?: number;
  last_error_message?: string;
  last_synchronization_error_date?: number;
  max_connections?: number;
  allowed_updates?: string[];
}

// Telegram Bot API client
export class TelegramBot {
  private config: TelegramConfig;
  private baseUrl: string;

  constructor(config: TelegramConfig) {
    this.config = config;
    this.baseUrl = `https://api.telegram.org/bot${config.botToken}`;
  }

  // Webhook management
  async setWebhook(options: {
    url: string;
    certificate?: string;
    ipAddress?: string;
    maxConnections?: number;
    allowedUpdates?: string[];
    dropPendingUpdates?: boolean;
    secretToken?: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: options.url,
          certificate: options.certificate,
          ip_address: options.ipAddress,
          max_connections: options.maxConnections || 40,
          allowed_updates: options.allowedUpdates || this.config.allowedUpdates,
          drop_pending_updates: options.dropPendingUpdates || false,
          secret_token: options.secretToken || this.config.secretToken
        })
      });

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(`Failed to set webhook: ${result.description}`);
      }

      console.log('[Telegram] Webhook set successfully:', options.url);
      return true;
    } catch (error) {
      console.error('[Telegram] Failed to set webhook:', error);
      throw error;
    }
  }

  async deleteWebhook(dropPendingUpdates: boolean = false): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/deleteWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drop_pending_updates: dropPendingUpdates
        })
      });

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(`Failed to delete webhook: ${result.description}`);
      }

      console.log('[Telegram] Webhook deleted successfully');
      return true;
    } catch (error) {
      console.error('[Telegram] Failed to delete webhook:', error);
      throw error;
    }
  }

  async getWebhookInfo(): Promise<TelegramWebhookInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/getWebhookInfo`);
      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(`Failed to get webhook info: ${result.description}`);
      }

      return result.result;
    } catch (error) {
      console.error('[Telegram] Failed to get webhook info:', error);
      throw error;
    }
  }

  // Message sending
  async sendMessage(options: {
    chatId: number | string;
    text: string;
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    entities?: any[];
    disableWebPagePreview?: boolean;
    disableNotification?: boolean;
    protectContent?: boolean;
    replyToMessageId?: number;
    allowSendingWithoutReply?: boolean;
    replyMarkup?: any;
  }): Promise<TelegramMessage> {
    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: options.chatId,
          text: options.text,
          parse_mode: options.parseMode,
          entities: options.entities,
          disable_web_page_preview: options.disableWebPagePreview,
          disable_notification: options.disableNotification,
          protect_content: options.protectContent,
          reply_to_message_id: options.replyToMessageId,
          allow_sending_without_reply: options.allowSendingWithoutReply,
          reply_markup: options.replyMarkup
        })
      });

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(`Failed to send message: ${result.description}`);
      }

      console.log('[Telegram] Message sent successfully to chat:', options.chatId);
      return result.result;
    } catch (error) {
      console.error('[Telegram] Failed to send message:', error);
      throw error;
    }
  }

  async sendPhoto(options: {
    chatId: number | string;
    photo: string; // file_id or URL
    caption?: string;
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    captionEntities?: any[];
    disableNotification?: boolean;
    protectContent?: boolean;
    replyToMessageId?: number;
    allowSendingWithoutReply?: boolean;
    replyMarkup?: any;
  }): Promise<TelegramMessage> {
    try {
      const response = await fetch(`${this.baseUrl}/sendPhoto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: options.chatId,
          photo: options.photo,
          caption: options.caption,
          parse_mode: options.parseMode,
          caption_entities: options.captionEntities,
          disable_notification: options.disableNotification,
          protect_content: options.protectContent,
          reply_to_message_id: options.replyToMessageId,
          allow_sending_without_reply: options.allowSendingWithoutReply,
          reply_markup: options.replyMarkup
        })
      });

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(`Failed to send photo: ${result.description}`);
      }

      console.log('[Telegram] Photo sent successfully to chat:', options.chatId);
      return result.result;
    } catch (error) {
      console.error('[Telegram] Failed to send photo:', error);
      throw error;
    }
  }

  async sendDocument(options: {
    chatId: number | string;
    document: string; // file_id or URL
    thumbnail?: string;
    caption?: string;
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    captionEntities?: any[];
    disableContentTypeDetection?: boolean;
    disableNotification?: boolean;
    protectContent?: boolean;
    replyToMessageId?: number;
    allowSendingWithoutReply?: boolean;
    replyMarkup?: any;
  }): Promise<TelegramMessage> {
    try {
      const response = await fetch(`${this.baseUrl}/sendDocument`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: options.chatId,
          document: options.document,
          thumbnail: options.thumbnail,
          caption: options.caption,
          parse_mode: options.parseMode,
          caption_entities: options.captionEntities,
          disable_content_type_detection: options.disableContentTypeDetection,
          disable_notification: options.disableNotification,
          protect_content: options.protectContent,
          reply_to_message_id: options.replyToMessageId,
          allow_sending_without_reply: options.allowSendingWithoutReply,
          reply_markup: options.replyMarkup
        })
      });

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(`Failed to send document: ${result.description}`);
      }

      console.log('[Telegram] Document sent successfully to chat:', options.chatId);
      return result.result;
    } catch (error) {
      console.error('[Telegram] Failed to send document:', error);
      throw error;
    }
  }

  // File operations
  async getFile(fileId: string): Promise<{ file_id: string; file_unique_id: string; file_size?: number; file_path?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/getFile?file_id=${fileId}`);
      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(`Failed to get file: ${result.description}`);
      }

      return result.result;
    } catch (error) {
      console.error('[Telegram] Failed to get file:', error);
      throw error;
    }
  }

  async downloadFile(filePath: string): Promise<ArrayBuffer> {
    try {
      const fileUrl = `https://api.telegram.org/file/bot${this.config.botToken}/${filePath}`;
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('[Telegram] Failed to download file:', error);
      throw error;
    }
  }

  // Bot information
  async getMe(): Promise<TelegramUser> {
    try {
      const response = await fetch(`${this.baseUrl}/getMe`);
      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(`Failed to get bot info: ${result.description}`);
      }

      return result.result;
    } catch (error) {
      console.error('[Telegram] Failed to get bot info:', error);
      throw error;
    }
  }

  // Webhook validation
  validateWebhook(body: string, signature: string): boolean {
    if (!this.config.secretToken) {
      return true; // No validation if no secret token
    }

    try {
      // Telegram uses HMAC-SHA256 for webhook validation
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.config.secretToken)
        .update(body)
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('[Telegram] Webhook validation error:', error);
      return false;
    }
  }

  // Update processing
  processUpdate(update: TelegramUpdate): {
    type: 'message' | 'edited_message' | 'channel_post' | 'edited_channel_post';
    message: TelegramMessage;
    user?: TelegramUser;
    chat: TelegramChat;
  } | null {
    let message: TelegramMessage | undefined;
    let type: string;

    if (update.message) {
      message = update.message;
      type = 'message';
    } else if (update.edited_message) {
      message = update.edited_message;
      type = 'edited_message';
    } else if (update.channel_post) {
      message = update.channel_post;
      type = 'channel_post';
    } else if (update.edited_channel_post) {
      message = update.edited_channel_post;
      type = 'edited_channel_post';
    } else {
      return null; // Unsupported update type
    }

    return {
      type: type as any,
      message,
      user: message.from,
      chat: message.chat
    };
  }

  // Message formatting helpers
  formatMessage(text: string, parseMode: 'HTML' | 'Markdown' | 'MarkdownV2' = 'HTML'): string {
    switch (parseMode) {
      case 'HTML':
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      
      case 'Markdown':
        return text
          .replace(/\*/g, '\\*')
          .replace(/_/g, '\\_')
          .replace(/\[/g, '\\[')
          .replace(/\]/g, '\\]')
          .replace(/\(/g, '\\(')
          .replace(/\)/g, '\\)')
          .replace(/~/g, '\\~')
          .replace(/`/g, '\\`');
      
      case 'MarkdownV2':
        return text
          .replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
      
      default:
        return text;
    }
  }

  // Inline keyboard helpers
  createInlineKeyboard(buttons: Array<Array<{ text: string; callback_data?: string; url?: string }>>): any {
    return {
      inline_keyboard: buttons
    };
  }

  createReplyKeyboard(buttons: Array<Array<{ text: string; request_contact?: boolean; request_location?: boolean }>>): any {
    return {
      keyboard: buttons,
      resize_keyboard: true,
      one_time_keyboard: true
    };
  }
}

// Default configuration
export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || '',
  secretToken: process.env.TELEGRAM_SECRET_TOKEN,
  allowedUpdates: ['message', 'edited_message', 'callback_query'],
  maxConnections: 40
};

// Export singleton instance
export const telegramBot = new TelegramBot(DEFAULT_TELEGRAM_CONFIG);