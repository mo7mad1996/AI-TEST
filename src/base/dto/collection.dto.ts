import { Type } from '@nestjs/common';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

export function CollectionDto<TModel extends Type<any>>(model: TModel) {
  @ApiExtraModels(model)
  class CollectionDtoClass {
    @ApiProperty()
    page: number;

    @ApiProperty()
    per_page: number;

    @ApiProperty()
    total: number;

    @ApiProperty()
    pagesCount: number;

    @ApiProperty({ type: 'array', items: { $ref: getSchemaPath(model) } })
    objects: InstanceType<TModel>[];
  }

  return CollectionDtoClass;
}
