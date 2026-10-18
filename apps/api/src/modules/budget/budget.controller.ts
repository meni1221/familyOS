import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { AuthenticatedRequest } from '../../middleware/authenticated-request';
import {
  CreateBudgetDto,
  UpdateBudgetDto,
  CreateExpenseDto,
  UpdateExpenseDto,
} from './dto/index';

@ApiTags('budget')
@Controller('api/v1/budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  @ApiOperation({ summary: 'List budgets' })
  async getBudgets(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) return { data: [] };
    return this.budgetService.getBudgets(user.familyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a budget' })
  @ApiBody({ type: CreateBudgetDto })
  async createBudget(@Body() body: CreateBudgetDto, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.budgetService.createBudget(user.familyId, body);
  }

  @Get('expenses')
  @ApiOperation({ summary: 'List expenses' })
  async getExpenses(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) return { data: [] };
    return this.budgetService.getExpenses(user.familyId);
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Create an expense' })
  @ApiBody({ type: CreateExpenseDto })
  async createExpense(@Body() body: CreateExpenseDto, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.budgetService.createExpense(user.familyId, user.id, body);
  }

  @Patch('expenses/:id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateExpenseDto })
  async updateExpense(
    @Param('id') id: string,
    @Body() body: UpdateExpenseDto,
    @Req() req: AuthenticatedRequest
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.budgetService.updateExpense(user.familyId, id, body);
  }

  @Delete('expenses/:id')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiParam({ name: 'id', type: String })
  async deleteExpense(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.budgetService.deleteExpense(user.familyId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateBudgetDto })
  async updateBudget(
    @Param('id') id: string,
    @Body() body: UpdateBudgetDto,
    @Req() req: AuthenticatedRequest
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.budgetService.updateBudget(user.familyId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiParam({ name: 'id', type: String })
  async deleteBudget(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.budgetService.deleteBudget(user.familyId, id);
  }
}
