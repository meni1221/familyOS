import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { FamiliesModule } from './modules/families/families.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { BabyModule } from './modules/baby/baby.module';
import { BudgetModule } from './modules/budget/budget.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    DatabaseModule,
    RealtimeModule,
    HealthModule,
    AuthModule,
    FamiliesModule,
    TasksModule,
    CalendarModule,
    BabyModule,
    BudgetModule,
    DocumentsModule,
    NotificationsModule,
    SettingsModule,
  ],
})
export class AppModule {}
