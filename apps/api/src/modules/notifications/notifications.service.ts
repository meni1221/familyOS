import { Injectable, NotFoundException } from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from '../../database/models/notification.model';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PageQueryDto, resolvePage, toPage } from '../../pagination/pagination';

export interface CreateNotificationInput {
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private readonly realtime: RealtimeGateway,
  ) {}

  async getNotifications(familyId: string, userId: string, query: PageQueryDto = {}) {
    const { limit, offset } = resolvePage(query);
    const notifications = await this.notificationModel
      .find({ familyId, recipientUserId: userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit + 1)
      .exec();
    return toPage(notifications, limit);
  }

  async getUnreadCount(familyId: string, userId: string) {
    const count = await this.notificationModel
      .countDocuments({ familyId, recipientUserId: userId, readAt: null })
      .exec();
    return { count };
  }

  /**
   * Creates a notification for one family member and pushes it to the family
   * room immediately, so an open client updates without a refetch.
   */
  async create(familyId: string, recipientUserId: string, input: CreateNotificationInput) {
    const notification = await this.notificationModel.create({
      familyId,
      recipientUserId,
      type: input.type,
      title: input.title,
      message: input.message,
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId,
      readAt: null,
    });

    this.realtime.emitNotificationCreated(familyId, notification.toJSON());

    return { data: notification };
  }

  async markAsRead(familyId: string, userId: string, notificationId: string) {
    if (!isValidObjectId(notificationId)) {
      throw new NotFoundException('התראה לא נמצאה');
    }

    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: notificationId, familyId, recipientUserId: userId },
        { $set: { readAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!notification) {
      throw new NotFoundException('התראה לא נמצאה');
    }

    this.realtime.emitNotificationRead(familyId, { id: notificationId });

    return { data: notification };
  }

  async markAllAsRead(familyId: string, userId: string) {
    const result = await this.notificationModel
      .updateMany(
        { familyId, recipientUserId: userId, readAt: null },
        { $set: { readAt: new Date() } },
      )
      .exec();

    this.realtime.emitNotificationRead(familyId, { all: true });

    return { success: true, updated: result.modifiedCount ?? 0 };
  }
}
