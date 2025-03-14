import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Server } from 'http';

describe('App e2e', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    await app.listen(3001);
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    describe('Post /auth/signup ', () => {
      it('should return 201 when signup is successful', async () => {
        const signUpDto = {
          userName: 'testuser',
          password: 'BigStrongPassWordComplex*8',
          email: 'test@example.com',
        };

        const response = await request(server)
          .post('/auth/signup')
          .send(signUpDto)
          .expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('refresh_token');
      });
    });
    it('Post /auth/login', async () => {
      const signInDto = {
        userName: 'testuser',
        password: 'BigStrongPassWordComplex*8',
      };

      const response = await request(server)
        .post('/auth/login')
        .send(signInDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
    });

    it('Post /auth/refresh', async () => {
      const server = app.getHttpServer() as Server;

      const response = await request(server).post('/auth/refresh').expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
    });
    it('Post /auth/logout', async () => {
      const server = app.getHttpServer() as Server;

      const response = await request(server).post('/auth/logout').expect(200);

      expect(response.body).toEqual({ message: 'Successfully logged out' });
    });
  });
});
