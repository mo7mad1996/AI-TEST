import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { REQUEST_TOKEN_KEY } from '@base/base.constants';

export const Token = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req: Request = ctx.switchToHttp().getRequest();

  return req.headers[REQUEST_TOKEN_KEY];
});
