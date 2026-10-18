import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { SecurityHeadersMiddleware } from './middleware/security-headers.middleware';
import { CsrfMiddleware } from './middleware/csrf.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { AuthMiddleware } from './middleware/auth.middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    .setTitle('FamilyOS API')
    .setDescription('Family life management SaaS API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`FamilyOS API running on http://localhost:${port}`);
}

bootstrap();
