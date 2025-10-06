import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppType, RegularRoles } from '@base/base.enum';
import { Auth } from '@/decorators/auth.decorator';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { Token } from '@/decorators/token.decorator';
import { CreateBusinessInfoDto, UpdateBusinessInfoDto } from './dto/business-info.dto';
import { CodeDto } from './dto/create-confirm-user-dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Auth(AppType.REGULAR)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('update-me')
  @ApiOperation({
    summary: 'Update user information.',
    description: [
      '### phone_number examples: [`13322076524`,  `16146491554`, `19708072822`, `19707424468`].',
      '* <font color="red"> **old_password**</font> : <ins> is required when updating password not created</ins>.',
    ].join('\n'),
  })
  updateMe(@Body() body: UpdateUserDto, @CurrentUser() user: UserDto, @Token() token: string) {
    return this.userService.updateUser(body, user, token);
  }

  @Post('/confirm-phone')
  @HttpCode(HttpStatus.ACCEPTED)
  verifyUserAttributePhone(@Token() token: string, @Body() body: CodeDto) {
    return this.userService.verifyUserAttribute(token, body.code, 'phone_number');
  }

  @Get('/send-phone-code')
  resendPhone(@Token() token: string) {
    return this.userService.resendCode(token, 'phone_number');
  }

  @Post('/confirm-email')
  @HttpCode(HttpStatus.ACCEPTED)
  verifyUserAttributeEmail(@Token() token: string, @Body() body: CodeDto) {
    return this.userService.verifyUserAttribute(token, body.code, 'email');
  }

  @Get('/send-email-code')
  resendEmail(@Token() token: string) {
    return this.userService.resendCode(token, 'email');
  }
  @ApiOperation({
    description:
      '* <font color="red"> **businessInfo** </font> : <ins> allows only when role is `business`</ins>.',
  })
  @Post('/create-business-info')
  createBusinessInfo(
    @Body() body: CreateBusinessInfoDto,
    @CurrentUser(RegularRoles.BUSINESS) user: UserDto,
  ) {
    return this.userService.createBusinessInfo(body, user);
  }

  @Patch('/update-business-info')
  updateBusinessInfo(
    @Body() body: UpdateBusinessInfoDto,
    @CurrentUser(RegularRoles.BUSINESS) user: UserDto,
  ) {
    return this.userService.updateBusinessInfo(body, user);
  }

  @Get('/me')
  getCurrentUser(@CurrentUser() user: UserDto) {
    return user;
  }
}
