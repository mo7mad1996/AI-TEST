import { Global, Module } from '@nestjs/common';
import { BankAdaptor } from './adaptors/cybrid.bank.adaptor';
import { OrganizationAdaptor } from './adaptors/cybrid.organization.adaptor';
import { CybridController } from './cybrid.controller';
import { BANK_PROVIDER_SERVICE_KEY } from './cybrid.interface';
import { CybridService } from './cybrid.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      // main service
      provide: BANK_PROVIDER_SERVICE_KEY,
      useClass: CybridService,
    },

    // helper Adaptors
    OrganizationAdaptor,
    BankAdaptor,
  ],
  exports: [BANK_PROVIDER_SERVICE_KEY],
  controllers: [CybridController],
})
export class CybridModule {}
