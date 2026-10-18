import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Budget, BudgetDocument } from '../../database/models/budget.model';
import { Expense, ExpenseDocument } from '../../database/models/expense.model';

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async getBudgets(familyId: string) {
    const budgets = await this.budgetModel.find({ familyId }).exec();
    return { data: budgets };
  }

  async getExpenses(familyId: string) {
    const expenses = await this.expenseModel
      .find({ familyId })
      .sort({ occurredAt: -1 })
      .exec();
    return { data: expenses };
  }

  async createExpense(familyId: string, userId: string, data: any) {
    const expense = await this.expenseModel.create({
      familyId,
      amount: data.amount,
      currency: data.currency ?? 'ILS',
      category: data.category,
      description: data.description,
      occurredAt: new Date(data.occurredAt),
      createdByUserId: userId,
    });
    return { data: expense };
  }

  async updateExpense(familyId: string, expenseId: string, data: any) {
    const expense = await this.expenseModel.findOneAndUpdate(
      { _id: expenseId, familyId },
      data,
      { new: true },
    ).exec();

    if (!expense) {
      throw new NotFoundException('הוצאה לא נמצאה');
    }
    return { data: expense };
  }

  async deleteExpense(familyId: string, expenseId: string) {
    const result = await this.expenseModel.deleteOne({ _id: expenseId, familyId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('הוצאה לא נמצאה');
    }
    return { success: true };
  }
}
