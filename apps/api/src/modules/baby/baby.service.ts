import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BabyProfile, BabyProfileDocument } from '../../database/models/baby-profile.model';
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

  async getProfile(familyId: string) {
    const profile = await this.profileModel.findOne({ familyId }).exec();
    return { data: profile };
  }

  private async getOrCreateProfile(familyId: string): Promise<BabyProfileDocument> {
    let profile = await this.profileModel.findOne({ familyId }).exec();
    if (!profile) {
      profile = await this.profileModel.create({
        familyId,
        displayName: DEFAULT_BABY_DISPLAY_NAME,
        trackingEnabled: true,
      });
    }
    return profile;
  }

  async saveProfile(familyId: string, dto: CreateBabyProfileDto | UpdateBabyProfileDto) {
    const profile = await this.getOrCreateProfile(familyId);

    if (dto.displayName !== undefined) profile.displayName = dto.displayName;
    if (dto.dateOfBirth !== undefined) profile.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.trackingEnabled !== undefined) profile.trackingEnabled = dto.trackingEnabled;

    await profile.save();
    return { data: profile };
  }

  async getLogs(familyId: string) {
    const logs = await this.logModel
      .find({ familyId })
      .sort({ occurredAt: -1 })
      .limit(500)
      .exec();
    return { data: logs };
  }

  async createLog(familyId: string, userId: string, dto: CreateBabyLogDto) {
    let profile: BabyProfileDocument;

    if (dto.babyProfileId) {
      const found = await this.profileModel
        .findOne({ _id: dto.babyProfileId, familyId })
        .exec();
      if (!found) {
        throw new NotFoundException('פרופיל תינוק לא נמצא');
      }
      profile = found;
    } else {
      profile = await this.getOrCreateProfile(familyId);
    }

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
