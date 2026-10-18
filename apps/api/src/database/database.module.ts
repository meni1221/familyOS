import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb://localhost:27017/Shlanu';
const DEFAULT_DB_NAME = 'Shlanu';

/**
 * Serializes every document with a stable `id` string instead of `_id`/`__v`,
 * so API responses are consistent for the frontend and shared types.
 */
function configureMongooseSerialization() {
  mongoose.set('toJSON', {
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      if (ret._id) {
        ret.id = String(ret._id);
        delete ret._id;
      }
      return ret;
    },
  });
}

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        configureMongooseSerialization();

        const uri = process.env.DATABASE_URL ?? DEFAULT_URI;
        const dbName = process.env.DATABASE_NAME ?? DEFAULT_DB_NAME;

        return { uri, dbName };
      },
    }),
  ],
})
export class DatabaseModule {}
