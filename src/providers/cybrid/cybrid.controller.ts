import { ListBanksRequest } from '@cybrid/cybrid-api-bank-typescript';
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { BANK_PROVIDER_SERVICE_KEY } from './cybrid.interface';
import { CybridService } from './cybrid.service';

@Controller('cybrid')
export class CybridController {
  constructor(
    @Inject(BANK_PROVIDER_SERVICE_KEY)
    private readonly cybridService: CybridService,
  ) {}

  @Get('banks')
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    type: String,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'guid',
    required: false,
    type: String,
    description: 'Bank GUID',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Bank name',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Bank type',
  })
  listBanks(@Query() query: ListBanksRequest) {
    return this.cybridService.bankAdaptor.listBanks(query);
  }
}
