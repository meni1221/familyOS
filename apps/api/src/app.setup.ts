import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getModelToken } from '@nestjs/mongoose';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';
import { Model } from 'mongoose';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { loggerLevels } from './env';
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
export const configureApp = (app: NestExpressApplication): NestExpressApplication => {
  // One proxy sits in front in every deployment — Vite in development, nginx in
  // production — and it is the only one. Trusting exactly that hop makes `req.ip`
  // the client that called rather than the proxy, which is what the request log
  // and the rate limiter mean by "who".
  app.set('trust proxy', 1);

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

  // The docs are public: they describe the shape of the API, not anyone's data.
  // A cookie-authenticated API cannot be tried out from a page hosted elsewhere,
  // and every protected route answers 401 on its own.
  const config = new DocumentBuilder()
    .setTitle('Shlanu API')
    .setDescription(
      [
        'Family life management API.',
        '',
        'Protected routes authenticate with the `session` cookie that',
        '`POST /api/v1/auth/login` sets — there is no bearer token. Browser',
        'requests that change state also have to pass the CSRF origin check: a',
        'mismatched `Origin` or `Referer` is refused with 403.',
      ].join('\n')
    )
    .setVersion('1.0')
    .addCookieAuth(
      'session',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'session',
        description: 'HTTP-only session cookie, issued on register and login.',
      },
      'session'
    )
    .addTag('auth', 'Registration, login, logout and the current user')
    .addTag('families', 'The family, its members and invitations')
    .addTag('tasks', 'The shared to-do list')
    .addTag('calendar', 'Family events')
    .addTag('baby', 'Babies and their logs')
    .addTag('budget', 'Budgets and expenses')
    .addTag('notifications', 'In-app notifications')
    .addTag('settings', 'Profile, preferences and password')
    .addTag('dashboard', 'The one-screen summary')
    .addTag('health', 'Liveness and database check')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Shlanu API',
    swaggerOptions: {
      // Routes stay collapsed: the list is long and the tags are the index.
      docExpansion: 'none',
      operationsSorter: 'method',
      tagsSorter: 'alpha',
    },
  });

  return app;
};

/** Creates a fully configured application without binding it to a port. */
export const createApp = async (
  options: NestApplicationOptions = {}
): Promise<NestExpressApplication> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: loggerLevels(),
    ...options,
  });
  return configureApp(app);
};
