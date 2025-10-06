import {
  AdminConfirmSignUpCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminUserGlobalSignOutCommand,
  ChallengeNameType,
  ChangePasswordCommand,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  CreateUserPoolClientCommand,
  CreateUserPoolCommand,
  ForgotPasswordCommand,
  GetUserAttributeVerificationCodeCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  MessageActionType,
  ResendConfirmationCodeCommand,
  RespondToAuthChallengeCommand,
  SignUpCommand,
  UpdateUserAttributesCommand,
  VerifyUserAttributeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConfirmForgotPasswordDto } from '@module/user/dto/confirm-forgot-password.dto';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { DEFAULT_LOGIN_ERROR } from '@base/base.constants';
import { AppType } from '@base/base.enum';
import { IIdentityProviderService } from '@/providers/cognito/cognito.interface';

@Injectable()
export class CognitoAdaptor implements IIdentityProviderService {
  // helpers
  private userPoolId: string = this.configService.get('cognito.userPoolId');
  private clientId: string = this.configService.get('cognito.clientId');
  private clientSecret: string = this.configService.get('cognito.clientSecret');

  // main providers information.
  constructor(
    private readonly configService: ConfigService,
    private readonly client: CognitoIdentityProviderClient,
  ) {
    this.setConfig();
  }

  // 👍 ALL COMMANDS
  // 📖 https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/

  // helper Methods
  async setConfig() {
    if (!this.userPoolId) await this.createUserPool();
    if (!this.clientId) await this.createUserPoolClient();
  }

  private cognitoException(err: any) {
    throw new BadRequestException(err.message || 'Unknown error');
  }
  private computeSecretHash(username: string): string {
    // https://docs.aws.amazon.com/cognito/latest/developerguide/signing-up-users-in-your-app.html#cognito-user-pools-computing-secret-hash

    return crypto
      .createHmac('SHA256', this.clientSecret)
      .update(username + this.clientId)
      .digest('base64');
  }
  // =====================================
  //                methods
  // =====================================
  // create user pool
  private async createUserPool() {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/CreateUserPoolCommand/
    try {
      const command = new CreateUserPoolCommand({
        PoolName: 'Jaudi core-api',
        Policies: {
          SignInPolicy: {
            AllowedFirstAuthFactors: ['EMAIL_OTP', 'SMS_OTP'],
          },
        },
        UserAttributeUpdateSettings: {
          AttributesRequireVerificationBeforeUpdate: ['email', 'phone_number'],
        },
        AutoVerifiedAttributes: ['email'], // VerifiedAttributesListType
        DeletionProtection: 'ACTIVE',
        SmsVerificationMessage: 'Your SMS verification code is {####}.',
        EmailVerificationMessage: 'Your Email verification code is {####}.',
      });
      const result = await this.client.send(command);
      this.userPoolId = result.UserPool.Id;
      console.warn(['COGNITO_USER_POOL_ID=', this.userPoolId].join(''));
    } catch (err) {
      this.cognitoException(err);
    }
  }

  // create User Pool Client
  private async createUserPoolClient() {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/CreateUserPoolClientCommand/
    try {
      const command = new CreateUserPoolClientCommand({
        UserPoolId: this.userPoolId,
        ClientName: 'Jaudi core-api - client',
        ExplicitAuthFlows: ['ALLOW_USER_PASSWORD_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH'],
        GenerateSecret: true,
      });

      const result = await this.client.send(command);

      this.clientId = result.UserPoolClient.ClientId;
      this.clientSecret = result.UserPoolClient.ClientSecret;

      console.warn(['COGNITO_CLIENT_ID=', this.clientId].join(''));
      console.warn(['COGNITO_CLIENT_SECRET=', this.clientSecret].join(''));
    } catch (err) {
      this.cognitoException(err);
    }
  }

  // sign-in
  async signIn(email: string, password: string) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/InitiateAuthCommand
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.clientId,

        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          SECRET_HASH: this.computeSecretHash(email),
        },
      });

      return await this.client.send(command);
    } catch (err: any) {
      if (
        [
          'User not authorized', // email error
          'Invalid password', // password error
        ].includes(err.message)
      )
        throw new UnauthorizedException(DEFAULT_LOGIN_ERROR);

      this.cognitoException(err);
    }
  }
  respondToAuthChallenge(
    challengeName: ChallengeNameType,
    Session: string,
    data: any,
  ): Promise<any> {
    try {
      const command = new RespondToAuthChallengeCommand({
        ClientId: this.clientId,
        ChallengeName: challengeName,
        Session: Session,

        ChallengeResponses: {
          SECRET_HASH: this.computeSecretHash(data.email),
          USERNAME: data.email,
          NEW_PASSWORD: data.password,
        },
      });
      return this.client.send(command);
    } catch (err) {
      this.cognitoException(err);
    }
  }
  // create a new user
  async createUserByEmail(email: string) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/SignUpCommand/  //
    try {
      const command = new SignUpCommand({
        ClientId: this.clientId,
        Username: email,
        SecretHash: this.computeSecretHash(email),
        Password: '',
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'userType', Value: AppType.REGULAR },
        ],
      });

      return await this.client.send(command);
    } catch (err) {
      this.cognitoException(err);
    }
  }

  // resend confirmation code
  async resendConfirmationCode(email: string) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/ResendConfirmationCodeCommand/
    try {
      const command = new ResendConfirmationCodeCommand({
        Username: email,
        ClientId: this.clientId,
        SecretHash: this.computeSecretHash(email),
      });

      return await this.client.send(command);
    } catch (err) {
      this.cognitoException(err);
    }
  }

  // confirm sign up code
  async confirmSignUp(email: string, confirmationCode: string) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/ConfirmSignUpCommand/
    try {
      const command = new ConfirmSignUpCommand({
        Username: email,
        ClientId: this.clientId,
        ConfirmationCode: confirmationCode,
        SecretHash: this.computeSecretHash(email),
      });

      return await this.client.send(command);
    } catch (err) {
      this.cognitoException(err);
    }
  }

  // change password
  async changePassword(token: string, new_password: string, old_password: string = undefined) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/ChangePasswordCommand/
    try {
      const userCommand = new ChangePasswordCommand({
        AccessToken: token,
        ProposedPassword: new_password,
        PreviousPassword: old_password,
      });
      return await this.client.send(userCommand);
    } catch (err) {
      this.cognitoException(err);
    }
  }

  async AdminChangePassword(email: string, password: string) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/AdminSetUserPasswordCommand/
    try {
      const agentCommand = new AdminSetUserPasswordCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        Permanent: true,
        Password: password,
      });
      return await this.client.send(agentCommand);
    } catch (err) {
      this.cognitoException(err);
    }
  }
  // forgot password
  async forgotPassword(email: string) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/ForgotPasswordCommand/
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.clientId,
        Username: email,
        SecretHash: this.computeSecretHash(email),
      });

      return await this.client.send(command);
    } catch (err) {
      this.cognitoException(err);
    }
  }

  async confirmForgotPassword(data: ConfirmForgotPasswordDto) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/ConfirmForgotPasswordCommand/
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.clientId,
        ConfirmationCode: data.code,
        Username: data.email,
        Password: data.password,
        SecretHash: this.computeSecretHash(data.email),
      });

      return await this.client.send(command);
    } catch (err) {
      this.cognitoException(err);
    }
  }

  // GetUserAttributeVerificationCodeCommand

  async updateUserAttributes(attr: { phone_number?: string; email?: string }, token: string) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/UpdateUserAttributesCommand/
    try {
      const UserAttributes = [
        { Name: 'email', Value: attr.email },
        { Name: 'phone_number', Value: attr.phone_number },
      ].filter((i) => i.Value);

      const command = new UpdateUserAttributesCommand({
        AccessToken: token,
        UserAttributes,
      });

      return await this.client.send(command);
    } catch (err) {
      this.cognitoException(err);
    }
  }

  // send code for email or phone
  async getUserAttributeVerificationCode(token: string, AttributeName: 'phone_number' | 'email') {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/GetUserAttributeVerificationCodeCommand/
    try {
      const command = new GetUserAttributeVerificationCodeCommand({
        AccessToken: token,
        AttributeName,
      });

      return await this.client.send(command);
    } catch (err) {
      this.cognitoException(err);
    }
  }

  // check code for email or phone
  async verifyUserAttribute(token: string, code: string, AttributeName: 'phone_number' | 'email') {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/VerifyUserAttributeCommand/
    try {
      const command = new VerifyUserAttributeCommand({
        AccessToken: token,
        AttributeName,
        Code: code,
      });

      return await this.client.send(command);
    } catch (err) {
      this.cognitoException(err);
    }
  }

  async adminConfirmUser(email: string) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/AdminConfirmSignUpCommand/
    try {
      const command = new AdminConfirmSignUpCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      });
      return await this.client.send(command);
    } catch (err) {
      this.cognitoException(err);
    }
  }

  async getUser(AccessToken: string) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/GetUserCommand/
    try {
      const command = new GetUserCommand({ AccessToken });
      return await this.client.send(command);
    } catch (err) {
      this.cognitoException(err);
    }
  }

  async createAgentUser(email: string, skip: boolean) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/AdminCreateUserCommand/
    try {
      const command = new AdminCreateUserCommand({
        Username: email,
        UserPoolId: this.userPoolId,
        DesiredDeliveryMediums: skip ? [] : ['EMAIL'],
        MessageAction:
          skip || 'development' == this.configService.get('environment')
            ? MessageActionType.SUPPRESS //don't send email or sms
            : MessageActionType.RESEND,
        TemporaryPassword: this.configService.get('admin.TemporaryPassword'),
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'userType', Value: AppType.AGENT },
        ],
      });
      return await this.client.send(command);
    } catch (err) {
      this.cognitoException(err);
    }
  }

  // logout
  logout(AccessToken: string) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/GlobalSignOutCommand/
    try {
      const command = new GlobalSignOutCommand({ AccessToken });
      return this.client.send(command);
    } catch (err) {
      this.cognitoException(err);
    }
  }

  logoutForUser(email: string) {
    // https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html
    try {
      const command = new AdminUserGlobalSignOutCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      });
      return this.client.send(command);
    } catch (err) {
      this.cognitoException(err);
    }
  }
}
