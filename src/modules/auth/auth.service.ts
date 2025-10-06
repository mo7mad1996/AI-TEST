import { ChallengeNameType } from '@aws-sdk/client-cognito-identity-provider';
import { AgentEntity } from '@module/agent/entities/agent.entity';
import { ConfirmForgotPasswordDto } from '@module/user/dto/confirm-forgot-password.dto';
import { UserDto } from '@module/user/dto/user.dto';
import { UserEntity } from '@module/user/entities/user.entity';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_LOGIN_ERROR } from '@base/base.constants';
import { AppType } from '@base/base.enum';
import {
  IDENTITY_PROVIDER_KEY,
  IIdentityProviderService,
} from '@/providers/cognito/cognito.interface';
import { LoginResponseDto } from './dto/login-credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    // 👇 Auth Providers
    @Inject(IDENTITY_PROVIDER_KEY)
    private readonly authProvider: IIdentityProviderService,

    // 👇 databases
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  // =================================
  //         ⚙️ Helper methods
  // =================================
  private async findUserByEmailOrFail(email: string) {
    const userDb = await this.userRepository.findOneBy({ email });
    if (!userDb) throw new NotAcceptableException(`User with Email: '${email}' Not Found`);
    return userDb;
  }

  // =================================
  //              methods
  // =================================
  // login
  async signIn(email: string, password: string): Promise<LoginResponseDto> {
    const res = await this.authProvider.signIn(email, password);

    const AuthenticationResult = res.AuthenticationResult;
    const user =
      (await this.userRepository.findOneBy({ email })) ||
      (await this.agentRepository.findOneBy({ email }));

    if (res.$metadata.httpStatusCode !== 200 || !user)
      throw new ForbiddenException(DEFAULT_LOGIN_ERROR);

    return {
      AccessToken: AuthenticationResult?.AccessToken,
      RefreshToken: AuthenticationResult?.RefreshToken,
      IdToken: AuthenticationResult?.IdToken,
      User: user,
      ChallengeName: AuthenticationResult ? res.ChallengeName : undefined,
      Session: AuthenticationResult ? res.Session : undefined,
    };
  }

  // create user
  async createUserByEmail(email: string): Promise<UserDto> {
    // check if we have this email in database
    const exists = await this.userRepository.exists({ where: { email } });
    if (exists) throw new BadRequestException('User already exists');

    // create a new user from cognito
    const result = await this.authProvider.createUserByEmail(email);
    if (!result) throw new ForbiddenException('can not create user!');

    // create a new user in database from cognito result
    const { UserSub, UserConfirmed } = result;
    const db_user = this.userRepository.create({
      type: AppType.REGULAR,
      email,
      authProviderId: UserSub,
      confirmationEmail: UserConfirmed,
    });
    await this.userRepository.save(db_user);

    return db_user;
  }

  async respondToAuthChallenge(ChallengeName: ChallengeNameType, Session: string, data: any) {
    switch (ChallengeName) {
      case ChallengeNameType.NEW_PASSWORD_REQUIRED:
        return await this.authProvider.respondToAuthChallenge(ChallengeName, Session, data);
    }
  }

  // confirm user
  async confirmSignUp(email: string, code: string) {
    const userDb = await this.findUserByEmailOrFail(email);

    if (userDb.confirmationEmail && userDb.confirmationPhone)
      throw new BadRequestException('User already confirmed');

    const result = await this.authProvider.confirmSignUp(email, code);

    function confirm() {
      if (!userDb.confirmationEmail) return userDb.setConfirmationEmail(true);
      if (!userDb.confirmationPhone) return userDb.setConfirmationPhone(true);
    }
    // update
    await confirm();

    return this.signIn(email, '');
  }

  // resend confirm code
  async resendConfirmationCode(email: string) {
    const userDb = await this.findUserByEmailOrFail(email);

    if (userDb.confirmationEmail && userDb.confirmationPhone)
      throw new BadRequestException('User already confirmed');

    await this.authProvider.resendConfirmationCode(email);
    return true;
  }

  // get user by token
  async getUser(token: string) {
    const res = await this.authProvider.getUser(token);
    const authProviderId = res.Username;

    const type = res.UserAttributes.find(
      (attr: { Name: string }) => attr.Name === 'userType',
    ).Value;

    switch (type) {
      case AppType.REGULAR:
        return await this.userRepository.findOne({ where: { authProviderId } });

      case AppType.AGENT:
        return await this.agentRepository.findOne({ where: { authProviderId } });

      default:
        return res;
    }
  }

  // change password
  changePassword(token: string, new_password: string, old_password: string) {
    return this.authProvider.changePassword(token, new_password, old_password || '');
  }

  // update user
  async updateUserAttributes(
    attr: { phone_number?: string; email?: string },
    token: string,
  ): Promise<UserDto> {
    await this.authProvider.updateUserAttributes(attr, token);

    // update database
    const userDb = await this.getUser(token);
    Object.keys(attr).forEach((key) => (userDb[key] = attr[key]));

    return userDb;
  }

  // forget password
  async forgotPassword(email: string): Promise<string> {
    const res = await this.authProvider.forgotPassword(email);

    return res.CodeDeliveryDetails?.Destination;
  }

  // confirm forgot password
  async confirmForgotPassword(data: ConfirmForgotPasswordDto) {
    await this.authProvider.confirmForgotPassword(data);
    return this.signIn(data.email, data.password);
  }

  // verify user {email, phone_number}
  async getUserAttributeVerificationCode(token: string, AttributeName: 'email' | 'phone_number') {
    await this.authProvider.getUserAttributeVerificationCode(token, AttributeName);
    return true;
  }

  async verifyUserAttribute(token: string, code: string, AttributeName: 'phone_number' | 'email') {
    const res = await this.authProvider.verifyUserAttribute(token, code, AttributeName);
    const userDb = await this.getUser(token);

    if (res) {
      if (AttributeName === 'email') await userDb.setConfirmationEmail(true);
      if (AttributeName === 'phone_number') await userDb.setConfirmationPhone(true);
    }
    return userDb;
  }

  logout(token: string) {
    return this.authProvider.logout(token);
  }

  // -=====================================-
  // -               Admin
  // -=====================================-
  // admin confirm ✔️ ➡️ user
  async adminConfirmUser(email: string) {
    const userDb = await this.findUserByEmailOrFail(email);

    if (userDb.confirmationEmail && userDb.confirmationPhone)
      throw new BadRequestException('User already confirmed');

    await this.authProvider.adminConfirmUser(email);

    await userDb.setConfirmationEmail(true);
    await userDb.setConfirmationPhone(true);

    return userDb;
  }
}
