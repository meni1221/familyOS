import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../database/models/user.model';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }
    return {
      data: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        preferredLocale: user.preferredLocale,
        timezone: user.timezone,
      },
    };
  }

  async updateProfile(userId: string, data: any) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        displayName: data.displayName,
        preferredLocale: data.preferredLocale,
        timezone: data.timezone,
      },
      { new: true },
    ).exec();

    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }
    return { data: user };
  }

  async updatePreferences(userId: string, data: any) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        preferredLocale: data.preferredLocale,
        timezone: data.timezone,
      },
      { new: true },
    ).exec();

    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }
    return { data: user };
  }
}
