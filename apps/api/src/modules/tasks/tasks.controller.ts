import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { Request } from 'express';
import { CreateTaskDto, UpdateTaskDto } from './dto/index';

@ApiTags('tasks')
@Controller('api/v1/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks for current family' })
  async getTasks(@Req() req: Request) {
    const user = (req as any).user;
    if (!user) return { data: [] };
    return this.tasksService.getFamilyTasks(user.familyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  async createTask(@Body() body: CreateTaskDto, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.tasksService.createTask(user.familyId, user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateTaskDto })
  async updateTask(
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
    @Req() req: Request
  ) {
    const user = (req as any).user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.tasksService.updateTask(user.familyId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', type: String })
  async deleteTask(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.tasksService.deleteTask(user.familyId, id);
  }
}
