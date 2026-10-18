import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../database/models/user.model';
import { UpdateProfileDto, UpdatePreferencesDto, ChangePasswordDto } from './dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private toPublicProfile(user: UserDocument) {
    return {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      preferredLocale: user.preferredLocale,
      timezone: user.timezone,
      notificationPreferences: user.notificationPreferences,
      createdAt: user.createdAt,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }
    return { data: this.toPublicProfile(user) };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const update: Record<string, unknown> = {};
    if (dto.displayName !== undefined) update.displayName = dto.displayName;
    if (dto.preferredLocale !== undefined) update.preferredLocale = dto.preferredLocale;
    if (dto.timezone !== undefined) update.timezone = dto.timezone;

    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }
    return { data: this.toPublicProfile(user) };
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const update: Record<string, unknown> = {};
    if (dto.preferredLocale !== undefined) update.preferredLocale = dto.preferredLocale;
    if (dto.timezone !== undefined) update.timezone = dto.timezone;

    if (dto.notificationPreferences) {
      for (const [key, value] of Object.entries(dto.notificationPreferences)) {
        if (value !== undefined) {
          update[`notificationPreferences.${key}`] = value;
        }
      }
    }

    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }
    return { data: this.toPublicProfile(user) };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }

    const valid = user.passwordHash
      ? await bcrypt.compare(dto.currentPassword, user.passwordHash)
      : false;
    if (!valid) {
      throw new UnauthorizedException('הסיסמה הנוכחית שגויה');
    }

    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException('הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await user.save();

    return { success: true };
  }
}
