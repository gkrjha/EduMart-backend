import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from 'src/common/types/auth-user.type';

export type { AuthUser } from 'src/common/types/auth-user.type';

export const User = createParamDecorator(
  (data: keyof AuthUser, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser;
    return data ? user?.[data] : user;
  },
);
