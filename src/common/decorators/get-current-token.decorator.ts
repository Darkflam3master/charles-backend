import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

type RequestWithTokens = {
  cookies: { access_token?: string; refresh_token?: string };
};
export const GetCurrentToken = createParamDecorator(
  (tokenType: 'access_token' | 'refresh_token', context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithTokens>();
    const token = request.cookies[tokenType];

    if (!token) {
      console.error(`${tokenType} not found in request`);
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    return token;
  },
);
