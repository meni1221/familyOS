import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CalendarEvent, CalendarEventDocument } from '../../database/models/calendar-event.model';
import { CreateEventDto, UpdateEventDto } from './dto/index';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(CalendarEvent.name) private eventModel: Model<CalendarEventDocument>,
    private readonly realtime: RealtimeGateway,
  ) {}

  private assertValidRange(startsAt: Date, endsAt: Date): void {
    if (endsAt.getTime() < startsAt.getTime()) {
      throw new BadRequestException('זמן הסיום חייב להיות אחרי זמן ההתחלה');
    }
  }

  async getEvents(familyId: string, start: Date, end: Date) {
    const events = await this.eventModel
      .find({
        familyId,
        startsAt: { $gte: start, $lte: end },
      })
      .sort({ startsAt: 1 })
      .limit(500)
      .exec();
    return { data: events };
  }

  async createEvent(familyId: string, userId: string, data: CreateEventDto) {
    const startsAt = new Date(data.startsAt);
    const endsAt = new Date(data.endsAt);
    this.assertValidRange(startsAt, endsAt);

    const event = await this.eventModel.create({
      familyId,
      title: data.title,
      description: data.description,
      startsAt,
      endsAt,
      isAllDay: data.isAllDay ?? false,
      timezone: data.timezone ?? 'Asia/Jerusalem',
      location: data.location,
      category: data.category,
      createdByUserId: userId,
    });
    this.realtime.emitEventCreated(familyId, event.toJSON());
    return { data: event };
  }

  async updateEvent(familyId: string, eventId: string, data: UpdateEventDto) {
    const update: Record<string, unknown> = { ...data };

    if (data.startsAt !== undefined) {
      update.startsAt = new Date(data.startsAt);
    }
    if (data.endsAt !== undefined) {
      update.endsAt = new Date(data.endsAt);
    }

    if (data.startsAt !== undefined || data.endsAt !== undefined) {
      const existing = await this.eventModel.findOne({ _id: eventId, familyId }).exec();
      if (!existing) {
        throw new NotFoundException('אירוע לא נמצא');
      }
      const effectiveStart = (update.startsAt as Date | undefined) ?? existing.startsAt;
      const effectiveEnd = (update.endsAt as Date | undefined) ?? existing.endsAt;
      this.assertValidRange(effectiveStart, effectiveEnd);
    }

    const event = await this.eventModel.findOneAndUpdate(
      { _id: eventId, familyId },
      update,
      { new: true },
    ).exec();

    if (!event) {
      throw new NotFoundException('אירוע לא נמצא');
    }
    this.realtime.emitEventUpdated(familyId, event.toJSON());
    return { data: event };
  }

  async deleteEvent(familyId: string, eventId: string) {
    const result = await this.eventModel.deleteOne({ _id: eventId, familyId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('אירוע לא נמצא');
    }
    this.realtime.emitEventDeleted(familyId, eventId);
    return { success: true };
  }
}
