import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { disconnect } from 'mongoose';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidUnknownValues: true,

        skipMissingProperties: false,
        skipUndefinedProperties: false,
        skipNullProperties: false,

        transform: true,
        transformOptions: {
          enableImplicitConversion: false,
          exposeDefaultValues: true,
        },

        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        validationError: {
          target: false,
          value: true,
        },

        validateCustomDecorators: true,
        always: false,
      }),
    );
    await app.init();
  });

  it('/auth/login (POST) - success', async () => {
    const response: request.Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'a1a@mail.ru',
        password: '1',
      })
      .expect(200);
    expect(response.body.accessToken).toBeDefined();
  });

  it('/auth/login (POST) - fail password', async () => {
    const response: request.Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'a1a@mail.ru',
        password: '11',
      })
      .expect(401, {
        message: 'Некорректный пароль',
        error: 'Unauthorized',
        statusCode: 401,
      });
  });

  it('/auth/login (POST) - fail login', async () => {
    const response: request.Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'a1@mail.ru',
        password: '1',
      })
      .expect(401, {
        message: 'Пользователь не найден',
        error: 'Unauthorized',
        statusCode: 401,
      });
  });

  afterEach(async () => {
    await app.close();
    await disconnect();
  });
});
