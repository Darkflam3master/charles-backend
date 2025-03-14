import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';

describe('App e2e', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    await app.listen(3001);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    describe('Post /auth/signup ', () => {
      it('should return 201 when signup is successful', async () => {
        // const signUpDto = {
        //   userName: 'testuser',
        //   password: 'BigStrongPassWordComplex*8',
        //   email: 'test@example.com',
        // };
        // return request(app.getHttpServer())
        //   .post('/auth/signup')
        //   .send(signUpDto)
        //   .expect(201)
        //   .then((response) => {
        //     expect(response).toHaveProperty('access_token');
        //   });
      });
    });
    it('Post /auth/login', () => {});
    it('Post /auth/refresh', () => {});
    it('Post /auth/logout', () => {});
  });
});
