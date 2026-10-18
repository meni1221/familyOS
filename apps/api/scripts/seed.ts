import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../src/database/models/user.model';
import { Family, FamilyDocument } from '../src/database/models/family.model';
import { FamilyMembership, FamilyMembershipDocument } from '../src/database/models/family-membership.model';
import { Task, TaskDocument } from '../src/database/models/task.model';
import { CalendarEvent, CalendarEventDocument } from '../src/database/models/calendar-event.model';
import { Budget, BudgetDocument } from '../src/database/models/budget.model';
import { Expense, ExpenseDocument } from '../src/database/models/expense.model';

async function main() {
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.DATABASE_URL ?? 'mongodb://localhost:27017/FamilyOs');

  const passwordHash = await bcrypt.hash('demo1234', 12);

  const user1 = await mongoose.model('User').create({
    email: 'demo@familyos.app',
    displayName: 'ישראל ישראלי',
    passwordHash,
    preferredLocale: 'he',
    timezone: 'Asia/Jerusalem',
    families: [],
  });

  const user2 = await mongoose.model('User').create({
    email: 'sarah@familyos.app',
    displayName: 'שרה ישראלי',
    passwordHash,
    preferredLocale: 'he',
    timezone: 'Asia/Jerusalem',
    families: [],
  });

  const family = await mongoose.model('Family').create({
    name: 'משפחת ישראלי',
    defaultLocale: 'he',
    defaultCurrency: 'ILS',
    timezone: 'Asia/Jerusalem',
  });

  await mongoose.model('FamilyMembership').create([
    { familyId: family._id, userId: user1._id, role: 'OWNER' },
    { familyId: family._id, userId: user2._id, role: 'MEMBER' },
  ]);

  await user1.updateOne({ $addToSet: { families: family._id } });
  await user2.updateOne({ $addToSet: { families: family._id } });

  await mongoose.model('Task').create([
    {
      familyId: family._id,
      title: 'קניות שבועיות',
      description: 'לקנות מזון לשבוע',
      status: 'OPEN',
      priority: 'MEDIUM',
      category: 'בית',
      assigneeUserId: user1._id,
      dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdByUserId: user1._id,
    },
    {
      familyId: family._id,
      title: 'תיקון מונית',
      status: 'OPEN',
      priority: 'HIGH',
      category: 'רכב',
      assigneeUserId: user2._id,
      dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdByUserId: user1._id,
    },
    {
      familyId: family._id,
      title: 'איסוף ילדים מגן',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      category: 'ילדים',
      assigneeUserId: user2._id,
      createdByUserId: user2._id,
      completedAt: new Date(),
    },
  ]);

  await mongoose.model('CalendarEvent').create({
    familyId: family._id,
    title: 'ארוחת ערב משפחתית',
    startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    endsAt: new Date(Date.now() + 26 * 60 * 60 * 1000),
    isAllDay: false,
    timezone: 'Asia/Jerusalem',
    category: 'משפחה',
    createdByUserId: user1._id,
  });

  await mongoose.model('Budget').create({
    familyId: family._id,
    name: 'תקציב חודשי',
    amount: 15000,
    currency: 'ILS',
    period: 'MONTHLY',
  });

  await mongoose.model('Expense').create([
    {
      familyId: family._id,
      amount: 350,
      currency: 'ILS',
      category: 'מזון',
      description: 'קניות שבועיות',
      occurredAt: new Date(),
      createdByUserId: user1._id,
    },
    {
      familyId: family._id,
      amount: 120,
      currency: 'ILS',
      category: 'תחבורה',
      description: 'דלק',
      occurredAt: new Date(),
      createdByUserId: user2._id,
    },
  ]);

  console.log('Seed data created successfully!');
  console.log('Demo accounts:');
  console.log('  demo@familyos.app / demo1234');
  console.log('  sarah@familyos.app / demo1234');

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
