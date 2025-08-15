// Email Integration
// SMTP outbound + inbound parsing for email communication

export interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  imap?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  defaults: {
    from: string;
    replyTo?: string;
    subject: string;
  };
  templates: {
    newMessage: string;
    reply: string;
    notification: string;
  };
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  inReplyTo?: string;
  references?: string[];
  messageId?: string;
  date?: Date;
  headers?: Record<string, string>;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
  contentDisposition?: 'attachment' | 'inline';
  cid?: string;
  size?: number;
}

export interface ParsedEmail {
  messageId: string;
  from: {
    name?: string;
    address: string;
  };
  to: Array<{
    name?: string;
    address: string;
  }>;
  subject: string;
  text?: string;
  html?: string;
  date: Date;
  attachments: EmailAttachment[];
  inReplyTo?: string;
  references: string[];
  conversationId?: string;
}

// Email service class
export class EmailService {
  private config: EmailConfig;
  private transporter: any; // nodemailer transporter

  constructor(config: EmailConfig) {
    this.config = config;
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    // In production, would use actual nodemailer
    this.transporter = {
      sendMail: async (options: any) => {
        console.log('[Email] Sending email:', {
          from: options.from,
          to: options.to,
          subject: options.subject
        });
        
        // Mock successful send
        return {
          messageId: `mock_${Date.now()}@sakudojo.com`,
          accepted: Array.isArray(options.to) ? options.to : [options.to],
          rejected: [],
          response: '250 Message accepted'
        };
      }
    };
  }

  // Send outbound emails
  async sendEmail(message: Partial<EmailMessage>): Promise<{
    messageId: string;
    accepted: string[];
    rejected: string[];
  }> {
    try {
      const emailOptions = {
        from: message.from || this.config.defaults.from,
        to: message.to,
        cc: message.cc,
        bcc: message.bcc,
        subject: message.subject || this.config.defaults.subject,
        text: message.text,
        html: message.html,
        attachments: message.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
          contentDisposition: att.contentDisposition,
          cid: att.cid
        })),
        inReplyTo: message.inReplyTo,
        references: message.references,
        messageId: message.messageId,
        replyTo: this.config.defaults.replyTo,
        headers: message.headers
      };

      const result = await this.transporter.sendMail(emailOptions);
      
      console.log('[Email] Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('[Email] Failed to send email:', error);
      throw error;
    }
  }

  // Send templated emails
  async sendTemplatedEmail(
    template: keyof EmailConfig['templates'],
    to: string | string[],
    variables: Record<string, any>,
    options: {
      subject?: string;
      attachments?: EmailAttachment[];
      inReplyTo?: string;
      references?: string[];
    } = {}
  ): Promise<{ messageId: string; accepted: string[]; rejected: string[] }> {
    try {
      const templateContent = this.config.templates[template];
      const renderedContent = this.renderTemplate(templateContent, variables);
      
      return await this.sendEmail({
        to: Array.isArray(to) ? to : [to],
        subject: options.subject || this.generateSubject(template, variables),
        html: renderedContent,
        text: this.htmlToText(renderedContent),
        attachments: options.attachments,
        inReplyTo: options.inReplyTo,
        references: options.references
      });
    } catch (error) {
      console.error('[Email] Failed to send templated email:', error);
      throw error;
    }
  }

  // Send chat notification
  async sendChatNotification(
    to: string,
    conversationId: string,
    message: {
      from: string;
      content: string;
      timestamp: string;
      attachments?: { name: string; url: string }[];
    }
  ): Promise<{ messageId: string; accepted: string[]; rejected: string[] }> {
    const variables = {
      conversationId,
      senderName: message.from,
      messageContent: message.content,
      timestamp: new Date(message.timestamp).toLocaleString('th-TH'),
      attachmentCount: message.attachments?.length || 0,
      attachments: message.attachments || [],
      replyUrl: `${process.env.APP_URL}/chat/${conversationId}`,
      unsubscribeUrl: `${process.env.APP_URL}/unsubscribe?conversation=${conversationId}`
    };

    return await this.sendTemplatedEmail(
      'newMessage',
      to,
      variables,
      {
        subject: `💬 ข้อความใหม่จาก ${message.from} - Saku Dojo`,
        inReplyTo: `<conversation-${conversationId}@sakudojo.com>`,
        references: [`<conversation-${conversationId}@sakudojo.com>`]
      }
    );
  }

  // Send reply notification
  async sendReplyNotification(
    to: string,
    conversationId: string,
    reply: {
      from: string;
      content: string;
      timestamp: string;
      channel: string;
    }
  ): Promise<{ messageId: string; accepted: string[]; rejected: string[] }> {
    const variables = {
      conversationId,
      senderName: reply.from,
      replyContent: reply.content,
      timestamp: new Date(reply.timestamp).toLocaleString('th-TH'),
      channel: reply.channel,
      viewUrl: `${process.env.APP_URL}/chat/${conversationId}`
    };

    return await this.sendTemplatedEmail(
      'reply',
      to,
      variables,
      {
        subject: `✅ ตอบกลับแล้วจาก ${reply.from} ผ่าน ${reply.channel}`,
        inReplyTo: `<conversation-${conversationId}@sakudojo.com>`,
        references: [`<conversation-${conversationId}@sakudojo.com>`]
      }
    );
  }

  // Parse inbound emails
  parseEmail(rawEmail: string): ParsedEmail {
    // Simplified email parsing - in production would use a proper email parser
    const lines = rawEmail.split('\n');
    const headers: Record<string, string> = {};
    let bodyStart = 0;
    
    // Parse headers
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') {
        bodyStart = i + 1;
        break;
      }
      
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).toLowerCase();
        const value = line.substring(colonIndex + 1).trim();
        headers[key] = value;
      }
    }
    
    // Parse body
    const body = lines.slice(bodyStart).join('\n');
    
    // Extract conversation ID from subject or message-id
    const subject = headers.subject || '';
    const conversationMatch = subject.match(/\[#(\w+)\]/);
    const conversationId = conversationMatch ? conversationMatch[1] : undefined;
    
    return {
      messageId: headers['message-id'] || `parsed_${Date.now()}`,
      from: this.parseEmailAddress(headers.from || ''),
      to: [this.parseEmailAddress(headers.to || '')],
      subject: subject,
      text: body,
      html: body.includes('<') ? body : undefined,
      date: new Date(headers.date || Date.now()),
      attachments: [], // Would parse attachments in production
      inReplyTo: headers['in-reply-to'],
      references: headers.references ? headers.references.split(' ') : [],
      conversationId
    };
  }

  // Extract conversation ID from email
  extractConversationId(email: ParsedEmail): string | null {
    // Try to extract from subject
    const subjectMatch = email.subject.match(/\[#(\w+)\]/);
    if (subjectMatch) {
      return subjectMatch[1];
    }
    
    // Try to extract from references
    if (email.references.length > 0) {
      const refMatch = email.references[0].match(/conversation-(\w+)@/);
      if (refMatch) {
        return refMatch[1];
      }
    }
    
    // Try to extract from in-reply-to
    if (email.inReplyTo) {
      const replyMatch = email.inReplyTo.match(/conversation-(\w+)@/);
      if (replyMatch) {
        return replyMatch[1];
      }
    }
    
    return null;
  }

  // Generate magic reply link
  generateMagicReplyLink(conversationId: string, userEmail: string): string {
    const token = this.generateReplyToken(conversationId, userEmail);
    return `${process.env.APP_URL}/reply/${conversationId}?token=${token}&email=${encodeURIComponent(userEmail)}`;
  }

  // Validate magic reply token
  validateReplyToken(conversationId: string, userEmail: string, token: string): boolean {
    const expectedToken = this.generateReplyToken(conversationId, userEmail);
    return token === expectedToken;
  }

  // Template rendering
  private renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(placeholder, String(value));
    }
    
    return rendered;
  }

  private generateSubject(template: keyof EmailConfig['templates'], variables: Record<string, any>): string {
    switch (template) {
      case 'newMessage':
        return `💬 ข้อความใหม่จาก ${variables.senderName} - Saku Dojo`;
      case 'reply':
        return `✅ ตอบกลับแล้วจาก ${variables.senderName}`;
      case 'notification':
        return `🔔 การแจ้งเตือนจาก Saku Dojo`;
      default:
        return this.config.defaults.subject;
    }
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  private parseEmailAddress(address: string): { name?: string; address: string } {
    const match = address.match(/^(.+?)\s*<(.+?)>$/) || address.match(/^(.+)$/);
    
    if (match && match[2]) {
      return {
        name: match[1].trim().replace(/^["']|["']$/g, ''),
        address: match[2].trim()
      };
    } else if (match && match[1]) {
      return {
        address: match[1].trim()
      };
    }
    
    return { address: address.trim() };
  }

  private generateReplyToken(conversationId: string, userEmail: string): string {
    // Simple token generation - in production use proper JWT or HMAC
    const data = `${conversationId}:${userEmail}:${process.env.EMAIL_SECRET || 'default_secret'}`;
    return Buffer.from(data).toString('base64').replace(/[+/=]/g, '');
  }

  // Health check
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test SMTP connection
      await this.transporter.sendMail({
        from: this.config.defaults.from,
        to: this.config.defaults.from,
        subject: 'Email Service Test',
        text: 'This is a test email to verify SMTP configuration.'
      });
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Default email templates
export const DEFAULT_EMAIL_TEMPLATES = {
  newMessage: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ข้อความใหม่ - Saku Dojo</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1D4ED8;">💬 ข้อความใหม่จาก {{ senderName }}</h2>
        
        <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>ข้อความ:</strong></p>
          <p style="white-space: pre-wrap;">{{ messageContent }}</p>
          
          {{#if attachmentCount}}
          <p><strong>ไฟล์แนบ:</strong> {{ attachmentCount }} ไฟล์</p>
          {{/if}}
          
          <p style="color: #666; font-size: 14px;">
            <strong>เวลา:</strong> {{ timestamp }}
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ replyUrl }}" style="background: #1D4ED8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            ตอบกลับข้อความ
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px; text-align: center;">
          หากไม่ต้องการรับอีเมลแจ้งเตือน <a href="{{ unsubscribeUrl }}">คลิกที่นี่</a><br>
          © 2024 Saku Dojo - ระบบเรียนรู้ภาษา
        </p>
      </div>
    </body>
    </html>
  `,
  
  reply: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ตอบกลับแล้ว - Saku Dojo</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #059669;">✅ ได้รับการตอบกลับแล้ว</h2>
        
        <p>{{ senderName }} ได้ตอบกลับข้อความของคุณผ่าน {{ channel }}</p>
        
        <div style="background: #F0FDF4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <p><strong>การตอบกลับ:</strong></p>
          <p style="white-space: pre-wrap;">{{ replyContent }}</p>
          
          <p style="color: #666; font-size: 14px;">
            <strong>เวลา:</strong> {{ timestamp }}
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ viewUrl }}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            ดูการสนทนาทั้งหมด
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px; text-align: center;">
          © 2024 Saku Dojo - ระบบเรียนรู้ภาษา
        </p>
      </div>
    </body>
    </html>
  `,
  
  notification: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>การแจ้งเตือน - Saku Dojo</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1D4ED8;">🔔 การแจ้งเตือนจาก Saku Dojo</h2>
        
        <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p>{{ notificationContent }}</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px; text-align: center;">
          © 2024 Saku Dojo - ระบบเรียนรู้ภาษา
        </p>
      </div>
    </body>
    </html>
  `
};

// Default configuration
export const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },
  defaults: {
    from: process.env.EMAIL_FROM || 'noreply@sakudojo.com',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@sakudojo.com',
    subject: 'Saku Dojo Notification'
  },
  templates: DEFAULT_EMAIL_TEMPLATES
};

// Export singleton instance
export const emailService = new EmailService(DEFAULT_EMAIL_CONFIG);