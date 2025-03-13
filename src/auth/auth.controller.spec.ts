import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSignUpDto } from './dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const testAuthModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: { signup: jest.fn(), login: jest.fn() },
        },
      ],
    }).compile();

    authController = testAuthModule.get(AuthController);
    authService = testAuthModule.get(AuthService);
  });

  describe('Post /auth/signup', () => {
    it('should return access and refresh tokens on successful signup', async () => {
      const signupDto: AuthSignUpDto = {
        email: 'test@example.com',
        password: 'strongPassword123',
        userName: 'testUser',
      };

      const mockTokens = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      jest.spyOn(authService, 'signup').mockResolvedValue(mockTokens);

      expect(await authController.signUp(signupDto)).toBe(mockTokens);
    });
  });
});
