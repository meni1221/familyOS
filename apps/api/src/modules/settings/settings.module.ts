import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { AccountService } from './account.service';
import { User, UserSchema } from '../../database/models/user.model';
import { Family, FamilySchema } from '../../database/models/family.model';
import {
  FamilyMembership,
  FamilyMembershipSchema,
} from '../../database/models/family-membership.model';
import {
  FamilyInvitation,
  FamilyInvitationSchema,
} from '../../database/models/family-invitation.model';
import { Task, TaskSchema } from '../../database/models/task.model';
import { CalendarEvent, CalendarEventSchema } from '../../database/models/calendar-event.model';
import { Budget, BudgetSchema } from '../../database/models/budget.model';
import { Expense, ExpenseSchema } from '../../database/models/expense.model';
import { BabyProfile, BabyProfileSchema } from '../../database/models/baby-profile.model';
import { BabyLog, BabyLogSchema } from '../../database/models/baby-log.model';
import { Notification, NotificationSchema } from '../../database/models/notification.model';
import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from '../../database/models/password-reset-token.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Family.name, schema: FamilySchema },
      { name: FamilyMembership.name, schema: FamilyMembershipSchema },
      { name: FamilyInvitation.name, schema: FamilyInvitationSchema },
      { name: Task.name, schema: TaskSchema },
      { name: CalendarEvent.name, schema: CalendarEventSchema },
      { name: Budget.name, schema: BudgetSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: BabyProfile.name, schema: BabyProfileSchema },
      { name: BabyLog.name, schema: BabyLogSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
    ]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, AccountService],
})
export class SettingsModule {}
