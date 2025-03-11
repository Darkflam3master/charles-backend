import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRequest } from './user.types';

export const GetCurrentUser = createParamDecorator(
  (data: keyof UserRequest | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user?: UserRequest }>();

    if (!request.user) {
      throw new Error('User not found in request'); // Handle missing user
    }

    return data ? request.user[data] : request.user;
  },
);
