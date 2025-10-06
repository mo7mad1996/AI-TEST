import {
  AccountBankModel,
  AccountsBankApi,
  AssetListBankModel,
  AssetsBankApi,
  BankBankModel,
  BankListBankModel,
  BanksBankApi,
  CounterpartiesBankApi,
  CounterpartyBankModel,
  CounterpartyListBankModel,
  CreateAccountRequest,
  CreateBankRequest,
  CreateCounterpartyRequest,
  CreateCustomerRequest,
  CreateQuoteRequest,
  CustomerBankModel,
  CustomerListBankModel,
  CustomersBankApi,
  GetAccountRequest,
  GetQuoteRequest,
  ListAccountsRequest,
  ListAssetsRequest,
  ListBanksRequest,
  ListCounterpartiesRequest,
  ListCustomersRequest,
  QuoteBankModel,
  QuotesBankApi,
  SymbolsBankApi,
  UpdateBankRequest,
  UpdateCustomerRequest,
} from '@cybrid/cybrid-api-bank-typescript';
import { Configuration } from '@cybrid/cybrid-api-bank-typescript';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { lastValueFrom } from 'rxjs';
import { CybridException } from '../cybrid.exception';

@Injectable()
export class BankAdaptor {
  // token
  private readonly tokens: {
    [scope: string]: {
      accessToken: string;
      expiresIn: number;
    };
  } = {};

  // client credentials
  private readonly clientId: string = this.configService.get('cybrid.clientId');
  private readonly clientSecret: string = this.configService.get('cybrid.clientSecret');

  // global urls
  private readonly idApiUrl: string = this.configService.get('cybrid.idApiUrl');
  private readonly bankApiUrl: string = this.configService.get('cybrid.bankApiUrl');

  // axios
  private readonly idApi: AxiosInstance = axios.create();
  private readonly bankApi: AxiosInstance = axios.create();

  // Cybrid API
  private cybridBankApi: BanksBankApi;
  private cybridCustomersApi: CustomersBankApi;
  private cybridSymbolsApi: SymbolsBankApi;
  private cybridAssetsApi: AssetsBankApi;
  private cybridAccountsApi: AccountsBankApi;
  private cybridQuotesApi: QuotesBankApi;
  private counterpartiesApi: CounterpartiesBankApi;

  // =====================================
  //          ✨ constructor
  // =====================================
  // 👇 env
  constructor(private readonly configService: ConfigService) {
    // init apis
    this.useBankApi();
    this.useCustomersApi();
    this.useSymbolsApi();
    this.useAssetsApi();
    this.useAccountsApi();
    this.useQuotesApi();
    this.useCounterpartiesApi();
  }

  // =====================================
  //          👍 Helper methods
  // =====================================
  private async getAccessToken(scope: string): Promise<string> {
    try {
      if (this.tokens[scope] && this.tokens[scope].expiresIn > Date.now())
        return this.tokens[scope].accessToken;

      // body
      const body = {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope,
      };

      // get access token
      const response = await this.useIDApi().post('/oauth/token', body);
      const { access_token, expires_in, token_type, created_at } = response.data;

      // calculate expiration
      this.tokens[scope] = {
        accessToken: [token_type, access_token].join(' '),
        expiresIn: (created_at + expires_in) * 1000,
      };

      // set data
      return this.tokens[scope].accessToken;
    } catch (e: any) {
      console.error(e.response?.data || e || e.message || e, { scope });
      console.error('Cybrid get access token error');
    }
  }

  // 🔑 to get access token
  private useIDApi(): AxiosInstance {
    this.idApi.defaults.baseURL = this.idApiUrl;
    this.idApi.defaults.headers.common['Content-Type'] = 'application/json';
    this.bankApi.defaults.headers.common['accept-version'] = '2025-06-01';
    // don't use access token here

    return this.idApi;
  }

  private async getConfiguration(scope: string[] | undefined = undefined) {
    const accessToken = scope ? await this.getAccessToken(scope.join(' ')) : undefined;

    const config = new Configuration({
      basePath: this.bankApiUrl,
      accessToken,
      middleware: [
        {
          pre: (req) => {
            // @ts-ignore
            req.headers['accept-version'] = '2025-06-01';
            // @ts-ignore
            req.headers['Authorization'] = accessToken;

            return req;
          },
        },
      ],
    });

    return config;
  }
  /****************
   *   * ids *
   ***************/
  // bankApi
  private async useBankApi() {
    const config = await this.getConfiguration(['banks:read', 'banks:write', 'banks:execute']);

    this.cybridBankApi = new BanksBankApi(config);
  }
  // customersApi
  private async useCustomersApi() {
    const config = await this.getConfiguration([
      'customers:read',
      'customers:write',
      'customers:execute',
    ]);
    this.cybridCustomersApi = new CustomersBankApi(config);
  }
  private async useSymbolsApi() {
    const config = await this.getConfiguration(['prices:read']);
    this.cybridSymbolsApi = new SymbolsBankApi(config);
  }

  private async useAssetsApi() {
    const config = await this.getConfiguration();
    this.cybridAssetsApi = new AssetsBankApi(config);
  }

  private async useAccountsApi() {
    const config = await this.getConfiguration(['Accounts:read', 'Accounts:execute']);
    this.cybridAccountsApi = new AccountsBankApi(config);
  }

  private async useQuotesApi() {
    const config = await this.getConfiguration(['Quotes:read', 'Quotes:execute']);
    this.cybridQuotesApi = new QuotesBankApi(config);
  }

  private async useCounterpartiesApi() {
    const config = await this.getConfiguration(['counterparties:read', ' counterparties:execute']);
    this.counterpartiesApi = new CounterpartiesBankApi(config);
  }

  // =====================================
  //          👇 Public methods
  // =====================================
  // =====================================
  //          🏦 Bank Api
  // =====================================

  createBank(createBankRequest: CreateBankRequest): Promise<BankBankModel> {
    try {
      return lastValueFrom(this.cybridBankApi.createBank(createBankRequest));
    } catch (error) {
      CybridException(error);
    }
  }

  listBanks(listBanksRequest: ListBanksRequest): Promise<BankListBankModel> {
    try {
      console.log(this.cybridBankApi);
      return lastValueFrom(this.cybridBankApi.listBanks(listBanksRequest));
    } catch (error) {
      CybridException(error);
    }
  }

  getBank(bankGuid: string): Promise<BankBankModel> {
    try {
      return lastValueFrom(this.cybridBankApi.getBank({ bankGuid }));
    } catch (error) {
      CybridException(error);
    }
  }

  editBank(updateBankRequest: UpdateBankRequest): Promise<BankBankModel> {
    try {
      return lastValueFrom(this.cybridBankApi.updateBank(updateBankRequest));
    } catch (error) {
      CybridException(error);
    }
  }

  // =====================================
  //          🙍 customer Api
  // =====================================
  createCustomer(createCustomerRequest: CreateCustomerRequest): Promise<CustomerBankModel> {
    try {
      return lastValueFrom(this.cybridCustomersApi.createCustomer(createCustomerRequest));
    } catch (error) {
      CybridException(error);
    }
  }
  listCustomers(listCustomersRequest: ListCustomersRequest): Promise<CustomerListBankModel> {
    try {
      return lastValueFrom(this.cybridCustomersApi.listCustomers(listCustomersRequest));
    } catch (error) {
      CybridException(error);
    }
  }
  getCustomer(customerGuid: string): Promise<CustomerBankModel> {
    try {
      return lastValueFrom(this.cybridCustomersApi.getCustomer({ customerGuid }));
    } catch (error) {
      CybridException(error);
    }
  }
  editCustomer(updateCustomerRequest: UpdateCustomerRequest): Promise<CustomerBankModel> {
    try {
      return lastValueFrom(this.cybridCustomersApi.updateCustomer(updateCustomerRequest));
    } catch (error) {
      CybridException(error);
    }
  }

  // =====================================
  //          💱 Symbols Api
  // =====================================
  listSymbols(): Promise<string[]> {
    try {
      return lastValueFrom(this.cybridSymbolsApi.listSymbols());
    } catch (error) {
      CybridException(error);
    }
  }
  // =====================================
  //          🪙 Assets Api
  // =====================================
  listAssets(listAssetsRequest: ListAssetsRequest): Promise<AssetListBankModel> {
    try {
      return lastValueFrom(this.cybridAssetsApi.listAssets(listAssetsRequest));
    } catch (error) {
      CybridException(error);
    }
  }

  // =====================================
  //          💲 Accounts Api
  // =====================================
  createAccount(createAccountRequest: CreateAccountRequest): Promise<AccountBankModel> {
    try {
      return lastValueFrom(this.cybridAccountsApi.createAccount(createAccountRequest));
    } catch (error) {
      CybridException(error);
    }
  }
  listAccounts(listAccountsRequest: ListAccountsRequest): Promise<ListAccountsRequest> {
    try {
      return lastValueFrom(this.cybridAccountsApi.listAccounts(listAccountsRequest));
    } catch (error) {
      CybridException(error);
    }
  }
  getAccount(getAccountRequest: GetAccountRequest): Promise<AccountBankModel> {
    try {
      return lastValueFrom(this.cybridAccountsApi.getAccount(getAccountRequest));
    } catch (error) {
      CybridException(error);
    }
  }

  // =====================================
  //          📈 Quotes Api
  // =====================================
  createQuote(createQuoteRequest: CreateQuoteRequest): Promise<QuoteBankModel> {
    try {
      return lastValueFrom(this.cybridQuotesApi.createQuote(createQuoteRequest));
    } catch (error) {
      CybridException(error);
    }
  }
  listQuotes(listQuotesRequest: ListAccountsRequest): Promise<ListAccountsRequest> {
    try {
      return lastValueFrom(this.cybridQuotesApi.listQuotes(listQuotesRequest));
    } catch (error) {
      CybridException(error);
    }
  }
  getQuote(getQuoteRequest: GetQuoteRequest): Promise<QuoteBankModel> {
    try {
      return lastValueFrom(this.cybridQuotesApi.getQuote(getQuoteRequest));
    } catch (error) {
      CybridException(error);
    }
  }

  // =====================================
  //        👥 Counterparties Api
  // =====================================
  createCounterparty(
    createCounterpartyRequest: CreateCounterpartyRequest,
  ): Promise<CounterpartyBankModel> {
    try {
      return lastValueFrom(this.counterpartiesApi.createCounterparty(createCounterpartyRequest));
    } catch (error) {
      CybridException(error);
    }
  }
  listCounterparties(
    listCounterpartiesRequest: ListCounterpartiesRequest,
  ): Promise<CounterpartyListBankModel> {
    try {
      return lastValueFrom(this.counterpartiesApi.listCounterparties(listCounterpartiesRequest));
    } catch (error) {
      CybridException(error);
    }
  }
  getCounterparty(counterpartyGuid: string): Promise<CounterpartyBankModel> {
    try {
      return lastValueFrom(this.counterpartiesApi.getCounterparty({ counterpartyGuid }));
    } catch (error) {
      CybridException(error);
    }
  }
}
