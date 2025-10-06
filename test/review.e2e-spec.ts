import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ReviewDocument, ReviewModel } from '../src/review/review.model';
import { AppModule } from '../src/app.module';
import { disconnect, Model, Types } from 'mongoose';
import { CreateReviewDto } from '../src/review/dto/create-review.dto';
import { REVIEW_NOT_FOUND } from '../src/review/review.constans';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { getModelToken } from '@nestjs/mongoose';
import { ID_VALIDATION_EXCEPTION } from '../src/pipes/id-validation.constans';

const productId = new Types.ObjectId().toHexString();
const anotherProductId = new Types.ObjectId().toHexString();

const validReviewDto: CreateReviewDto = {
  name: 'Test User',
  title: 'Great Product',
  description: 'I really liked it!',
  rating: 4,
  productId,
};

const loginDto: AuthDto = {
  email: 'a1a@mail.ru',
  password: '1',
};

describe('ReviewController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let reviewModel: Model<ReviewDocument>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    reviewModel = moduleFixture.get<Model<ReviewDocument>>(getModelToken(ReviewModel.name));

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
        always: false,
      }),
    );
    await app.init();

    const { body } = await request(app.getHttpServer()).post('/auth/login').send(loginDto);
    token = body.accessToken;
  });

  beforeEach(async () => {
    await reviewModel.deleteMany({});
  });

  afterAll(async () => {
    await reviewModel.deleteMany({});
    await app.close();
    await disconnect();
  });

  describe('POST /review/create', () => {
    it('should create a review and return 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/review/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validReviewDto)
        .expect(HttpStatus.CREATED);

      expect(res.body._id).toBeDefined();
      expect(res.body.productId).toBe(productId);
      expect(res.body.rating).toBe(4);
    });

    it('should return 400 if rating is missing', async () => {
      await request(app.getHttpServer())
        .post('/review/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validReviewDto, rating: undefined })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if rating is below 1', async () => {
      await request(app.getHttpServer())
        .post('/review/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validReviewDto, rating: 0 })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if rating is above 5', async () => {
      await request(app.getHttpServer())
        .post('/review/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validReviewDto, rating: 6 })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 if no token provided', async () => {
      await request(app.getHttpServer())
        .post('/review/create')
        .send(validReviewDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /review/byProduct/:productId', () => {
    it('should return reviews for existing product', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/review/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validReviewDto)
        .expect(HttpStatus.CREATED);

      const res = await request(app.getHttpServer())
        .get(`/review/byProduct/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0]._id).toBe(createRes.body._id);
    });

    it('should return empty array for product with no reviews', async () => {
      const res = await request(app.getHttpServer())
        .get(`/review/byProduct/${anotherProductId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual([]);
    });

    it('should return 400 for invalid productId format', async () => {
      const res = await request(app.getHttpServer())
        .get('/review/byProduct/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body.message).toBe(ID_VALIDATION_EXCEPTION);
    });
  });

  describe('DELETE /review/:id', () => {
    it('should delete existing review and return 200', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/review/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validReviewDto)
        .expect(HttpStatus.CREATED);

      const deletedRew = await request(app.getHttpServer())
        .delete(`/review/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(deletedRew.body._id).toBeDefined();
      expect(deletedRew.body.productId).toBe(productId);
      expect(deletedRew.body.rating).toBe(4);

      const review = await request(app.getHttpServer())
        .get(`/review/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: HttpStatus.NOT_FOUND,
          message: REVIEW_NOT_FOUND,
          error: 'Not Found',
        });
    });

    it('should return 404 when trying to delete non-existing review', async () => {
      const fakeId = new Types.ObjectId().toHexString();
      await request(app.getHttpServer())
        .delete(`/review/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: HttpStatus.NOT_FOUND,
          message: REVIEW_NOT_FOUND,
          error: 'Not Found',
        });
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app.getHttpServer())
        .delete('/review/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body.message).toBe(ID_VALIDATION_EXCEPTION);
    });

    it('should return 401 if no token provided', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/review/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validReviewDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .delete(`/review/${createRes.body._id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /review/:id', () => {
    it('should return a review by valid ID', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/review/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validReviewDto)
        .expect(HttpStatus.CREATED);

      const getRes = await request(app.getHttpServer())
        .get(`/review/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      // Проверяем структуру ответа
      expect(getRes.body).toBeDefined();
      expect(getRes.body._id).toBe(createRes.body._id);
      expect(getRes.body.productId).toBe(productId);
      expect(getRes.body.rating).toBe(validReviewDto.rating);
      expect(getRes.body.name).toBe(validReviewDto.name);
      expect(getRes.body.title).toBe(validReviewDto.title);
      expect(getRes.body.description).toBe(validReviewDto.description);
      expect(getRes.body).toHaveProperty('createdAt');
      expect(getRes.body).toHaveProperty('updatedAt');
    });

    it('should return 404 when review with given ID does not exist', async () => {
      const fakeId = new Types.ObjectId().toHexString();

      const res = await request(app.getHttpServer())
        .get(`/review/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(res.body).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: REVIEW_NOT_FOUND,
        error: 'Not Found',
      });
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app.getHttpServer())
        .get('/review/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body.message).toBe(ID_VALIDATION_EXCEPTION);
    });

    it('should return 401 if no authorization token is provided', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/review/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validReviewDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get(`/review/${createRes.body._id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
