import { ListBanksRequest } from '@cybrid/cybrid-api-bank-typescript';
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { BANK_PROVIDER_SERVICE_KEY } from './cybrid.interface';
import { CybridService } from './cybrid.service';

@Controller('cybrid')
export class CybridController {
  constructor(
    @Inject(BANK_PROVIDER_SERVICE_KEY)
    private readonly cybridService: CybridService,
  ) {}

  @Get('banks')
  listBanks(@Query() query: ListBanksRequest) {
    return this.cybridService.bankAdaptor.listBanks(query);
  }
}
