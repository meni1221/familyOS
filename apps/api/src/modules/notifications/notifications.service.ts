import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from '../../database/models/notification.model';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async getNotifications(familyId: string, userId: string) {
    const notifications = await this.notificationModel
      .find({ familyId, recipientUserId: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
    return { data: notifications };
  }

  async getUnreadCount(familyId: string, userId: string) {
    const count = await this.notificationModel
      .countDocuments({ familyId, recipientUserId: userId, readAt: null })
      .exec();
    return { count };
  }

  async markAllAsRead(familyId: string, userId: string) {
    await this.notificationModel.updateMany(
      { familyId, recipientUserId: userId, readAt: null },
      { readAt: new Date() },
    ).exec();
    return { success: true };
  }
}
