import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { AuthenticatedRequest } from '../../middleware/authenticated-request';
import { ApiNotFound, ApiPagination, ApiSessionAuth } from '../../api-docs';
import { CreateTaskDto, ListTasksQueryDto, UpdateTaskDto } from './dto/index';

@ApiTags('tasks')
@ApiSessionAuth()
@Controller('api/v1/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks for current family' })
  @ApiPagination()
  async getTasks(@Query() query: ListTasksQueryDto, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) return { data: [], hasMore: false };
    return this.tasksService.getFamilyTasks(user.familyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one task' })
  @ApiParam({ name: 'id', type: String })
  @ApiNotFound('task')
  async getTask(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.tasksService.getTask(user.familyId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  async createTask(@Body() body: CreateTaskDto, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.tasksService.createTask(user.familyId, user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateTaskDto })
  @ApiNotFound('task')
  async updateTask(
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
    @Req() req: AuthenticatedRequest
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.tasksService.updateTask(user.familyId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', type: String })
  @ApiNotFound('task')
  async deleteTask(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.tasksService.deleteTask(user.familyId, id);
  }
}
