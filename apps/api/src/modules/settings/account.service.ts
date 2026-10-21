import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/models/user.model';
import { Family, FamilyDocument } from '../../database/models/family.model';
import {
  FamilyMembership,
  FamilyMembershipDocument,
} from '../../database/models/family-membership.model';
import {
  FamilyInvitation,
  FamilyInvitationDocument,
} from '../../database/models/family-invitation.model';
import { Task, TaskDocument } from '../../database/models/task.model';
import { CalendarEvent, CalendarEventDocument } from '../../database/models/calendar-event.model';
import { Budget, BudgetDocument } from '../../database/models/budget.model';
import { Expense, ExpenseDocument } from '../../database/models/expense.model';
import { BabyProfile, BabyProfileDocument } from '../../database/models/baby-profile.model';
import { BabyLog, BabyLogDocument } from '../../database/models/baby-log.model';
import { Notification, NotificationDocument } from '../../database/models/notification.model';
import {
  PasswordResetToken,
  PasswordResetTokenDocument,
} from '../../database/models/password-reset-token.model';
import { sessionStore } from '../auth/session.store';

/**
 * The two rights every account needs: take your data with you, and leave.
 *
 * Both are scoped to the family the session is currently looking at, which is
 * what the person sees in the app.
 */
@Injectable()
export class AccountService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Family.name) private readonly familyModel: Model<FamilyDocument>,
    @InjectModel(FamilyMembership.name)
    private readonly membershipModel: Model<FamilyMembershipDocument>,
    @InjectModel(FamilyInvitation.name)
    private readonly invitationModel: Model<FamilyInvitationDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(CalendarEvent.name)
    private readonly eventModel: Model<CalendarEventDocument>,
    @InjectModel(Budget.name) private readonly budgetModel: Model<BudgetDocument>,
    @InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>,
    @InjectModel(BabyProfile.name)
    private readonly babyProfileModel: Model<BabyProfileDocument>,
    @InjectModel(BabyLog.name) private readonly babyLogModel: Model<BabyLogDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(PasswordResetToken.name)
    private readonly resetTokenModel: Model<PasswordResetTokenDocument>,
  ) {}

  /**
   * Everything the account holds, as one JSON document.
   *
   * No password hash and no session tokens: an export is a copy of the data,
   * not a copy of the credentials.
   */
  async export(userId: string, familyId: string) {
    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }

    const [family, members, tasks, events, budgets, expenses, babyProfiles, babyLogs, notifications] =
      await Promise.all([
        this.familyModel.findById(familyId).lean().exec(),
        this.membershipModel.find({ familyId }).lean().exec(),
        this.taskModel.find({ familyId }).lean().exec(),
        this.eventModel.find({ familyId }).lean().exec(),
        this.budgetModel.find({ familyId }).lean().exec(),
        this.expenseModel.find({ familyId }).lean().exec(),
        this.babyProfileModel.find({ familyId }).lean().exec(),
        this.babyLogModel.find({ familyId }).lean().exec(),
        this.notificationModel.find({ familyId, recipientUserId: userId }).lean().exec(),
      ]);

    return {
      generatedAt: new Date().toISOString(),
      account: {
        id: String(user._id),
        email: user.email,
        displayName: user.displayName,
        preferredLocale: user.preferredLocale,
        timezone: user.timezone,
        notificationPreferences: user.notificationPreferences,
        createdAt: user.createdAt,
      },
      family: family
        ? {
            id: String(family._id),
            name: family.name,
            defaultCurrency: family.defaultCurrency,
            timezone: family.timezone,
          }
        : null,
      members: members.map((member) => ({
        userId: String(member.userId),
        role: member.role,
        joinedAt: member.joinedAt,
      })),
      data: { tasks, events, budgets, expenses, babyProfiles, babyLogs, notifications },
    };
  }

  /**
   * Closes the account.
   *
   * Membership is what is deleted, not the family: the other people in it keep
   * their data. An owner who is not alone hands ownership to the member who
   * joined first, because a family with no owner cannot be managed. A family
   * whose only member is this account existed for this account, so it is
   * deleted with it — and that is the one case where family data is destroyed.
   */
  async deleteAccount(userId: string, password: string): Promise<{ success: true }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }

    const valid = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!valid) {
      throw new UnauthorizedException('הסיסמה שגויה');
    }

    const memberships = await this.membershipModel.find({ userId: user._id }).exec();

    for (const membership of memberships) {
      if (membership.role !== 'OWNER') continue;

      const successor = await this.membershipModel
        .findOne({ familyId: membership.familyId, userId: { $ne: user._id } })
        .sort({ joinedAt: 1 })
        .exec();

      if (successor) {
        successor.role = 'OWNER';
        await successor.save();
      } else {
        await this.purgeFamily(String(membership.familyId));
      }
    }

    await Promise.all([
      this.membershipModel.deleteMany({ userId: user._id }).exec(),
      this.notificationModel.deleteMany({ recipientUserId: user._id }).exec(),
      this.resetTokenModel.deleteMany({ userId: user._id }).exec(),
      // A task assigned to somebody who left has no one to be assigned to.
      this.taskModel.updateMany(
        { assigneeUserId: user._id },
        { $set: { assigneeUserId: null } }
      ).exec(),
    ]);

    await this.userModel.deleteOne({ _id: user._id }).exec();
    await sessionStore.deleteForUser(userId);

    return { success: true };
  }

  private async purgeFamily(familyId: string): Promise<void> {
    await Promise.all([
      this.taskModel.deleteMany({ familyId }).exec(),
      this.eventModel.deleteMany({ familyId }).exec(),
      this.budgetModel.deleteMany({ familyId }).exec(),
      this.expenseModel.deleteMany({ familyId }).exec(),
      this.babyLogModel.deleteMany({ familyId }).exec(),
      this.babyProfileModel.deleteMany({ familyId }).exec(),
      this.notificationModel.deleteMany({ familyId }).exec(),
      this.invitationModel.deleteMany({ familyId }).exec(),
      this.membershipModel.deleteMany({ familyId }).exec(),
    ]);

    await this.familyModel.deleteOne({ _id: familyId }).exec();
  }
}
