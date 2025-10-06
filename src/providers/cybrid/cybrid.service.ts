import { Injectable } from '@nestjs/common';
import { BankAdaptor } from './adaptors/cybrid.bank.adaptor';
import { OrganizationAdaptor } from './adaptors/cybrid.organization.adaptor';

@Injectable()
export class CybridService {
  constructor(
    readonly organizationAdaptor: OrganizationAdaptor,
    readonly bankAdaptor: BankAdaptor,
  ) {}
}
