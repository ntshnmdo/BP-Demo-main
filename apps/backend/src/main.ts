import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (origin, callback) => {
      const allowed = [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port);
  console.log(`Battery Passport API running on http://localhost:${port}/api`);
}
bootstrap();
