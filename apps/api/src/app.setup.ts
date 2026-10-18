import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';
import { Model } from 'mongoose';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { SecurityHeadersMiddleware } from './middleware/security-headers.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { CsrfMiddleware } from './middleware/csrf.middleware';
import { AuthMiddleware } from './middleware/auth.middleware';
import { Session } from './database/models/session.model';
import { bindSessionModel } from './modules/auth/session.store';
import { AppModule } from './app.module';

/**
 * Applies every global concern — cookies, security headers, rate limiting, CSRF,
 * session resolution, validation, CORS and Swagger — to a Nest application.
 *
 * Kept separate from `main.ts` so the HTTP surface of the server is defined in a
 * single, reviewable place.
 */
export const configureApp = (app: INestApplication): INestApplication => {
  // The session store is a module singleton (the auth middleware is built by
  // hand below), so it receives its model once, here.
  bindSessionModel(app.get<Model<Session>>(getModelToken(Session.name)));

  app.use(cookieParser());
  app.use(new LoggingMiddleware().use.bind(new LoggingMiddleware()));
  app.use(new SecurityHeadersMiddleware().use.bind(new SecurityHeadersMiddleware()));
  app.use(new RateLimitMiddleware().use.bind(new RateLimitMiddleware()));
  app.use(new CsrfMiddleware().use.bind(new CsrfMiddleware()));
  app.use(new AuthMiddleware().use.bind(new AuthMiddleware()));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Shlanu API')
    .setDescription('Family life management SaaS API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  return app;
};

/** Creates a fully configured application without binding it to a port. */
export const createApp = async (options: NestApplicationOptions = {}): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule, options);
  return configureApp(app);
};
