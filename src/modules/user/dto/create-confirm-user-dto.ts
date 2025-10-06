import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateConfirmUserDto {
  @ApiProperty({ example: '123123' })
  @IsString()
  code: string;

  @ApiProperty({ nullable: false, format: 'email' })
  @IsString()
  @IsEmail()
  email: string;
}
export class EmailDto extends PickType(CreateConfirmUserDto, ['email'] as const) {}
export class CodeDto extends PickType(CreateConfirmUserDto, ['code'] as const) {}
