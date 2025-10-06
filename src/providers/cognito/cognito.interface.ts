import {
  AdminConfirmSignUpCommandOutput,
  AdminCreateUserCommandOutput,
  ChallengeNameType,
  ForgotPasswordCommandOutput,
  GetUserAttributeVerificationCodeCommandOutput,
  GlobalSignOutCommandOutput,
  InitiateAuthCommandOutput,
  ResendConfirmationCodeCommandOutput,
  RespondToAuthChallengeResponse,
  SignUpCommandOutput,
  UpdateUserAttributesResponse,
  VerifyUserAttributeCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConfirmForgotPasswordDto } from '@module/user/dto/confirm-forgot-password.dto';

export const IDENTITY_PROVIDER_KEY = 'IDENTITY_KEY';

export interface IIdentityProviderService {
  // users
  createUserByEmail(email: string): Promise<SignUpCommandOutput>;
  resendConfirmationCode(email: string): Promise<ResendConfirmationCodeCommandOutput>;
  confirmSignUp(email: string, confirmationCode: string): Promise<AdminConfirmSignUpCommandOutput>;
  updateUserAttributes(
    attr: { phone_number?: string; email?: string },
    token: string,
  ): Promise<UpdateUserAttributesResponse>;
  getUserAttributeVerificationCode(
    token: string,
    AttributeName: 'phone_number' | 'email',
  ): Promise<GetUserAttributeVerificationCodeCommandOutput>;
  verifyUserAttribute(
    token: string,
    code: string,
    AttributeName: 'phone_number' | 'email',
  ): Promise<VerifyUserAttributeCommandOutput>;
  forgotPassword(email: string): Promise<ForgotPasswordCommandOutput>;
  confirmForgotPassword(data: ConfirmForgotPasswordDto): Promise<any>;

  // agents
  adminConfirmUser(email: string): Promise<AdminConfirmSignUpCommandOutput>;
  createAgentUser(email: string, skip: boolean): Promise<AdminCreateUserCommandOutput>;
  AdminChangePassword(email: string, password: string): Promise<any>;
  getUser(token: string): Promise<any>;
  logoutForUser(email: string): Promise<any>;
  respondToAuthChallenge(
    ChallengeName: ChallengeNameType,
    Session: string,
    data: {
      email: string;
      password: string;
    },
  ): Promise<RespondToAuthChallengeResponse>;

  // both
  signIn(email: string, password: string): Promise<InitiateAuthCommandOutput>;
  changePassword(token: string, new_password: string, old_password: string): Promise<any>;
  logout(token: string): Promise<GlobalSignOutCommandOutput>;
}
