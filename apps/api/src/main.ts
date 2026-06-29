import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { TenantInterceptor } from './shared/interceptors/tenant.interceptor';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public' });


  
  app.use(helmet());

  
  app.use(cookieParser());

  
  app.enableCors({
    origin:      process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  
  app.setGlobalPrefix('api/v1');

  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  
  app.useGlobalInterceptors(
    new TenantInterceptor(),
    new ResponseInterceptor()
  );

  
  app.useGlobalFilters(new GlobalExceptionFilter());

  
  const config = new DocumentBuilder()
    .setTitle('WorkLedger API')
    .setDescription('WorkLedger backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 WorkLedger API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
