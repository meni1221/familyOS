import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/models/user.model';
import {
  PasswordResetToken,
  PasswordResetTokenDocument,
} from '../../database/models/password-reset-token.model';
import { MailService } from '../../mail/mail.service';
import { passwordResetMessage } from '../../mail/messages';
import { hashToken, sessionStore } from './session.store';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const INVALID_LINK_MESSAGE = 'קישור איפוס הסיסמה אינו תקף או שפג תוקפו';

/**
 * Forgetting a password, without telling the caller who has an account.
 *
 * `request()` never reveals whether the address exists — the response is the
 * same either way. `reset()` accepts a link once, for an hour, and signs the
 * account out everywhere: if the password was reset because someone else had
 * it, they should not keep the session they opened with it.
 */
@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(PasswordResetToken.name)
    private readonly tokenModel: Model<PasswordResetTokenDocument>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async request(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email: email.trim().toLowerCase() }).exec();
    if (!user) return;

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    // A new request retires the previous link: two live links to one account is
    // two chances for whoever reads the older mailbox.
    await this.tokenModel.deleteMany({ userId: user._id }).exec();
    await this.tokenModel.create({
      userId: user._id,
      tokenHash: hashToken(token),
      expiresAt,
    });

    const link = `${this.frontendUrl()}/reset-password?token=${token}`;

    if (this.mail.isConfigured) {
      await this.mail.send(user.email, passwordResetMessage(link));
      return;
    }

    // Development prints the link so the flow can be tried without a mail
    // server. Production does not: a log is not a private channel, and whoever
    // reads it could take over the account.
    if (this.config.get('NODE_ENV') === 'production') {
      this.logger.error(
        'A password reset was requested, but SMTP is not configured, so no mail was sent.',
      );
      return;
    }

    this.logger.warn(`SMTP is not configured. Password reset link for ${user.email}: ${link}`);
  }

  async reset(token: string, password: string): Promise<void> {
    const record = await this.tokenModel
      .findOne({
        tokenHash: hashToken(token),
        usedAt: null,
        expiresAt: { $gt: new Date() },
      })
      .exec();

    if (!record) {
      throw new BadRequestException(INVALID_LINK_MESSAGE);
    }

    const user = await this.userModel.findById(record.userId).exec();
    if (!user) {
      throw new BadRequestException(INVALID_LINK_MESSAGE);
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();

    record.usedAt = new Date();
    await record.save();

    await sessionStore.deleteForUser(String(user._id));
  }

  private frontendUrl(): string {
    return (this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173').replace(/\/+$/, '');
  }
}
