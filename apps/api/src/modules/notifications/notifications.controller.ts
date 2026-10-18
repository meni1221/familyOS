import { Controller, Get, Post, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Request } from 'express';

@ApiTags('notifications')
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications' })
  async getNotifications(@Req() req: Request) {
    const user = (req as any).user;
    if (!user) return { data: [] };
    return this.notificationsService.getNotifications(user.familyId, user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Req() req: Request) {
    const user = (req as any).user;
    if (!user) return { count: 0 };
    return this.notificationsService.getUnreadCount(user.familyId, user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new Error('Unauthorized');
    return this.notificationsService.markAllAsRead(user.familyId, user.id);
  }
}
