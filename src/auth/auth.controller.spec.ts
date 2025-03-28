import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthLogInDto, AuthSignUpDto } from './dto';
import { Response } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let res: Response;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshTokens: jest.fn(),
  };

  beforeEach(async () => {
    const testAuthModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = testAuthModule.get(AuthController);
    authService = testAuthModule.get(AuthService);
    res = { cookie: jest.fn(), json: jest.fn() } as unknown as Response;
  });

  describe('Post /auth/signup', () => {
    it('should return access and refresh tokens on successful signup', async () => {
      const signupDto: AuthSignUpDto = {
        email: 'test@example.com',
        password: 'strongPassword123',
        userName: 'testUser',
        twoFactorEnabled: false,
      };

      jest.spyOn(authService, 'signup');

      await authController.signUp(signupDto, res);
      expect(mockAuthService.signup).toHaveBeenCalledWith(signupDto, res);
    });
  });

  describe('Post /auth/login', () => {
    it('should return access and refresh tokens on successful login', async () => {
      const loginDto: AuthLogInDto = {
        password: 'strongPassword123',
        userName: 'testUser',
      };

      jest.spyOn(authService, 'login');

      await authController.login(loginDto, res);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto, res);
    });
  });

  describe('Post /auth/logout', () => {
    it('should return access and refresh tokens on successful login', async () => {
      const mockId = 'mock-id';

      const mockResult = { message: 'Successfully logged out' };

      jest.spyOn(authService, 'logout').mockResolvedValue(mockResult);

      expect(await authController.logout(mockId)).toBe(mockResult);
      expect(mockAuthService.logout).toHaveBeenCalledWith(mockId);
    });
  });

  describe('Post /auth/refresh', () => {
    it('should return access and refresh tokens on successful refresh', async () => {
      const mockCurrentTokens = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      jest.spyOn(authService, 'refreshTokens');

      await authController.refreshTokens(
        mockCurrentTokens.access_token,
        mockCurrentTokens.refresh_token,
        res,
      );

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        mockCurrentTokens.access_token,
        mockCurrentTokens.refresh_token,
        res,
      );
    });
  });
});
