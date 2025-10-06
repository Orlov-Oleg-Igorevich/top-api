import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect, Model, Types } from 'mongoose';
import { CreateProductDto } from '../src/product/dto/create-product.dto';
import { FindProductDto } from '../src/product/dto/find-product.dto';
import { ProductDocument, ProductModel } from '../src/product/product.model';
import { NOT_FOUND_PRODUCT_EXCEPTION } from '../src/product/product.constans';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { getModelToken } from '@nestjs/mongoose';
import { ID_VALIDATION_EXCEPTION } from '../src/pipes/id-validation.constans';

const validProductDto: CreateProductDto = {
  image: 'test.jpg',
  title: 'Test Product',
  price: 999,
  oldPrice: 1299,
  credit: 83,
  categories: ['electronics', 'smartphones'],
  description: 'A great product for testing',
  advantages: 'Тестовые преимущества',
  disAdvantages: 'Тестовые недостатки',
  characteristics: [
    {
      name: '1',
      value: 'Тест 1',
    },
    {
      name: '1',
      value: 'Тест 2',
    },
  ],
  tags: ['new', 'discount'],
};

const loginDto: AuthDto = {
  email: 'a1a@mail.ru',
  password: '1',
};

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let productModel: Model<ProductDocument>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    productModel = moduleFixture.get<Model<ProductDocument>>(getModelToken(ProductModel.name));

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
    await productModel.deleteMany({});
  });

  afterAll(async () => {
    await productModel.deleteMany({});
    await app.close();
    await disconnect();
  });

  describe('POST /product/create', () => {
    it('should create a product and return 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validProductDto)
        .expect(HttpStatus.CREATED);

      expect(res.body._id).toBeDefined();
      expect(res.body.title).toBe(validProductDto.title);
      expect(res.body.price).toBe(validProductDto.price);
      expect(res.body.categories).toEqual(validProductDto.categories);
    });

    it('should return 400 if required field is missing', async () => {
      const invalidDto = { ...validProductDto, title: undefined };
      await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 if no token provided', async () => {
      await request(app.getHttpServer())
        .post('/product/create')
        .send(validProductDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /product/:id', () => {
    it('should return a product by valid ID', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validProductDto)
        .expect(HttpStatus.CREATED);

      const getRes = await request(app.getHttpServer())
        .get(`/product/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(getRes.body._id).toBe(createRes.body._id);
      expect(getRes.body.title).toBe(validProductDto.title);
    });

    it('should return 404 for non-existing product', async () => {
      const fakeId = new Types.ObjectId().toHexString();
      const res = await request(app.getHttpServer())
        .get(`/product/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(res.body).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: NOT_FOUND_PRODUCT_EXCEPTION,
        error: 'Not Found',
      });
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app.getHttpServer())
        .get('/product/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body.message).toBe(ID_VALIDATION_EXCEPTION);
    });

    it('should return 401 if no token provided', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validProductDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get(`/product/${createRes.body._id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /product/:id', () => {
    it('should delete existing product and return it', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validProductDto)
        .expect(HttpStatus.CREATED);

      const deleteRes = await request(app.getHttpServer())
        .delete(`/product/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(deleteRes.body._id).toBe(createRes.body._id);
      expect(deleteRes.body.title).toBe(validProductDto.title);

      await request(app.getHttpServer())
        .get(`/product/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 when deleting non-existing product', async () => {
      const fakeId = new Types.ObjectId().toHexString();
      await request(app.getHttpServer())
        .delete(`/product/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: HttpStatus.NOT_FOUND,
          message: NOT_FOUND_PRODUCT_EXCEPTION,
          error: 'Not Found',
        });
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app.getHttpServer())
        .delete('/product/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body.message).toBe(ID_VALIDATION_EXCEPTION);
    });

    it('should return 401 if no token provided', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validProductDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .delete(`/product/${createRes.body._id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /product/:id', () => {
    it('should update product and return updated document', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validProductDto)
        .expect(HttpStatus.CREATED);

      const updateDto: Partial<CreateProductDto> = {
        title: 'Updated Product',
        price: 1499,
      };

      const patchRes = await request(app.getHttpServer())
        .patch(`/product/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(patchRes.body._id).toBe(createRes.body._id);
      expect(patchRes.body.title).toBe(updateDto.title);
      expect(patchRes.body.price).toBe(updateDto.price);
      expect(patchRes.body.description).toBe(validProductDto.description);
    });

    it('should return 404 when updating non-existing product', async () => {
      const fakeId = new Types.ObjectId().toHexString();
      await request(app.getHttpServer())
        .patch(`/product/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New Title' })
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: HttpStatus.NOT_FOUND,
          message: NOT_FOUND_PRODUCT_EXCEPTION,
          error: 'Not Found',
        });
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app.getHttpServer())
        .patch('/product/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body.message).toBe(ID_VALIDATION_EXCEPTION);
    });

    it('should return 401 if no token provided', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validProductDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .patch(`/product/${createRes.body._id}`)
        .send({ title: 'Hacked Title' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /product/find', () => {
    beforeEach(async () => {
      // Создаём несколько продуктов для поиска
      await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validProductDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...validProductDto,
          title: 'Another Product',
          categories: ['electronics', 'laptops'],
          tags: ['bestseller'],
        })
        .expect(HttpStatus.CREATED);
    });

    it('should return products matching search term', async () => {
      const findDto: FindProductDto = { category: 'electronics', limit: 5 };
      const res = await request(app.getHttpServer())
        .post('/product/find')
        .send(findDto)
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].title).toContain('Test');
    });

    it('should return empty array for non-matching search', async () => {
      const findDto: FindProductDto = { category: 'NonExistent', limit: 5 };
      const res = await request(app.getHttpServer())
        .post('/product/find')
        .send(findDto)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual([]);
    });

    it('should return 400 if DTO is invalid (e.g. empty)', async () => {
      await request(app.getHttpServer())
        .post('/product/find')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
