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
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { Request } from 'express';
import { CreateEventDto, UpdateEventDto } from './dto/index';

@ApiTags('calendar')
@Controller('api/v1/calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @ApiOperation({ summary: 'List events by date range (defaults to the current month)' })
  @ApiQuery({ name: 'start', type: String, required: false })
  @ApiQuery({ name: 'end', type: String, required: false })
  async getEvents(
    @Query('start') start: string,
    @Query('end') end: string,
    @Req() req: Request
  ) {
    const user = (req as any).user;
    if (!user) return { data: [] };

    const { start: from, end: to } = this.resolveRange(start, end);
    return this.calendarService.getEvents(user.familyId, from, to);
  }

  private resolveRange(start?: string, end?: string): { start: Date; end: Date } {
    const parsedStart = start ? new Date(start) : undefined;
    const parsedEnd = end ? new Date(end) : undefined;

    const now = new Date();
    const fallbackStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const fallbackEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const isValid = (value?: Date): value is Date =>
      !!value && !Number.isNaN(value.getTime());

    return {
      start: isValid(parsedStart) ? parsedStart : fallbackStart,
      end: isValid(parsedEnd) ? parsedEnd : fallbackEnd,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ type: CreateEventDto })
  async createEvent(@Body() body: CreateEventDto, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.calendarService.createEvent(user.familyId, user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateEventDto })
  async updateEvent(
    @Param('id') id: string,
    @Body() body: UpdateEventDto,
    @Req() req: Request
  ) {
    const user = (req as any).user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.calendarService.updateEvent(user.familyId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiParam({ name: 'id', type: String })
  async deleteEvent(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.calendarService.deleteEvent(user.familyId, id);
  }
}
