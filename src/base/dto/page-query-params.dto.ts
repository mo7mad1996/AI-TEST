import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@base/base.constants';

export class BasePageQueryParamsDto {
  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  page?: number = DEFAULT_PAGE_NUMBER;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  per_page?: number = DEFAULT_PAGE_SIZE;

  get offset(): number {
    return (this.page - 1) * this.per_page;
  }

  pageCount(total: number): number {
    return Math.ceil(total / this.per_page);
  }
}
export class BaseIncludesParamsDto<TEnum extends string> {
  @ApiPropertyOptional({
    description: 'Comma separated relations. Example: user,profile',
  })
  @IsOptional()
  @IsEnum(Object as any, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }
    return value;
  })
  includes?: TEnum[];
}
