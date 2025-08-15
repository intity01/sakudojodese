// Facebook Messenger Integration
// Webhook integration for receiving and sending messages via Facebook Messenger

export interface MessengerConfig {
  pageAccessToken: string;
  appSecret: string;
  verifyToken: string;
  webhookUrl: string;
  apiVersion: string;
}

export interface MessengerUser {
  id: string;
  first_name?: string;
  last_name?: string;
  profile_pic?: string;
  locale?: string;
  timezone?: number;
  gender?: string;
}

export interface MessengerMessage {
  mid: string;
  text?: string;
  attachments?: MessengerAttachment[];
  quick_reply?: {
    payload: string;
  };
  reply_to?: {
    mid: string;
  };
}

export interface MessengerAttachment {
  type: 'image' | 'audio' | 'video' | 'file' | 'template' | 'fallback';
  payload: {
    url?: string;
    attachment_id?: string;
    is_reusable?: boolean;
    template_type?: string;
    elements?: any[];
    buttons?: MessengerButton[];
  };
}

export interface MessengerButton {
  type: 'web_url' | 'postback' | 'phone_number' | 'element_share' | 'payment';
  title: string;
  url?: string;
  payload?: string;
  phone_number?: string;
}

export interface MessengerWebhookEntry {
  id: string;
  time: number;
  messaging: MessengerMessagingEvent[];
}

export interface MessengerMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: MessengerMessage;
  postback?: {
    title: string;
    payload: string;
    referral?: {
      ref: string;
      source: string;
      type: string;
    };
  };
  delivery?: {
    mids: string[];
    watermark: number;
  };
  read?: {
    watermark: number;
  };
  referral?: {
    ref: string;
    source: string;
    type: string;
  };
}

export interface MessengerQuickReply {
  content_type: 'text' | 'user_phone_number' | 'user_email';
  title?: string;
  payload?: string;
  image_url?: string;
}

// Facebook Messenger API client
export class MessengerBot {
  private config: MessengerConfig;
  private baseUrl: string;

  constructor(config: MessengerConfig) {
    this.config = config;
    this.baseUrl = `https://graph.facebook.com/${config.apiVersion}`;
  }

  // Webhook verification
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config.verifyToken) {
      console.log('[Messenger] Webhook verified successfully');
      return challenge;
    } else {
      console.error('[Messenger] Webhook verification failed');
      return null;
    }
  }

  // Webhook signature validation
  validateSignature(body: string, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha1', this.config.appSecret)
        .update(body)
        .digest('hex');
      
      const receivedSignature = signature.replace('sha1=', '');
      
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex')
      );
    } catch (error) {
      console.error('[Messenger] Signature validation error:', error);
      return false;
    }
  }

  // Send text message
  async sendTextMessage(
    recipientId: string,
    text: string,
    options: {
      quickReplies?: MessengerQuickReply[];
      metadata?: string;
      messagingType?: 'RESPONSE' | 'UPDATE' | 'MESSAGE_TAG';
      tag?: string;
    } = {}
  ): Promise<{ recipient_id: string; message_id: string }> {
    try {
      const messageData = {
        recipient: { id: recipientId },
        message: {
          text: text,
          quick_replies: options.quickReplies,
          metadata: options.metadata
        },
        messaging_type: options.messagingType || 'RESPONSE',
        tag: options.tag
      };

      const response = await fetch(`${this.baseUrl}/me/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.pageAccessToken}`
        },
        body: JSON.stringify(messageData)
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Messenger API error: ${result.error.message}`);
      }

      console.log('[Messenger] Text message sent successfully:', result.message_id);
      return result;
    } catch (error) {
      console.error('[Messenger] Failed to send text message:', error);
      throw error;
    }
  }

  // Send attachment
  async sendAttachment(
    recipientId: string,
    attachment: MessengerAttachment,
    options: {
      quickReplies?: MessengerQuickReply[];
      metadata?: string;
      messagingType?: 'RESPONSE' | 'UPDATE' | 'MESSAGE_TAG';
      tag?: string;
    } = {}
  ): Promise<{ recipient_id: string; message_id: string }> {
    try {
      const messageData = {
        recipient: { id: recipientId },
        message: {
          attachment: attachment,
          quick_replies: options.quickReplies,
          metadata: options.metadata
        },
        messaging_type: options.messagingType || 'RESPONSE',
        tag: options.tag
      };

      const response = await fetch(`${this.baseUrl}/me/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.pageAccessToken}`
        },
        body: JSON.stringify(messageData)
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Messenger API error: ${result.error.message}`);
      }

      console.log('[Messenger] Attachment sent successfully:', result.message_id);
      return result;
    } catch (error) {
      console.error('[Messenger] Failed to send attachment:', error);
      throw error;
    }
  }

  // Send image
  async sendImage(
    recipientId: string,
    imageUrl: string,
    options: {
      isReusable?: boolean;
      quickReplies?: MessengerQuickReply[];
      metadata?: string;
    } = {}
  ): Promise<{ recipient_id: string; message_id: string }> {
    const attachment: MessengerAttachment = {
      type: 'image',
      payload: {
        url: imageUrl,
        is_reusable: options.isReusable || false
      }
    };

    return await this.sendAttachment(recipientId, attachment, {
      quickReplies: options.quickReplies,
      metadata: options.metadata
    });
  }

  // Send file
  async sendFile(
    recipientId: string,
    fileUrl: string,
    options: {
      isReusable?: boolean;
      quickReplies?: MessengerQuickReply[];
      metadata?: string;
    } = {}
  ): Promise<{ recipient_id: string; message_id: string }> {
    const attachment: MessengerAttachment = {
      type: 'file',
      payload: {
        url: fileUrl,
        is_reusable: options.isReusable || false
      }
    };

    return await this.sendAttachment(recipientId, attachment, {
      quickReplies: options.quickReplies,
      metadata: options.metadata
    });
  }

  // Send template message
  async sendTemplate(
    recipientId: string,
    templateType: 'generic' | 'button' | 'receipt' | 'list',
    elements: any[],
    options: {
      buttons?: MessengerButton[];
      quickReplies?: MessengerQuickReply[];
      metadata?: string;
    } = {}
  ): Promise<{ recipient_id: string; message_id: string }> {
    const attachment: MessengerAttachment = {
      type: 'template',
      payload: {
        template_type: templateType,
        elements: elements,
        buttons: options.buttons
      }
    };

    return await this.sendAttachment(recipientId, attachment, {
      quickReplies: options.quickReplies,
      metadata: options.metadata
    });
  }

  // Send typing indicator
  async sendTypingOn(recipientId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/me/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.pageAccessToken}`
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          sender_action: 'typing_on'
        })
      });

      console.log('[Messenger] Typing indicator sent');
    } catch (error) {
      console.error('[Messenger] Failed to send typing indicator:', error);
    }
  }

  async sendTypingOff(recipientId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/me/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.pageAccessToken}`
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          sender_action: 'typing_off'
        })
      });

      console.log('[Messenger] Typing indicator turned off');
    } catch (error) {
      console.error('[Messenger] Failed to turn off typing indicator:', error);
    }
  }

  // Mark message as read
  async markSeen(recipientId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/me/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.pageAccessToken}`
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          sender_action: 'mark_seen'
        })
      });

      console.log('[Messenger] Message marked as seen');
    } catch (error) {
      console.error('[Messenger] Failed to mark message as seen:', error);
    }
  }

  // Get user profile
  async getUserProfile(userId: string, fields: string[] = ['first_name', 'last_name', 'profile_pic']): Promise<MessengerUser> {
    try {
      const fieldsParam = fields.join(',');
      const response = await fetch(
        `${this.baseUrl}/${userId}?fields=${fieldsParam}&access_token=${this.config.pageAccessToken}`
      );

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Messenger API error: ${result.error.message}`);
      }

      console.log('[Messenger] User profile retrieved:', userId);
      return result;
    } catch (error) {
      console.error('[Messenger] Failed to get user profile:', error);
      throw error;
    }
  }

  // Upload attachment
  async uploadAttachment(
    type: 'image' | 'audio' | 'video' | 'file',
    url: string,
    isReusable: boolean = true
  ): Promise<{ attachment_id: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/me/message_attachments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.pageAccessToken}`
        },
        body: JSON.stringify({
          message: {
            attachment: {
              type: type,
              payload: {
                url: url,
                is_reusable: isReusable
              }
            }
          }
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Messenger API error: ${result.error.message}`);
      }

      console.log('[Messenger] Attachment uploaded:', result.attachment_id);
      return result;
    } catch (error) {
      console.error('[Messenger] Failed to upload attachment:', error);
      throw error;
    }
  }

  // Process webhook events
  processWebhook(body: { object: string; entry: MessengerWebhookEntry[] }): {
    type: 'message' | 'postback' | 'delivery' | 'read' | 'referral';
    senderId: string;
    recipientId: string;
    timestamp: number;
    data: any;
  }[] {
    const events: any[] = [];

    if (body.object !== 'page') {
      return events;
    }

    body.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        const baseEvent = {
          senderId: event.sender.id,
          recipientId: event.recipient.id,
          timestamp: event.timestamp
        };

        if (event.message) {
          events.push({
            ...baseEvent,
            type: 'message',
            data: {
              messageId: event.message.mid,
              text: event.message.text,
              attachments: event.message.attachments,
              quickReply: event.message.quick_reply,
              replyTo: event.message.reply_to
            }
          });
        }

        if (event.postback) {
          events.push({
            ...baseEvent,
            type: 'postback',
            data: {
              title: event.postback.title,
              payload: event.postback.payload,
              referral: event.postback.referral
            }
          });
        }

        if (event.delivery) {
          events.push({
            ...baseEvent,
            type: 'delivery',
            data: {
              messageIds: event.delivery.mids,
              watermark: event.delivery.watermark
            }
          });
        }

        if (event.read) {
          events.push({
            ...baseEvent,
            type: 'read',
            data: {
              watermark: event.read.watermark
            }
          });
        }

        if (event.referral) {
          events.push({
            ...baseEvent,
            type: 'referral',
            data: {
              ref: event.referral.ref,
              source: event.referral.source,
              type: event.referral.type
            }
          });
        }
      });
    });

    return events;
  }

  // Helper methods
  createQuickReply(title: string, payload: string, imageUrl?: string): MessengerQuickReply {
    return {
      content_type: 'text',
      title: title,
      payload: payload,
      image_url: imageUrl
    };
  }

  createButton(type: MessengerButton['type'], title: string, urlOrPayload: string): MessengerButton {
    const button: MessengerButton = {
      type: type,
      title: title
    };

    if (type === 'web_url') {
      button.url = urlOrPayload;
    } else if (type === 'postback') {
      button.payload = urlOrPayload;
    } else if (type === 'phone_number') {
      button.phone_number = urlOrPayload;
    }

    return button;
  }

  createGenericTemplate(elements: Array<{
    title: string;
    subtitle?: string;
    image_url?: string;
    default_action?: {
      type: 'web_url';
      url: string;
    };
    buttons?: MessengerButton[];
  }>): any[] {
    return elements.map(element => ({
      title: element.title,
      subtitle: element.subtitle,
      image_url: element.image_url,
      default_action: element.default_action,
      buttons: element.buttons
    }));
  }

  // Health check
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me?access_token=${this.config.pageAccessToken}`
      );

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Messenger API error: ${result.error.message}`);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Default configuration
export const DEFAULT_MESSENGER_CONFIG: MessengerConfig = {
  pageAccessToken: process.env.MESSENGER_PAGE_ACCESS_TOKEN || '',
  appSecret: process.env.MESSENGER_APP_SECRET || '',
  verifyToken: process.env.MESSENGER_VERIFY_TOKEN || '',
  webhookUrl: process.env.MESSENGER_WEBHOOK_URL || '',
  apiVersion: process.env.MESSENGER_API_VERSION || 'v18.0'
};

// Export singleton instance
export const messengerBot = new MessengerBot(DEFAULT_MESSENGER_CONFIG);