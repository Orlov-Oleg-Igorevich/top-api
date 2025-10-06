import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect, Model, Types } from 'mongoose';
import { CreateTopPageDto } from '../src/top-page/dto/create-top-page.dto';
import { FindTopPageDto } from '../src/top-page/dto/find-top-page.dto';
import { TopPageDocument, TopPageModel } from '../src/top-page/top-page.model';
import { NOT_FOUND_TOP_PAGE_EXCEPTION } from '../src/top-page/top-page.constans';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { getModelToken } from '@nestjs/mongoose';
import { ID_VALIDATION_EXCEPTION } from '../src/pipes/id-validation.constans';
import { TopLevelCategory } from '../src/top-page/types/TopLevelCategoryEnum';

const validTopPageDto: CreateTopPageDto = {
  firstLevelCategory: TopLevelCategory.Courses,
  secondCategory: 'Frontend',
  title: 'React Course',
  category: 'react',
  alias: 'react-course',
  advantages: [
    { title: 'Mentorship', description: 'Personal mentor' },
    { title: 'Job', description: 'Career support' },
  ],
  seoText: 'Best React course in 2025',
  tagsTitle: 'React, JavaScript, Frontend',
  tags: ['react', 'js', 'frontend'],
  hh: {
    count: 100,
    juniorSalary: 80000,
    middleSalary: 150000,
    seniorSalary: 250000,
  },
};

const loginDto: AuthDto = {
  email: 'a1a@mail.ru',
  password: '1',
};

describe('TopPageController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let topPageModel: Model<TopPageDocument>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    topPageModel = moduleFixture.get<Model<TopPageDocument>>(getModelToken(TopPageModel.name));

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidUnknownValues: false,
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
      }),
    );
    await app.init();

    const { body } = await request(app.getHttpServer()).post('/auth/login').send(loginDto);
    token = body.accessToken;
  });

  beforeEach(async () => {
    await topPageModel.deleteMany({});
  });

  afterAll(async () => {
    await topPageModel.deleteMany({});
    await app.close();
    await disconnect();
  });

  describe('POST /top-page/create', () => {
    it('should create a top page and return 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/top-page/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validTopPageDto)
        .expect(HttpStatus.CREATED);

      expect(res.body._id).toBeDefined();
      expect(res.body.title).toBe(validTopPageDto.title);
      expect(res.body.firstLevelCategory).toBe(TopLevelCategory.Courses);
      expect(res.body.advantages).toHaveLength(2);
    });

    it('should return 400 if required field is missing', async () => {
      const invalidDto = { ...validTopPageDto, title: undefined };
      await request(app.getHttpServer())
        .post('/top-page/create')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 if no token provided', async () => {
      await request(app.getHttpServer())
        .post('/top-page/create')
        .send(validTopPageDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /top-page/:id', () => {
    it('should return a top page by valid ID', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/top-page/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validTopPageDto)
        .expect(HttpStatus.CREATED);

      const getRes = await request(app.getHttpServer())
        .get(`/top-page/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(getRes.body._id).toBe(createRes.body._id);
      expect(getRes.body.alias).toBe(validTopPageDto.alias);
    });

    it('should return 404 for non-existing top page', async () => {
      const fakeId = new Types.ObjectId().toHexString();
      const res = await request(app.getHttpServer())
        .get(`/top-page/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(res.body).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: NOT_FOUND_TOP_PAGE_EXCEPTION,
        error: 'Not Found',
      });
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app.getHttpServer())
        .get('/top-page/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body.message).toBe(ID_VALIDATION_EXCEPTION);
    });

    it('should return 401 if no token provided', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/top-page/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validTopPageDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get(`/top-page/${createRes.body._id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /top-page/:id', () => {
    it('should delete existing top page and return it', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/top-page/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validTopPageDto)
        .expect(HttpStatus.CREATED);

      const deleteRes = await request(app.getHttpServer())
        .delete(`/top-page/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(deleteRes.body._id).toBe(createRes.body._id);
      expect(deleteRes.body.title).toBe(validTopPageDto.title);

      await request(app.getHttpServer())
        .get(`/top-page/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 when deleting non-existing top page', async () => {
      const fakeId = new Types.ObjectId().toHexString();
      await request(app.getHttpServer())
        .delete(`/top-page/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: HttpStatus.NOT_FOUND,
          message: NOT_FOUND_TOP_PAGE_EXCEPTION,
          error: 'Not Found',
        });
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app.getHttpServer())
        .delete('/top-page/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body.message).toBe(ID_VALIDATION_EXCEPTION);
    });

    it('should return 401 if no token provided', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/top-page/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validTopPageDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .delete(`/top-page/${createRes.body._id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /top-page/:id', () => {
    it('should update top page and return updated document', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/top-page/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validTopPageDto)
        .expect(HttpStatus.CREATED);

      const updateDto = {
        title: 'Updated React Course',
        seoText: 'Even better React course',
        advantages: [{ title: 'New', description: 'Feature' }],
      };

      const patchRes = await request(app.getHttpServer())
        .patch(`/top-page/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(patchRes.body._id).toBe(createRes.body._id);
      expect(patchRes.body.title).toBe(updateDto.title);
      expect(patchRes.body.seoText).toBe(updateDto.seoText);
      expect(patchRes.body.advantages).toHaveLength(1);
    });

    it('should return 404 when updating non-existing top page', async () => {
      const fakeId = new Types.ObjectId().toHexString();
      await request(app.getHttpServer())
        .patch(`/top-page/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New Title' })
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: HttpStatus.NOT_FOUND,
          message: NOT_FOUND_TOP_PAGE_EXCEPTION,
          error: 'Not Found',
        });
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app.getHttpServer())
        .patch('/top-page/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body.message).toBe(ID_VALIDATION_EXCEPTION);
    });

    it('should return 401 if no token provided', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/top-page/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validTopPageDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .patch(`/top-page/${createRes.body._id}`)
        .send({ title: 'Hacked Title' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /top-page/find', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/top-page/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validTopPageDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/top-page/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...validTopPageDto,
          secondCategory: 'Backend',
          title: 'Node.js Course',
          alias: 'nodejs-course',
        })
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/top-page/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...validTopPageDto,
          firstLevelCategory: TopLevelCategory.Services,
          secondCategory: 'Consulting',
          title: 'IT Consulting',
          alias: 'it-consulting',
        })
        .expect(HttpStatus.CREATED);
    });

    it('should return grouped top pages by firstLevelCategory', async () => {
      const findDto: FindTopPageDto = { firstCategory: TopLevelCategory.Courses };
      const res = await request(app.getHttpServer())
        .post('/top-page/find')
        .send(findDto)
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      // Агрегация группирует по secondCategory → должно быть 2 группы
      expect(res.body).toHaveLength(2);
      expect(res.body.some((group: any) => group._id.secondCategory === 'Frontend')).toBe(true);
      expect(res.body.some((group: any) => group._id.secondCategory === 'Backend')).toBe(true);
    });

    it('should return empty array for non-matching category', async () => {
      const findDto: FindTopPageDto = { firstCategory: TopLevelCategory.Products };
      const res = await request(app.getHttpServer())
        .post('/top-page/find')
        .send(findDto)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual([]);
    });

    it('should return 400 if DTO is invalid', async () => {
      await request(app.getHttpServer())
        .post('/top-page/find')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /top-page/findByText/:text', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/top-page/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validTopPageDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/top-page/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...validTopPageDto,
          title: 'Angular Course',
          seoText: 'Best Angular course',
          alias: 'angular-course',
        })
        .expect(HttpStatus.CREATED);
    });

    it('should return top pages matching text (case-insensitive)', async () => {
      const res = await request(app.getHttpServer())
        .get('/top-page/findByText/react')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('React Course');
    });

    it('should return empty array for non-matching text', async () => {
      const res = await request(app.getHttpServer())
        .get('/top-page/findByText/vue')
        .expect(HttpStatus.OK);

      expect(res.body).toEqual([]);
    });

    it('should match case-insensitively', async () => {
      const res = await request(app.getHttpServer())
        .get('/top-page/findByText/REACT')
        .expect(HttpStatus.OK);

      expect(res.body.length).toBe(1);
    });
  });
});
