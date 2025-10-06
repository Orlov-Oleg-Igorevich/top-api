import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      // Безопасность
      whitelist: true,
      // forbidNonWhitelisted: true,
      forbidUnknownValues: true,

      // Обработка свойств
      skipMissingProperties: false,
      skipUndefinedProperties: false,
      skipNullProperties: false,

      // Преобразование
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
        exposeDefaultValues: true,
      },

      // Обработка ошибок
      // dismissDefaultMessages: false,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      validationError: {
        target: false,
        value: true,
      },

      // Дополнительно
      validateCustomDecorators: true,
      always: false,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
