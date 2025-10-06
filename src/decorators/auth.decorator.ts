import { AuthGuard } from '@module/auth/guard/auth.guard';
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AppType } from '@base/base.enum';

export const AUTH_TYPE_KEY = 'auth_type';
export const Auth = (...authTypes: AppType[]) => {
  return applyDecorators(
    SetMetadata(AUTH_TYPE_KEY, authTypes),
    UseGuards(AuthGuard),
    ApiBearerAuth(...authTypes),
  );
};
