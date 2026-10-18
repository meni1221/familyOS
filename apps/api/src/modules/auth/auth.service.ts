import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../database/models/user.model';
import { Family, FamilyDocument } from '../../database/models/family.model';
import {
  FamilyMembership,
  FamilyMembershipDocument,
} from '../../database/models/family-membership.model';
import { hashToken, sessionStore } from './session.store';
import { RegisterDto, LoginDto } from './dto';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(FamilyMembership.name)
    private membershipModel: Model<FamilyMembershipDocument>,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      // 409, not 401: the request is well-formed, the address simply exists.
      // A 401 here made a failed sign-up look like a session problem in the UI.
      throw new ConflictException('כתובת אימייל כבר רשומה');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.userModel.create({
      email,
      displayName: dto.displayName,
      passwordHash,
      preferredLocale: dto.preferredLocale ?? 'he',
      families: [],
    });

    // Every new account starts with its own family so the app is usable immediately.
    const family = await this.familyModel.create({
      name: `המשפחה של ${dto.displayName}`,
      defaultLocale: dto.preferredLocale ?? 'he',
      defaultCurrency: 'ILS',
      timezone: 'Asia/Jerusalem',
    });

    await this.membershipModel.create({
      familyId: family._id,
      userId: user._id,
      role: 'OWNER',
    });

    user.families = [family._id];
    await user.save();

    return this.createSession(user, family._id.toString());
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.userModel.findOne({ email }).exec();
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('אימייל או סיסמה שגויים');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('אימייל או סיסמה שגויים');
    }

    const familyId = await this.resolveFamilyId(user._id.toString());
    return this.createSession(user, familyId);
  }

  async logout(sessionToken: string) {
    await sessionStore.delete(hashToken(sessionToken));
  }

  async validateSession(sessionToken: string) {
    const session = await sessionStore.get(hashToken(sessionToken));
    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await this.userModel.findById(session.userId).exec();
    if (!user) {
      return null;
    }

    const familyId = session.familyId ?? (await this.resolveFamilyId(user._id.toString()));

    return {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      preferredLocale: user.preferredLocale,
      familyId,
    };
  }

  private async resolveFamilyId(userId: string): Promise<string | undefined> {
    const membership = await this.membershipModel.findOne({ userId }).exec();
    return membership ? membership.familyId.toString() : undefined;
  }

  private async createSession(user: UserDocument, familyId?: string) {
    const sessionToken = randomBytes(32).toString('hex');

    await sessionStore.set(hashToken(sessionToken), {
      userId: user._id.toString(),
      familyId,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        preferredLocale: user.preferredLocale,
        familyId,
      },
      sessionToken,
    };
  }
}
