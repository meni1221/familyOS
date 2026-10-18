import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { Request } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { CreateEventDto } from './dto/index';

@ApiTags('calendar')
@Controller('api/v1/calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @ApiOperation({ summary: 'List events by date range' })
  @ApiQuery({ name: 'start', type: String, required: true })
  @ApiQuery({ name: 'end', type: String, required: true })
  async getEvents(
    @Query('start') start: string,
    @Query('end') end: string,
    @Req() req: Request
  ) {
    const user = (req as any).user;
    if (!user) return { data: [] };
    return this.calendarService.getEvents(user.familyId, new Date(start), new Date(end));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ type: CreateEventDto })
  async createEvent(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) body: CreateEventDto,
    @Req() req: Request
  ) {
    const user = (req as any).user;
    if (!user) throw new Error('Unauthorized');
    return this.calendarService.createEvent(user.familyId, user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiParam({ name: 'id', type: String })
  async updateEvent(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new Error('Unauthorized');
    return this.calendarService.updateEvent(user.familyId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiParam({ name: 'id', type: String })
  async deleteEvent(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new Error('Unauthorized');
    return this.calendarService.deleteEvent(user.familyId, id);
  }
}
