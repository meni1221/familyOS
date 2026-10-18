import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from '../../database/models/task.model';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async getFamilyTasks(familyId: string) {
    const tasks = await this.taskModel
      .find({ familyId })
      .sort({ createdAt: -1 })
      .exec();
    return { data: tasks };
  }

  async createTask(familyId: string, userId: string, data: { title: string; description?: string }) {
    const task = await this.taskModel.create({
      familyId,
      title: data.title,
      description: data.description,
      createdByUserId: userId,
    });
    return { data: task };
  }

  async updateTask(familyId: string, taskId: string, data: any) {
    const task = await this.taskModel.findOneAndUpdate(
      { _id: taskId, familyId },
      data,
      { new: true },
    ).exec();

    if (!task) {
      throw new NotFoundException('משימה לא נמצאה');
    }
    return { data: task };
  }

  async deleteTask(familyId: string, taskId: string) {
    const result = await this.taskModel.deleteOne({ _id: taskId, familyId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('משימה לא נמצאה');
    }
    return { success: true };
  }
}
