import { Controller, Get, Post, Patch, Param, Query, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { AuthenticatedRequest } from '../../middleware/authenticated-request';
import { ApiNotFound, ApiPagination, ApiSessionAuth } from '../../api-docs';
import { PageQueryDto } from '../../pagination/pagination';

@ApiTags('notifications')
@ApiSessionAuth()
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications' })
  @ApiPagination()
  async getNotifications(@Query() query: PageQueryDto, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) return { data: [], hasMore: false };
    return this.notificationsService.getNotifications(user.familyId, user.id, query);
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
  @ApiNotFound('notification')
  async markAsRead(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.notificationsService.markAsRead(user.familyId, user.id, id);
  }
}
