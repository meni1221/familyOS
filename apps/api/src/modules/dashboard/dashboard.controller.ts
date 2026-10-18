import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from '../../database/models/task.model';
import { CalendarEvent, CalendarEventDocument } from '../../database/models/calendar-event.model';
import { Notification, NotificationDocument } from '../../database/models/notification.model';

@ApiTags('dashboard')
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(CalendarEvent.name) private eventModel: Model<CalendarEventDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard data for current family' })
  async getDashboard(@Req() req: Request) {
    const user = (req as any).user;
    if (!user) {
      return {
        data: {
          tasks: { today: [], overdue: [], upcoming: [] },
          events: { today: [], upcoming: [] },
          babyLogs: { recent: [] },
          budget: { monthlyExpenses: 0, budgetAmount: 0, remaining: 0, categoryBreakdown: {} },
          notifications: { unread: [], unreadCount: 0 },
        },
      };
    }

    const familyId = user.familyId ?? user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayTasks, overdueTasks, upcomingEvents, unreadCount] = await Promise.all([
      this.taskModel.find({
        familyId,
        dueAt: { $gte: today, $lt: tomorrow },
        status: { $ne: 'COMPLETED' },
      }).limit(5).exec(),
      this.taskModel.find({
        familyId,
        dueAt: { $lt: today },
        status: { $ne: 'COMPLETED' },
      }).limit(5).exec(),
      this.eventModel.find({
        familyId,
        startsAt: { $gte: today },
      }).limit(5).exec(),
      this.notificationModel.countDocuments({
        familyId,
        recipientUserId: user.id,
        readAt: null,
      }).exec(),
    ]);

    return {
      data: {
        tasks: {
          today: todayTasks,
          overdue: overdueTasks,
          upcoming: [],
        },
        events: {
          today: upcomingEvents,
          upcoming: [],
        },
        babyLogs: { recent: [] },
        budget: {
          monthlyExpenses: 0,
          budgetAmount: 0,
          remaining: 0,
          categoryBreakdown: {},
        },
        notifications: {
          unread: [],
          unreadCount,
        },
      },
    };
  }
}
