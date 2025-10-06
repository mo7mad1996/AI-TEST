import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IDENTITY_PROVIDER_KEY } from '@/providers/cognito/cognito.interface';
import { CognitoAdaptor } from './cognito.adapter';

@Global()
@Module({
  providers: [
    {
      provide: IDENTITY_PROVIDER_KEY,
      useClass: CognitoAdaptor,
    },
    {
      provide: CognitoIdentityProviderClient,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new CognitoIdentityProviderClient({
          endpoint: configService.get<string>('cognito.endpoint'),
          region: configService.get<string>('cognito.region'),
        }),
    },
  ],
  exports: [IDENTITY_PROVIDER_KEY],
})
export class CognitoModule {}
