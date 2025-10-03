import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaExceptionFilter } from '../src/common/prisma-exception.filter';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/ (GET)', () => {
    it('should return Hello World!', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('/users', () => {
    it('GET /users - should return empty array initially', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect([]);
    });

    it('POST /users - should create a user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ email: 'test@example.com', name: 'Test User' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.name).toBe('Test User');
        });
    });

    it('POST /users - should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ email: 'invalid-email', name: '' })
        .expect(400);
    });

    it('POST /users - should fail with duplicate email', async () => {
      // Create first user
      await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'duplicate@example.com', name: 'User 1' });

      // Try duplicate
      return request(app.getHttpServer())
        .post('/users')
        .send({ email: 'duplicate@example.com', name: 'User 2' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('GET /users/:id - should return user by ID', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'find@example.com', name: 'Find Me' });

      return request(app.getHttpServer())
        .get(`/users/${createRes.body.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createRes.body.id);
          expect(res.body.email).toBe('find@example.com');
        });
    });

    it('GET /users/:id - should return 404 for non-existent ID', () => {
      return request(app.getHttpServer())
        .get('/users/99999')
        .expect(404);
    });
  });
});
