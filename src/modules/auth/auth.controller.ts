import { ConfirmForgotPasswordDto } from '@module/user/dto/confirm-forgot-password.dto';
import { CreateConfirmUserDto, EmailDto } from '@module/user/dto/create-confirm-user-dto';
import { CreateUserDto } from '@module/user/dto/create-user.dto';
import { Body, Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppType } from '@base/base.enum';
import { Auth } from '../../decorators/auth.decorator';
import { Token } from '../../decorators/token.decorator';
import { AuthService } from './auth.service';
import { LoginCredentialsDto, RespondToAuthChallengeDto } from './dto/login-credentials.dto';

@Controller('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // login
  @ApiOperation({
    summary: 'SIGN IN (AGENT - USER)',
    description: `
## <font color="red">If you don't receive tokens, we will need to take another step.</font>

Please use the [/api/v1/Auth/respondToAuthChallenge](#/Auth/AuthController_respondToAuthChallenge_v1) endpoint, and send your data in this format:
\`\`\`js
{
  "ChallengeName": "the challenge name you receive in the response",
  "Session": "the session you receive in the response"
  "data": ...
}
\`\`\`
    `,
  })
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() body: LoginCredentialsDto) {
    return this.authService.signIn(body.email, body.password);
  }

  @ApiOperation({
    summary: 'If any issue with login, use this endpoint.',
  })
  @Post('respondToAuthChallenge')
  respondToAuthChallenge(@Body() body: RespondToAuthChallengeDto) {
    return this.authService.respondToAuthChallenge(body.ChallengeName, body.Session, body.data);
  }

  // create a new account
  @ApiOperation({
    summary: 'CREATE A NEW USER',
    description: '## create a new user with email',
  })
  @Post('sign-up/email')
  async addEmail(@Body() body: CreateUserDto) {
    return await this.authService.createUserByEmail(body.email);
  }

  // confirm user
  @ApiOperation({
    summary: 'CONFIRM USER',
    description: 'confirm user for `email` and `phone-number`',
  })
  @Post('confirm')
  @HttpCode(HttpStatus.ACCEPTED)
  async confirmSignUp(@Body() body: CreateConfirmUserDto) {
    return await this.authService.confirmSignUp(body.email, body.code);
  }

  // resend code
  @HttpCode(HttpStatus.OK)
  @Post('resend-code')
  async resendConfirmationCode(@Body() body: EmailDto): Promise<boolean> {
    return await this.authService.resendConfirmationCode(body.email);
  }

  // forget password
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() body: EmailDto) {
    return await this.authService.forgotPassword(body.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('confirm-forgot-password')
  async confirmForgotPassword(@Body() body: ConfirmForgotPasswordDto) {
    return await this.authService.confirmForgotPassword(body);
  }

  @Auth(AppType.AGENT, AppType.REGULAR)
  @Delete('sign-out')
  async logout(@Token() token: string) {
    return await this.authService.logout(token);
  }
}
