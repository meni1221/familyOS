import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { FamiliesModule } from './modules/families/families.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { BabyModule } from './modules/baby/baby.module';
import { BudgetModule } from './modules/budget/budget.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    RealtimeModule,
    HealthModule,
    AuthModule,
    FamiliesModule,
    TasksModule,
    CalendarModule,
    BabyModule,
    BudgetModule,
    NotificationsModule,
    SettingsModule,
    DashboardModule,
  ],
})
export class AppModule {}
