import { Injectable, NotFoundException } from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from '../../database/models/task.model';
import { CreateTaskDto, ListTasksQueryDto, UpdateTaskDto } from './dto/index';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { resolvePage, toPage } from '../../pagination/pagination';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private readonly realtime: RealtimeGateway,
    private readonly notifications: NotificationsService,
  ) {}

  async getFamilyTasks(familyId: string, query: ListTasksQueryDto = {}) {
    const { limit, offset } = resolvePage(query);

    const filter: Record<string, unknown> = { familyId };
    if (query.status === 'open') filter.status = { $ne: 'COMPLETED' };
    if (query.status === 'completed') filter.status = 'COMPLETED';

    const tasks = await this.taskModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      // One extra record tells the caller whether another page exists.
      .limit(limit + 1)
      .exec();

    return toPage(tasks, limit);
  }

  async getTask(familyId: string, taskId: string) {
    if (!isValidObjectId(taskId)) {
      throw new NotFoundException('משימה לא נמצאה');
    }

    const task = await this.taskModel.findOne({ _id: taskId, familyId }).exec();
    if (!task) {
      throw new NotFoundException('משימה לא נמצאה');
    }

    return { data: task };
  }

  async createTask(familyId: string, userId: string, data: CreateTaskDto) {
    const task = await this.taskModel.create({
      familyId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      category: data.category,
      dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
      assigneeUserId: data.assigneeUserId,
      createdByUserId: userId,
      status: 'OPEN',
    });

    await this.notifyAssignee(familyId, userId, task, 'TASK_ASSIGNED', 'שויכה לך משימה חדשה');
    this.realtime.emitTaskCreated(familyId, task.toJSON());

    return { data: task };
  }

  async updateTask(familyId: string, taskId: string, data: UpdateTaskDto) {
    if (!isValidObjectId(taskId)) {
      throw new NotFoundException('משימה לא נמצאה');
    }

    const update: Record<string, unknown> = {};

    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.priority !== undefined) update.priority = data.priority;
    if (data.category !== undefined) update.category = data.category;
    if (data.assigneeUserId !== undefined) update.assigneeUserId = data.assigneeUserId;
    if (data.dueAt !== undefined) update.dueAt = data.dueAt ? new Date(data.dueAt) : null;

    if (data.status === 'COMPLETED') {
      update.status = 'COMPLETED';
      update.completedAt = new Date();
    } else if (data.status !== undefined) {
      update.status = data.status;
      update.completedAt = null;
    }

    const task = await this.taskModel
      .findOneAndUpdate({ _id: taskId, familyId }, { $set: update }, { new: true })
      .exec();

    if (!task) {
      throw new NotFoundException('משימה לא נמצאה');
    }

    if (data.assigneeUserId) {
      await this.notifyAssignee(familyId, '', task, 'TASK_ASSIGNED', 'שויכה לך משימה');
    }
    this.realtime.emitTaskUpdated(familyId, task.toJSON());

    return { data: task };
  }

  async deleteTask(familyId: string, taskId: string) {
    if (!isValidObjectId(taskId)) {
      throw new NotFoundException('משימה לא נמצאה');
    }

    const result = await this.taskModel.deleteOne({ _id: taskId, familyId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('משימה לא נמצאה');
    }

    this.realtime.emitTaskDeleted(familyId, taskId);

    return { success: true };
  }

  /** Notifies the assignee, unless they are the one who acted. */
  private async notifyAssignee(
    familyId: string,
    actingUserId: string,
    task: TaskDocument,
    type: string,
    title: string,
  ) {
    const assignee = task.assigneeUserId?.toString();
    if (!assignee || assignee === actingUserId) return;

    await this.notifications.create(familyId, assignee, {
      type,
      title,
      message: task.title,
      relatedEntityType: 'Task',
      relatedEntityId: task._id.toString(),
    });
  }
}
