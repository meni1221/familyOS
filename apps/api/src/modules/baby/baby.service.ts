import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BabyProfile, BabyProfileDocument } from '../../database/models/baby-profile.model';
import { BabyLog, BabyLogDocument } from '../../database/models/baby-log.model';

@Injectable()
export class BabyService {
  constructor(
    @InjectModel(BabyProfile.name) private profileModel: Model<BabyProfileDocument>,
    @InjectModel(BabyLog.name) private logModel: Model<BabyLogDocument>,
  ) {}

  async getProfile(familyId: string) {
    const profile = await this.profileModel.findOne({ familyId }).exec();
    return { data: profile };
  }

  async getLogs(familyId: string) {
    const logs = await this.logModel
      .find({ familyId })
      .sort({ occurredAt: -1 })
      .exec();
    return { data: logs };
  }

  async createLog(familyId: string, userId: string, data: any) {
    const log = await this.logModel.create({
      familyId,
      babyProfileId: data.babyProfileId,
      type: data.type,
      occurredAt: new Date(data.occurredAt),
      endedAt: data.endedAt ? new Date(data.endedAt) : null,
      details: data.details,
      note: data.note,
      createdByUserId: userId,
    });
    return { data: log };
  }

  async updateLog(familyId: string, logId: string, data: any) {
    const log = await this.logModel.findOneAndUpdate(
      { _id: logId, familyId },
      data,
      { new: true },
    ).exec();

    if (!log) {
      throw new NotFoundException('רשומה לא נמצאה');
    }
    return { data: log };
  }

  async deleteLog(familyId: string, logId: string) {
    const result = await this.logModel.deleteOne({ _id: logId, familyId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('רשומה לא נמצאה');
    }
    return { success: true };
  }
}
