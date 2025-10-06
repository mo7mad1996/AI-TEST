import { ExecutionContext, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { DEFAULT_GUARD_ERROR, REQUEST_USER_KEY } from '@base/base.constants';
import { AgentRole, RegularRoles } from '@base/base.enum';

export const CurrentUser = createParamDecorator(
  (role: RegularRoles | AgentRole, ctx: ExecutionContext) => {
    const user = readHeader(ctx, REQUEST_USER_KEY);
    if (!user) throw new UnauthorizedException();

    if (role) {
      if ('string' == typeof user.role)
        if (user.role !== role) throw new UnauthorizedException(DEFAULT_GUARD_ERROR);
        else {
          // array agent
          if (!user.role.includes(role)) throw new UnauthorizedException(DEFAULT_GUARD_ERROR);
        }
    }

    return user;
  },
);

function readHeader(ctx: ExecutionContext, key: string) {
  const req: Request = ctx.switchToHttp().getRequest();

  return req.headers[key];
}
