import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { RegularRoles } from '@base/base.enum';
import { CollectionDto } from '@base/dto/collection.dto';
import { CountryCode, IsPhoneNumberMultiple } from '@/decorators/is-phone-number-multiple';
import { UserBusinessEntity } from '../entities/business.entity';
import { UserEntity } from '../entities/user.entity';

export class UserDto extends PartialType(UserEntity) {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: false, format: 'email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ nullable: true })
  @IsPhoneNumberMultiple([CountryCode.CA, CountryCode.US], { message: 'Invalid US phone number' })
  phone_number: string = null;

  @ApiProperty({ enum: RegularRoles })
  @IsEnum(RegularRoles)
  role: RegularRoles;

  @ApiPropertyOptional({ nullable: true })
  businessInfo?: UserBusinessEntity | null;
}
export class UserListDto extends CollectionDto(UserDto) {}
