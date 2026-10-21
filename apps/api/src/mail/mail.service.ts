import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import type { MailMessage } from './messages';

/**
 * SMTP, if the deployment configured it.
 *
 * Mail is optional on purpose: an installation that has not set up a mail
 * server must still boot, or a missing password-reset feature would take the
 * whole family app down. `isConfigured` lets the caller decide what to do
 * instead of failing silently.
 */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private readonly transport: Transporter | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');

    this.from = this.config.get<string>('SMTP_FROM') ?? 'שלנו <no-reply@shlanu.app>';
    this.transport = host
      ? createTransport({
          host,
          port: Number(this.config.get('SMTP_PORT') ?? 587),
          secure: this.config.get('SMTP_SECURE') === 'true',
          auth: user
            ? { user, pass: this.config.get<string>('SMTP_PASS') ?? '' }
            : undefined,
        })
      : null;
  }

  onModuleInit(): void {
    if (this.transport) {
      this.logger.log(`Mail is configured through ${this.config.get<string>('SMTP_HOST')}`);
      return;
    }

    this.logger.warn(
      'SMTP is not configured: password reset links cannot be sent. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM.',
    );
  }

  get isConfigured(): boolean {
    return this.transport !== null;
  }

  /** Resolves even when mail is not configured; the caller decides what that means. */
  async send(to: string, message: MailMessage): Promise<void> {
    if (!this.transport) return;

    await this.transport.sendMail({ from: this.from, to, ...message });
  }
}
