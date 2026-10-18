import { Injectable, NotFoundException } from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Budget, BudgetDocument } from '../../database/models/budget.model';
import { Expense, ExpenseDocument } from '../../database/models/expense.model';
import {
  CreateBudgetDto,
  UpdateBudgetDto,
  CreateExpenseDto,
  UpdateExpenseDto,
} from './dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    private readonly realtime: RealtimeGateway,
  ) {}

  async getBudgets(familyId: string) {
    const budgets = await this.budgetModel
      .find({ familyId })
      .sort({ createdAt: -1 })
      .limit(200)
      .exec();
    return { data: budgets };
  }

  async createBudget(familyId: string, dto: CreateBudgetDto) {
    const budget = await this.budgetModel.create({
      familyId,
      name: dto.name,
      amount: dto.amount,
      currency: dto.currency ?? 'ILS',
      period: dto.period ?? 'MONTHLY',
    });

    this.realtime.emitBudgetCreated(familyId, budget.toJSON());

    return { data: budget };
  }

  async updateBudget(familyId: string, budgetId: string, dto: UpdateBudgetDto) {
    if (!isValidObjectId(budgetId)) {
      throw new NotFoundException('תקציב לא נמצא');
    }

    const update: Record<string, unknown> = {};
    if (dto.name !== undefined) update.name = dto.name;
    if (dto.amount !== undefined) update.amount = dto.amount;
    if (dto.currency !== undefined) update.currency = dto.currency;
    if (dto.period !== undefined) update.period = dto.period;

    const budget = await this.budgetModel
      .findOneAndUpdate({ _id: budgetId, familyId }, { $set: update }, { new: true })
      .exec();

    if (!budget) {
      throw new NotFoundException('תקציב לא נמצא');
    }

    this.realtime.emitBudgetUpdated(familyId, budget.toJSON());

    return { data: budget };
  }

  async deleteBudget(familyId: string, budgetId: string) {
    if (!isValidObjectId(budgetId)) {
      throw new NotFoundException('תקציב לא נמצא');
    }

    const result = await this.budgetModel.deleteOne({ _id: budgetId, familyId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('תקציב לא נמצא');
    }
    return { success: true };
  }

  async getExpenses(familyId: string) {
    const expenses = await this.expenseModel
      .find({ familyId })
      .sort({ occurredAt: -1 })
      .limit(500)
      .exec();
    return { data: expenses };
  }

  async createExpense(familyId: string, userId: string, dto: CreateExpenseDto) {
    const expense = await this.expenseModel.create({
      familyId,
      amount: dto.amount,
      currency: dto.currency ?? 'ILS',
      category: dto.category,
      description: dto.description,
      occurredAt: new Date(dto.occurredAt),
      createdByUserId: userId,
    });

    this.realtime.emitExpenseCreated(familyId, expense.toJSON());

    return { data: expense };
  }

  async updateExpense(familyId: string, expenseId: string, dto: UpdateExpenseDto) {
    if (!isValidObjectId(expenseId)) {
      throw new NotFoundException('הוצאה לא נמצאה');
    }

    const update: Record<string, unknown> = {};
    if (dto.amount !== undefined) update.amount = dto.amount;
    if (dto.currency !== undefined) update.currency = dto.currency;
    if (dto.category !== undefined) update.category = dto.category;
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.occurredAt !== undefined) update.occurredAt = new Date(dto.occurredAt);

    const expense = await this.expenseModel
      .findOneAndUpdate({ _id: expenseId, familyId }, { $set: update }, { new: true })
      .exec();

    if (!expense) {
      throw new NotFoundException('הוצאה לא נמצאה');
    }

    this.realtime.emitExpenseUpdated(familyId, expense.toJSON());

    return { data: expense };
  }

  async deleteExpense(familyId: string, expenseId: string) {
    if (!isValidObjectId(expenseId)) {
      throw new NotFoundException('הוצאה לא נמצאה');
    }

    const result = await this.expenseModel.deleteOne({ _id: expenseId, familyId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('הוצאה לא נמצאה');
    }

    this.realtime.emitExpenseDeleted(familyId, expenseId);

    return { success: true };
  }
}
