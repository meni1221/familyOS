import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Family, FamilyDocument } from '../../database/models/family.model';
import {
  FamilyMembership,
  FamilyMembershipDocument,
} from '../../database/models/family-membership.model';
import {
  FamilyInvitation,
  FamilyInvitationDocument,
} from '../../database/models/family-invitation.model';
import { User, UserDocument } from '../../database/models/user.model';
import { hashToken, sessionStore } from '../auth/session.store';
import { CreateInvitationDto } from './dto';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class FamiliesService {
  constructor(
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(FamilyMembership.name) private membershipModel: Model<FamilyMembershipDocument>,
    @InjectModel(FamilyInvitation.name)
    private invitationModel: Model<FamilyInvitationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getUserFamilies(userId: string) {
    const memberships = await this.membershipModel.find({ userId }).exec();
    const families = await this.familyModel.find({
      _id: { $in: memberships.map((m) => m.familyId) },
    }).exec();

    return {
      data: families.map((family) => {
        const membership = memberships.find(
          (m) => m.familyId.toString() === family._id.toString(),
        );
        return {
          id: family._id.toString(),
          name: family.name,
          role: membership?.role ?? 'MEMBER',
          defaultCurrency: family.defaultCurrency,
          timezone: family.timezone,
        };
      }),
    };
  }

  async createFamily(userId: string, name: string) {
    const family = await this.familyModel.create({ name });

    try {
      await this.membershipModel.create({
        familyId: family._id,
        userId,
        role: 'OWNER',
      });

      await this.userModel
        .updateOne({ _id: userId }, { $addToSet: { families: family._id } })
        .exec();
    } catch (error) {
      // Best-effort rollback so we do not leave an orphaned family behind.
      await this.familyModel.deleteOne({ _id: family._id }).exec().catch(() => undefined);
      throw error;
    }

    return { data: family };
  }

  async getCurrentFamily(familyId?: string) {
    if (!familyId || !isValidObjectId(familyId)) {
      throw new NotFoundException('משפחה לא נמצאה');
    }

    const family = await this.familyModel.findById(familyId).exec();
    if (!family) {
      throw new NotFoundException('משפחה לא נמצאה');
    }

    const memberCount = await this.membershipModel.countDocuments({ familyId }).exec();

    return {
      data: {
        id: family._id.toString(),
        name: family.name,
        defaultCurrency: family.defaultCurrency,
        defaultLocale: family.defaultLocale,
        timezone: family.timezone,
        memberCount,
      },
    };
  }

  async getMembers(familyId: string, currentUserId: string) {
    if (!familyId || !isValidObjectId(familyId)) {
      return { data: [] };
    }

    const memberships = await this.membershipModel.find({ familyId }).exec();
    const users = await this.userModel
      .find({ _id: { $in: memberships.map((m) => m.userId) } })
      .exec();
    const usersById = new Map(users.map((u) => [u._id.toString(), u]));

    const members = memberships
      .map((membership) => {
        const user = usersById.get(membership.userId.toString());
        return {
          id: membership.userId.toString(),
          displayName: user?.displayName ?? '',
          email: user?.email ?? '',
          role: membership.role,
          joinedAt: membership.joinedAt,
          isYou: membership.userId.toString() === currentUserId,
        };
      })
      .sort((a, b) => {
        const ownerDiff = (a.role === 'OWNER' ? 0 : 1) - (b.role === 'OWNER' ? 0 : 1);
        if (ownerDiff !== 0) return ownerDiff;
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      });

    return { data: members };
  }

  async getInvitations(familyId: string) {
    if (!familyId || !isValidObjectId(familyId)) {
      return { data: [] };
    }

    const invitations = await this.invitationModel
      .find({ familyId, revokedAt: null })
      .sort({ createdAt: -1 })
      .exec();

    const now = Date.now();

    return {
      data: invitations.map((invitation) => ({
        id: invitation._id.toString(),
        email: invitation.email,
        role: invitation.role,
        status: invitation.acceptedAt
          ? 'ACCEPTED'
          : invitation.expiresAt.getTime() < now
            ? 'EXPIRED'
            : 'PENDING',
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      })),
    };
  }

  async createInvitation(familyId: string, currentUserId: string, dto: CreateInvitationDto) {
    await this.assertOwner(familyId, currentUserId, 'רק בעל/ת המשפחה יכול/ה להזמין');

    const email = dto.email.toLowerCase().trim();

    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      const alreadyMember = await this.membershipModel
        .findOne({ familyId, userId: existingUser._id })
        .exec();
      if (alreadyMember) {
        throw new ConflictException('המשתמש/ת כבר חבר/ה במשפחה');
      }
    }

    const pending = await this.invitationModel
      .findOne({
        familyId,
        email,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      })
      .exec();
    if (pending) {
      throw new ConflictException('כבר קיימת הזמנה ממתינה לכתובת זו');
    }

    const rawToken = randomBytes(32).toString('hex');

    const invitation = await this.invitationModel.create({
      familyId,
      email,
      role: dto.role ?? 'MEMBER',
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      createdByUserId: currentUserId,
    });

    const inviteUrl = `${
      process.env.FRONTEND_URL ?? 'http://localhost:5173'
    }/app/settings?invite=${rawToken}`;

    return {
      data: {
        id: invitation._id.toString(),
        email: invitation.email,
        role: invitation.role,
        inviteUrl,
        expiresAt: invitation.expiresAt,
      },
    };
  }

  async revokeInvitation(familyId: string, currentUserId: string, invitationId: string) {
    await this.assertOwner(familyId, currentUserId, 'רק בעל/ת המשפחה יכול/ה לבטל הזמנה');

    if (!isValidObjectId(invitationId)) {
      throw new NotFoundException('ההזמנה לא נמצאה');
    }

    const invitation = await this.invitationModel
      .findOneAndUpdate(
        { _id: invitationId, familyId },
        { $set: { revokedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!invitation) {
      throw new NotFoundException('ההזמנה לא נמצאה');
    }

    return { success: true };
  }

  async acceptInvitation(userId: string, token: string, sessionToken?: string) {
    const invitation = await this.invitationModel
      .findOne({
        tokenHash: hashToken(token),
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      })
      .exec();

    if (!invitation) {
      throw new NotFoundException('ההזמנה אינה תקפה');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenException('ההזמנה נשלחה לכתובת אחרת');
    }

    const familyId = invitation.familyId.toString();

    const existingMembership = await this.membershipModel
      .findOne({ familyId, userId })
      .exec();
    if (!existingMembership) {
      await this.membershipModel.create({
        familyId: invitation.familyId,
        userId,
        role: invitation.role,
      });
    }

    await this.userModel
      .updateOne({ _id: userId }, { $addToSet: { families: invitation.familyId } })
      .exec();

    invitation.acceptedAt = new Date();
    await invitation.save();

    // Switch the active family for the current session (best-effort).
    if (sessionToken) {
      const key = hashToken(sessionToken);
      const session = await sessionStore.get(key);
      if (session) {
        await sessionStore.set(key, { ...session, familyId });
      }
    }

    return { success: true, familyId };
  }

  async getFamilyById(familyId: string) {
    const family = await this.familyModel.findById(familyId).exec();
    if (!family) {
      throw new NotFoundException('משפחה לא נמצאה');
    }
    return family;
  }

  private async assertOwner(familyId: string, userId: string, message: string) {
    const membership = await this.membershipModel.findOne({ familyId, userId }).exec();
    if (!membership || membership.role !== 'OWNER') {
      throw new ForbiddenException(message);
    }
  }
}
