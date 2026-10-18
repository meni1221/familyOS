import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../database/models/user.model';
import { sessionStore } from './session.store';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email }).exec();
    if (existing) {
      throw new UnauthorizedException('כתובת אימייל כבר רשומה');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.userModel.create({
      email: dto.email,
      displayName: dto.displayName,
      passwordHash,
      preferredLocale: dto.preferredLocale ?? 'he',
      families: [],
    });

    const sessionToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');

    sessionStore.set(tokenHash, {
      userId: user._id.toString(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        preferredLocale: user.preferredLocale,
      },
      sessionToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('אימייל או סיסמה שגויים');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('אימייל או סיסמה שגויים');
    }

    const sessionToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');

    sessionStore.set(tokenHash, {
      userId: user._id.toString(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        preferredLocale: user.preferredLocale,
      },
      sessionToken,
    };
  }

  async logout(sessionToken: string) {
    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');
    sessionStore.delete(tokenHash);
  }

  async validateSession(sessionToken: string) {
    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');
    const session = sessionStore.get(tokenHash);

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await this.userModel.findById(session.userId).exec();
    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      preferredLocale: user.preferredLocale,
    };
  }
}
