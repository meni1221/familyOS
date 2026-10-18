import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { Task, TaskSchema } from '../../database/models/task.model';
import {
  CalendarEvent,
  CalendarEventSchema,
} from '../../database/models/calendar-event.model';
import { Notification, NotificationSchema } from '../../database/models/notification.model';
import { Expense, ExpenseSchema } from '../../database/models/expense.model';
import { Budget, BudgetSchema } from '../../database/models/budget.model';
import { BabyLog, BabyLogSchema } from '../../database/models/baby-log.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: CalendarEvent.name, schema: CalendarEventSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Budget.name, schema: BudgetSchema },
      { name: BabyLog.name, schema: BabyLogSchema },
    ]),
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
