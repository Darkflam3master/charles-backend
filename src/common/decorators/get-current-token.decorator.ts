import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type RequestWithTokens = {
  cookies: { access_token?: string; refresh_token?: string };
};
export const GetCurrentToken = createParamDecorator(
  (tokenType: 'access_token' | 'refresh_token', context: ExecutionContext) => {
    console.error('IN GET CURREN TOKEN');

    const request = context.switchToHttp().getRequest<RequestWithTokens>();
    console.log('cookie: ', request.cookies);
    const token = request.cookies[tokenType];

    if (!token) {
      console.error(`${tokenType} not found in request`);
      throw new Error('Authentication failed'); // Handle missing user
    }

    return token;
  },
);
