import { ChallengeNameType } from '@aws-sdk/client-cognito-identity-provider';
import { AgentDto } from '@module/agent/dto/agent.dto';
import { UserDto } from '@module/user/dto/user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsObject, IsString } from 'class-validator';

export class LoginCredentialsDto {
  @ApiProperty({ format: 'email', required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  password: string;
}

export class LoginResponseDto {
  AccessToken: string;
  RefreshToken: string;
  IdToken: string;
  User: UserDto | AgentDto;

  @ApiProperty({ type: 'string', enum: ChallengeNameType })
  ChallengeName?: ChallengeNameType;

  @ApiProperty({ type: 'string' })
  Session?: string;
}

export class RespondToAuthChallengeDto {
  @ApiProperty({ enum: ChallengeNameType })
  @IsEnum(ChallengeNameType)
  ChallengeName: ChallengeNameType;

  @ApiProperty()
  @IsString()
  Session: string;

  @ApiProperty()
  @IsObject()
  data: LoginCredentialsDto;
}
