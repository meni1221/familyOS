import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  BABY_COLORS,
  BabyProfile,
  BabyProfileDocument,
  DEFAULT_BABY_COLOR,
} from '../../database/models/baby-profile.model';
import { BabyLog, BabyLogDocument } from '../../database/models/baby-log.model';
import { CreateBabyLogDto, UpdateBabyLogDto } from './dto/index';
import { CreateBabyProfileDto, UpdateBabyProfileDto } from './dto/index';
import { RealtimeGateway } from '../realtime/realtime.gateway';

const DEFAULT_BABY_DISPLAY_NAME = 'התינוק/ת שלי';

@Injectable()
export class BabyService {
  constructor(
    @InjectModel(BabyProfile.name) private profileModel: Model<BabyProfileDocument>,
    @InjectModel(BabyLog.name) private logModel: Model<BabyLogDocument>,
    private readonly realtime: RealtimeGateway,
  ) {}

  /** Every baby of the family, oldest first — the order the switcher shows. */
  async listProfiles(familyId: string) {
    const profiles = await this.profileModel.find({ familyId }).sort({ createdAt: 1 }).exec();
    return { data: profiles };
  }

  async createProfile(familyId: string, dto: CreateBabyProfileDto) {
    const profile = await this.profileModel.create({
      familyId,
      displayName: dto.displayName,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      color: dto.color ?? (await this.nextFreeColor(familyId)),
      trackingEnabled: dto.trackingEnabled ?? true,
    });

    this.realtime.emitBabyProfileCreated(familyId, profile.toJSON());
    return { data: profile };
  }

  async updateProfile(familyId: string, profileId: string, dto: UpdateBabyProfileDto) {
    if (!isValidObjectId(profileId)) {
      throw new NotFoundException('פרופיל תינוק לא נמצא');
    }

    const update: Record<string, unknown> = {};
    if (dto.displayName !== undefined) update.displayName = dto.displayName;
    if (dto.dateOfBirth !== undefined) update.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.color !== undefined) update.color = dto.color;
    if (dto.trackingEnabled !== undefined) update.trackingEnabled = dto.trackingEnabled;

    const profile = await this.profileModel
      .findOneAndUpdate({ _id: profileId, familyId }, update, { new: true })
      .exec();

    if (!profile) {
      throw new NotFoundException('פרופיל תינוק לא נמצא');
    }

    this.realtime.emitBabyProfileUpdated(familyId, profile.toJSON());
    return { data: profile };
  }

  async deleteProfile(familyId: string, profileId: string) {
    if (!isValidObjectId(profileId)) {
      throw new NotFoundException('פרופיל תינוק לא נמצא');
    }

    const profile = await this.profileModel
      .findOneAndDelete({ _id: profileId, familyId })
      .exec();

    if (!profile) {
      throw new NotFoundException('פרופיל תינוק לא נמצא');
    }

    // A log whose baby is gone is a row nobody can attribute to anyone, so it
    // leaves with the profile. The count goes back to the caller, which warns
    // about it before asking.
    const logs = await this.logModel.deleteMany({ familyId, babyProfileId: profileId }).exec();

    this.realtime.emitBabyProfileDeleted(familyId, profileId);
    return { success: true, deletedLogs: logs.deletedCount ?? 0 };
  }

  /** The first colour nobody is using yet, so twins look different by default. */
  private async nextFreeColor(familyId: string): Promise<string> {
    const used = await this.profileModel.find({ familyId }).select('color').exec();
    const taken = new Set(used.map((profile) => profile.color));

    return BABY_COLORS.find((color) => !taken.has(color)) ?? DEFAULT_BABY_COLOR;
  }

  /**
   * The baby a new log belongs to.
   *
   * With no id: an empty family gets the default profile created for it, a
   * family with one baby logs for that baby — and a family with twins has to
   * say which one, rather than have the entry filed under the wrong child.
   */
  private async resolveProfile(
    familyId: string,
    babyProfileId?: string,
  ): Promise<BabyProfileDocument> {
    if (babyProfileId) {
      if (!isValidObjectId(babyProfileId)) {
        throw new NotFoundException('פרופיל תינוק לא נמצא');
      }

      const found = await this.profileModel
        .findOne({ _id: babyProfileId, familyId })
        .exec();
      if (!found) {
        throw new NotFoundException('פרופיל תינוק לא נמצא');
      }

      return found;
    }

    const profiles = await this.profileModel
      .find({ familyId })
      .sort({ createdAt: 1 })
      .limit(2)
      .exec();

    if (profiles.length === 0) {
      return this.profileModel.create({
        familyId,
        displayName: DEFAULT_BABY_DISPLAY_NAME,
        color: DEFAULT_BABY_COLOR,
        trackingEnabled: true,
      });
    }

    if (profiles.length > 1) {
      throw new BadRequestException('נדרש לבחור תינוק/ת לרשומה');
    }

    return profiles[0];
  }

  /** The timeline, newest first, optionally for one baby only. */
  async getLogs(familyId: string, babyProfileId?: string) {
    const filter: Record<string, unknown> = { familyId };
    if (babyProfileId) {
      if (!isValidObjectId(babyProfileId)) return { data: [] };
      filter.babyProfileId = babyProfileId;
    }

    const logs = await this.logModel
      .find(filter)
      .sort({ occurredAt: -1 })
      .limit(500)
      .exec();
    return { data: logs };
  }

  async createLog(familyId: string, userId: string, dto: CreateBabyLogDto) {
    const profile = await this.resolveProfile(familyId, dto.babyProfileId);

    const log = await this.logModel.create({
      familyId,
      babyProfileId: profile._id,
      type: dto.type,
      occurredAt: new Date(dto.occurredAt),
      endedAt: dto.endedAt ? new Date(dto.endedAt) : null,
      details: dto.details,
      note: dto.note,
      createdByUserId: userId,
    });
    this.realtime.emitBabyLogCreated(familyId, log.toJSON());
    return { data: log };
  }

  async updateLog(familyId: string, logId: string, dto: UpdateBabyLogDto) {
    const update: Record<string, unknown> = {};
    if (dto.type !== undefined) update.type = dto.type;
    if (dto.occurredAt !== undefined) update.occurredAt = new Date(dto.occurredAt);
    if (dto.endedAt !== undefined) update.endedAt = new Date(dto.endedAt);
    if (dto.note !== undefined) update.note = dto.note;
    if (dto.details !== undefined) update.details = dto.details;

    const log = await this.logModel.findOneAndUpdate(
      { _id: logId, familyId },
      update,
      { new: true },
    ).exec();

    if (!log) {
      throw new NotFoundException('רשומה לא נמצאה');
    }
    this.realtime.emitBabyLogUpdated(familyId, log.toJSON());
    return { data: log };
  }

  async deleteLog(familyId: string, logId: string) {
    const result = await this.logModel.deleteOne({ _id: logId, familyId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('רשומה לא נמצאה');
    }
    this.realtime.emitBabyLogDeleted(familyId, logId);
    return { success: true };
  }
}
