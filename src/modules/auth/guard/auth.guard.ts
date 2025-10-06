import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ACCEPT_TOKEN_KEY,
  DEFAULT_GUARD_ERROR,
  REQUEST_TOKEN_KEY,
  REQUEST_USER_KEY,
} from '@base/base.constants';
import { AppType } from '@base/base.enum';
import { AUTH_TYPE_KEY } from '../../../decorators/auth.decorator';
import { AuthService } from '../auth.service';

/**
 * Guard for user
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const acceptRoles = this.readMetaData(ctx, AUTH_TYPE_KEY);
    if (!acceptRoles || !acceptRoles.length) return true; // No Roles Here

    // read the token
    const token = this.readHeader(ctx, ACCEPT_TOKEN_KEY)?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException();
    this.setHeader(ctx, REQUEST_TOKEN_KEY, token);

    // read the user
    const user = await this.readUser(token);
    this.setHeader(ctx, REQUEST_USER_KEY, user);

    const userType = user.type;
    if (!acceptRoles.includes(userType)) throw new UnauthorizedException(DEFAULT_GUARD_ERROR);

    return true;
  }

  private readMetaData(context: ExecutionContext, key: string): AppType[] {
    return this.reflector.getAllAndOverride<AppType[]>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private setHeader(ctx: ExecutionContext, key: string, value?: any) {
    const req: Request = ctx.switchToHttp().getRequest();

    req.headers[key] = value;
  }

  private readHeader(ctx: ExecutionContext, key: string) {
    const req: Request = ctx.switchToHttp().getRequest();

    return req.headers[key];
  }

  private readUser(token: string) {
    return this.authService.getUser(token);
  }
}
