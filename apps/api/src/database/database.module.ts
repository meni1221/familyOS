import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.DATABASE_URL ?? 'mongodb://localhost:27017/FamilyOs',
        dbName: 'FamilyOs',
      }),
    }),
  ],
})
export class DatabaseModule {}
