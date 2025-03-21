import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthLogInDto, AuthSignUpDto } from './dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

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
  });

  describe('Post /auth/signup', () => {
    it('should return access and refresh tokens on successful signup', async () => {
      const signupDto: AuthSignUpDto = {
        email: 'test@example.com',
        password: 'strongPassword123',
        userName: 'testUser',
        twoFactorEnabled: false,
      };

      const mockTokens = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      jest.spyOn(authService, 'signup').mockResolvedValue(mockTokens);

      expect(await authController.signUp(signupDto)).toBe(mockTokens);
      expect(mockAuthService.signup).toHaveBeenCalledWith(signupDto);
    });
  });

  describe('Post /auth/login', () => {
    it('should return access and refresh tokens on successful login', async () => {
      const loginDto: AuthLogInDto = {
        password: 'strongPassword123',
        userName: 'testUser',
      };

      const mockTokens = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockTokens);

      expect(await authController.login(loginDto)).toBe(mockTokens);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
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

      const mockNewTokens = {
        access_token: 'access-token-new',
        refresh_token: 'refresh-token-new',
      };

      jest.spyOn(authService, 'refreshTokens').mockResolvedValue(mockNewTokens);

      expect(
        await authController.refreshTokens(
          mockCurrentTokens.access_token,
          mockCurrentTokens.refresh_token,
        ),
      ).toBe(mockNewTokens);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        mockCurrentTokens.access_token,
        mockCurrentTokens.refresh_token,
      );
    });
  });
});
