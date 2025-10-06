import { BadRequestException } from '@nestjs/common';

export const CybridException = (error: any) => {
  throw new BadRequestException(error);
};
