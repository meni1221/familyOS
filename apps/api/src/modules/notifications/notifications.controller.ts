import { Controller, Get, Post, Patch, Param, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { AuthenticatedRequest } from '../../middleware/authenticated-request';

@ApiTags('notifications')
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications' })
  async getNotifications(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) return { data: [] };
    return this.notificationsService.getNotifications(user.familyId, user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) return { count: 0 };
    return this.notificationsService.getUnreadCount(user.familyId, user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.notificationsService.markAllAsRead(user.familyId, user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiParam({ name: 'id', type: String })
  async markAsRead(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.notificationsService.markAsRead(user.familyId, user.id, id);
  }
}
