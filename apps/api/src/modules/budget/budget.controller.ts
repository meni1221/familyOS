import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { Request } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { CreateExpenseDto } from './dto/index';

@ApiTags('budget')
@Controller('api/v1/budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  @ApiOperation({ summary: 'List budgets' })
  async getBudgets(@Req() req: Request) {
    const user = (req as any).user;
    if (!user) return { data: [] };
    return this.budgetService.getBudgets(user.familyId);
  }

  @Get('expenses')
  @ApiOperation({ summary: 'List expenses' })
  async getExpenses(@Req() req: Request) {
    const user = (req as any).user;
    if (!user) return { data: [] };
    return this.budgetService.getExpenses(user.familyId);
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Create an expense' })
  @ApiBody({ type: CreateExpenseDto })
  async createExpense(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) body: CreateExpenseDto,
    @Req() req: Request
  ) {
    const user = (req as any).user;
    if (!user) throw new Error('Unauthorized');
    return this.budgetService.createExpense(user.familyId, user.id, body);
  }

  @Patch('expenses/:id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiParam({ name: 'id', type: String })
  async updateExpense(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new Error('Unauthorized');
    return this.budgetService.updateExpense(user.familyId, id, body);
  }

  @Delete('expenses/:id')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiParam({ name: 'id', type: String })
  async deleteExpense(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new Error('Unauthorized');
    return this.budgetService.deleteExpense(user.familyId, id);
  }
}
