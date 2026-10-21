import { Module, Global, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { applyDnsServers } from '../dns';

const DEFAULT_URI = 'mongodb://localhost:27017/Shlanu';
const DEFAULT_DB_NAME = 'Shlanu';

/**
 * Serializes every document with a stable `id` string instead of `_id`/`__v`,
 * so API responses are consistent for the frontend and shared types.
 */
const configureMongooseSerialization = () => {
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
};

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        configureMongooseSerialization();

        // Must run before Mongoose resolves a `mongodb+srv` URI. Unset means
        // "use the host's resolver list", so healthy deployments are untouched.
        const dnsServers = applyDnsServers(process.env.DNS_SERVERS);
        if (dnsServers.length > 0) {
          new Logger('Database').log(`Resolving through DNS servers: ${dnsServers.join(', ')}`);
        }

        const uri = process.env.DATABASE_URL ?? DEFAULT_URI;
        const dbName = process.env.DATABASE_NAME ?? DEFAULT_DB_NAME;

        return { uri, dbName };
      },
    }),
  ],
})
export class DatabaseModule {}
