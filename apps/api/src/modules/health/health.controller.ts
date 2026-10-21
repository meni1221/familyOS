import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check() {
    try {
      await this.connection.db?.admin()?.ping();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        services: {
          database: 'connected',
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'disconnected',
        },
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      };
    }
  }
}
