import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { RegularRoles } from '@base/base.enum';
import { CountryCode, IsPhoneNumberMultiple } from '@/decorators/is-phone-number-multiple';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @ApiPropertyOptional({ format: 'phone' })
  @IsPhoneNumberMultiple([CountryCode.CA, CountryCode.US], { message: 'Invalid US phone number' })
  phone_number?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  postcode?: string;

  @ApiPropertyOptional()
  @ApiProperty({ format: 'date' })
  @IsOptional()
  @Type(() => Date)
  date_of_birth?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(RegularRoles)
  role?: RegularRoles = RegularRoles.INDIVIDUAL;

  // passwords
  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[\W_])/, { message: 'Password must contain at least one special character' })
  password?: string;

  @ApiPropertyOptional()
  @ApiProperty()
  @IsOptional()
  old_password: string;
}
