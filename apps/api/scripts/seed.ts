import 'reflect-metadata';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { UserSchema } from '../src/database/models/user.model';
import { FamilySchema } from '../src/database/models/family.model';
import { FamilyMembershipSchema } from '../src/database/models/family-membership.model';
import { TaskSchema } from '../src/database/models/task.model';
import { CalendarEventSchema } from '../src/database/models/calendar-event.model';
import { BudgetSchema } from '../src/database/models/budget.model';
import { ExpenseSchema } from '../src/database/models/expense.model';
import { BabyProfileSchema } from '../src/database/models/baby-profile.model';
import { BabyLogSchema } from '../src/database/models/baby-log.model';
import { NotificationSchema } from '../src/database/models/notification.model';

const DATABASE_URL = process.env.DATABASE_URL ?? 'mongodb://localhost:27017/FamilyOs';
const DEMO_PASSWORD = 'demo1234';

const models = {
  User: mongoose.model('User', UserSchema),
  Family: mongoose.model('Family', FamilySchema),
  FamilyMembership: mongoose.model('FamilyMembership', FamilyMembershipSchema),
  Task: mongoose.model('Task', TaskSchema),
  CalendarEvent: mongoose.model('CalendarEvent', CalendarEventSchema),
  Budget: mongoose.model('Budget', BudgetSchema),
  Expense: mongoose.model('Expense', ExpenseSchema),
  BabyProfile: mongoose.model('BabyProfile', BabyProfileSchema),
  BabyLog: mongoose.model('BabyLog', BabyLogSchema),
  Notification: mongoose.model('Notification', NotificationSchema),
};

const allModels = [
  models.User,
  models.Family,
  models.FamilyMembership,
  models.Task,
  models.CalendarEvent,
  models.Budget,
  models.Expense,
  models.BabyProfile,
  models.BabyLog,
  models.Notification,
] as unknown as Model<unknown>[];

function daysFromNow(days: number, hours = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  return date;
}

async function seed() {
  await mongoose.connect(DATABASE_URL);
  console.log(`Connected to ${DATABASE_URL}`);

  await Promise.all(allModels.map((model) => model.deleteMany({})));

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const [israel, sarah] = await models.User.create([
    {
      email: 'demo@familyos.app',
      displayName: 'ישראל ישראלי',
      passwordHash,
      preferredLocale: 'he',
      timezone: 'Asia/Jerusalem',
      families: [],
    },
    {
      email: 'sarah@familyos.app',
      displayName: 'שרה ישראלי',
      passwordHash,
      preferredLocale: 'he',
      timezone: 'Asia/Jerusalem',
      families: [],
    },
  ]);

  const family = await models.Family.create({
    name: 'משפחת ישראלי',
    defaultLocale: 'he',
    defaultCurrency: 'ILS',
    timezone: 'Asia/Jerusalem',
  });

  await models.FamilyMembership.create([
    { familyId: family._id, userId: israel._id, role: 'OWNER' },
    { familyId: family._id, userId: sarah._id, role: 'MEMBER' },
  ]);

  await models.User.updateMany(
    { _id: { $in: [israel._id, sarah._id] } },
    { $addToSet: { families: family._id } },
  );

  await models.Task.create([
    {
      familyId: family._id,
      title: 'קניות שבועיות',
      description: 'לקנות מזון לשבוע',
      status: 'OPEN',
      priority: 'MEDIUM',
      category: 'בית',
      assigneeUserId: israel._id,
      dueAt: daysFromNow(0, 4),
      createdByUserId: israel._id,
    },
    {
      familyId: family._id,
      title: 'תיקון הרכב',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      category: 'רכב',
      assigneeUserId: sarah._id,
      dueAt: daysFromNow(3),
      createdByUserId: israel._id,
    },
    {
      familyId: family._id,
      title: 'איסוף הילדים מהגן',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      category: 'ילדים',
      assigneeUserId: sarah._id,
      createdByUserId: sarah._id,
      completedAt: new Date(),
    },
    {
      familyId: family._id,
      title: 'תשלום ארנונה',
      status: 'OPEN',
      priority: 'URGENT',
      category: 'כספים',
      assigneeUserId: israel._id,
      dueAt: daysFromNow(-2),
      createdByUserId: sarah._id,
    },
  ]);

  await models.CalendarEvent.create([
    {
      familyId: family._id,
      title: 'ארוחת ערב משפחתית',
      startsAt: daysFromNow(0, 3),
      endsAt: daysFromNow(0, 5),
      timezone: 'Asia/Jerusalem',
      category: 'משפחה',
      createdByUserId: israel._id,
    },
    {
      familyId: family._id,
      title: 'פגישת הורים',
      startsAt: daysFromNow(2, 1),
      endsAt: daysFromNow(2, 2),
      location: 'בית הספר היסודי',
      timezone: 'Asia/Jerusalem',
      category: 'ילדים',
      createdByUserId: sarah._id,
    },
  ]);

  const baby = await models.BabyProfile.create({
    familyId: family._id,
    displayName: 'נועה',
    dateOfBirth: daysFromNow(-180),
    trackingEnabled: true,
  });

  await models.BabyLog.create([
    {
      familyId: family._id,
      babyProfileId: baby._id,
      type: 'FEEDING',
      occurredAt: daysFromNow(0, -2),
      details: { amountMl: 120 },
      createdByUserId: sarah._id,
    },
    {
      familyId: family._id,
      babyProfileId: baby._id,
      type: 'SLEEP',
      occurredAt: daysFromNow(0, -5),
      endedAt: daysFromNow(0, -3),
      createdByUserId: israel._id,
    },
  ]);

  await models.Budget.create({
    familyId: family._id,
    name: 'תקציב חודשי',
    amount: 15000,
    currency: 'ILS',
    period: 'MONTHLY',
  });

  await models.Expense.create([
    {
      familyId: family._id,
      amount: 1350,
      currency: 'ILS',
      category: 'מזון',
      description: 'קניות שבועיות',
      occurredAt: daysFromNow(-1),
      createdByUserId: israel._id,
    },
    {
      familyId: family._id,
      amount: 420,
      currency: 'ILS',
      category: 'תחבורה',
      description: 'דלק',
      occurredAt: daysFromNow(-3),
      createdByUserId: sarah._id,
    },
    {
      familyId: family._id,
      amount: 260,
      currency: 'ILS',
      category: 'פנאי',
      description: 'קולנוע',
      occurredAt: daysFromNow(-5),
      createdByUserId: sarah._id,
    },
  ]);

  await models.Notification.create({
    familyId: family._id,
    recipientUserId: israel._id,
    type: 'TASK_DUE',
    title: 'תשלום ארנונה מתקרב',
    message: 'המשימה "תשלום ארנונה" עברה את תאריך היעד',
    relatedEntityType: 'Task',
  });

  console.log('Seed data created successfully.');
  console.log('Demo accounts:');
  console.log(`  demo@familyos.app / ${DEMO_PASSWORD}`);
  console.log(`  sarah@familyos.app / ${DEMO_PASSWORD}`);
}

seed()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  });
