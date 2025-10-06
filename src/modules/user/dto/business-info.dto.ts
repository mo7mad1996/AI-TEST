import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BusinessPosition } from '@base/base.enum';

export class CreateBusinessInfoDto {
  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsString()
  @IsEnum(BusinessPosition)
  position: BusinessPosition;

  @IsString()
  region: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  postcode: string;

  @IsString()
  industry: string;

  @ApiPropertyOptional({ nullable: true, format: 'hostname' })
  @IsOptional()
  @IsString()
  website?: string;

  @IsString()
  size: string;
}

export class UpdateBusinessInfoDto extends PartialType(CreateBusinessInfoDto) {}
