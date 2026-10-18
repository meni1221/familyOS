import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CalendarEvent, CalendarEventDocument } from '../../database/models/calendar-event.model';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(CalendarEvent.name) private eventModel: Model<CalendarEventDocument>,
  ) {}

  async getEvents(familyId: string, start: Date, end: Date) {
    const events = await this.eventModel
      .find({
        familyId,
        startsAt: { $gte: start, $lte: end },
      })
      .sort({ startsAt: 1 })
      .exec();
    return { data: events };
  }

  async createEvent(familyId: string, userId: string, data: any) {
    const event = await this.eventModel.create({
      familyId,
      title: data.title,
      description: data.description,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      isAllDay: data.isAllDay ?? false,
      timezone: data.timezone ?? 'Asia/Jerusalem',
      location: data.location,
      category: data.category,
      createdByUserId: userId,
    });
    return { data: event };
  }

  async updateEvent(familyId: string, eventId: string, data: any) {
    const event = await this.eventModel.findOneAndUpdate(
      { _id: eventId, familyId },
      data,
      { new: true },
    ).exec();

    if (!event) {
      throw new NotFoundException('אירוע לא נמצא');
    }
    return { data: event };
  }

  async deleteEvent(familyId: string, eventId: string) {
    const result = await this.eventModel.deleteOne({ _id: eventId, familyId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('אירוע לא נמצא');
    }
    return { success: true };
  }
}
