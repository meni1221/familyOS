import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BabyController } from './baby.controller';
import { BabyService } from './baby.service';
import { BabyProfile, BabyProfileSchema } from '../../database/models/baby-profile.model';
import { BabyLog, BabyLogSchema } from '../../database/models/baby-log.model';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BabyProfile.name, schema: BabyProfileSchema },
      { name: BabyLog.name, schema: BabyLogSchema },
    ]),
    RealtimeModule,
  ],
  controllers: [BabyController],
  providers: [BabyService],
})
export class BabyModule {}
