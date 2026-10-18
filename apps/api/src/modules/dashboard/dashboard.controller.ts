import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from '../../database/models/task.model';
import { CalendarEvent, CalendarEventDocument } from '../../database/models/calendar-event.model';
import { Notification, NotificationDocument } from '../../database/models/notification.model';
import { Expense, ExpenseDocument } from '../../database/models/expense.model';
import { Budget, BudgetDocument } from '../../database/models/budget.model';
import { BabyLog, BabyLogDocument } from '../../database/models/baby-log.model';

interface CategoryTotal {
  _id: string;
  total: number;
}

@ApiTags('dashboard')
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(CalendarEvent.name) private eventModel: Model<CalendarEventDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
    @InjectModel(BabyLog.name) private babyLogModel: Model<BabyLogDocument>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Aggregated overview for the current family' })
  async getDashboard(@Req() req: Request) {
    const user = (req as any).user as { id: string; familyId: string } | undefined;

    if (!user?.familyId) {
      return emptyDashboard();
    }

    const { familyId, id: userId } = user;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

    const [
      todayTasks,
      overdueTasks,
      upcomingTasks,
      todayEvents,
      upcomingEvents,
      recentBabyLogs,
      unreadNotifications,
      unreadCount,
      monthlyBudget,
      expensesThisMonth,
      categoryTotals,
    ] = await Promise.all([
      this.taskModel
        .find({ familyId, status: { $ne: 'COMPLETED' }, dueAt: { $gte: startOfToday, $lt: startOfTomorrow } })
        .limit(5)
        .exec(),
      this.taskModel
        .find({ familyId, status: { $ne: 'COMPLETED' }, dueAt: { $lt: startOfToday } })
        .sort({ dueAt: 1 })
        .limit(5)
        .exec(),
      this.taskModel
        .find({ familyId, status: { $ne: 'COMPLETED' }, dueAt: { $gte: startOfTomorrow } })
        .sort({ dueAt: 1 })
        .limit(5)
        .exec(),
      this.eventModel
        .find({ familyId, startsAt: { $gte: startOfToday, $lt: startOfTomorrow } })
        .sort({ startsAt: 1 })
        .exec(),
      this.eventModel
        .find({ familyId, startsAt: { $gte: startOfTomorrow } })
        .sort({ startsAt: 1 })
        .limit(5)
        .exec(),
      this.babyLogModel.find({ familyId }).sort({ occurredAt: -1 }).limit(5).exec(),
      this.notificationModel
        .find({ familyId, recipientUserId: userId, readAt: null })
        .sort({ createdAt: -1 })
        .limit(5)
        .exec(),
      this.notificationModel
        .countDocuments({ familyId, recipientUserId: userId, readAt: null })
        .exec(),
      this.budgetModel
        .find({ familyId })
        .select('amount currency period name')
        .exec(),
      this.expenseModel
        .find({ familyId, occurredAt: { $gte: startOfMonth } })
        .select('amount currency category occurredAt description')
        .sort({ occurredAt: -1 })
        .limit(20)
        .exec(),
      this.expenseModel
        .aggregate<CategoryTotal>([
          { $match: { familyId: toObjectId(familyId), occurredAt: { $gte: startOfMonth } } },
          { $group: { _id: '$category', total: { $sum: '$amount' } } },
        ])
        .exec(),
    ]);

    const budgetAmount = monthlyBudget.reduce((sum, budget) => sum + budget.amount, 0);
    const monthlyExpenses = categoryTotals.reduce((sum, entry) => sum + entry.total, 0);

    return {
      tasks: { today: todayTasks, overdue: overdueTasks, upcoming: upcomingTasks },
      events: { today: todayEvents, upcoming: upcomingEvents },
      babyLogs: { recent: recentBabyLogs },
      budget: {
        monthlyExpenses,
        budgetAmount,
        remaining: budgetAmount - monthlyExpenses,
        categoryBreakdown: Object.fromEntries(
          categoryTotals.map((entry) => [entry._id ?? 'אחר', entry.total]),
        ),
        recentExpenses: expensesThisMonth,
      },
      notifications: { unread: unreadNotifications, unreadCount },
    };
  }
}

function toObjectId(value: string) {
  return new Types.ObjectId(value);
}

function emptyDashboard() {
  return {
    tasks: { today: [], overdue: [], upcoming: [] },
    events: { today: [], upcoming: [] },
    babyLogs: { recent: [] },
    budget: {
      monthlyExpenses: 0,
      budgetAmount: 0,
      remaining: 0,
      categoryBreakdown: {},
      recentExpenses: [],
    },
    notifications: { unread: [], unreadCount: 0 },
  };
}
