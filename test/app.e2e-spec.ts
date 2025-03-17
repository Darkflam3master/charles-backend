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
    const signInDto = {
      userName: 'testuser1',
      password: 'BigStrongPassWordComplex*8',
    };
    let authResult = { access_token: '', refresh_token: '' };

    describe('Post /auth/signup ', () => {
      it('should return 201 when signup is successful', async () => {
        const signUpDto = {
          ...signInDto,
          email: 'testuser1@example.com',
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
      const response = await request(server)
        .post('/auth/login')
        .send(signInDto)
        .expect(200);

      authResult = response.body as typeof authResult;

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
    });

    it('Post /auth/refresh', async () => {
      const server = app.getHttpServer() as Server;

      const response = await request(server)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${authResult.refresh_token}`)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
    });
    it('Post /auth/logout', async () => {
      const server = app.getHttpServer() as Server;

      const response = await request(server)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authResult.access_token}`)
        .expect(200);

      expect(response.body).toEqual({ message: 'Successfully logged out' });
    });
  });
});
