import {
  Configuration,
  GetOrganizationRequest,
  GetSubscriptionEventRequest,
  ListSubscriptionEventsRequest,
  OrganizationOrganizationModel,
  OrganizationsOrganizationApi,
  SubscriptionEventsOrganizationApi,
  UpdateOrganizationRequest,
} from '@cybrid/cybrid-api-organization-typescript';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { lastValueFrom } from 'rxjs';
import { CybridException } from '../cybrid.exception';
import { IOrganizationService } from '../cybrid.interface';

@Injectable()
export class OrganizationAdaptor implements IOrganizationService {
  // Cybrid token data
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
  private readonly organizationApiUrl: string = this.configService.get('cybrid.organizationApiUrl');

  // axios
  private readonly idApi: AxiosInstance = axios.create();
  private readonly bankApi: AxiosInstance = axios.create();

  // Cybrid APIs
  private organizationApi: OrganizationsOrganizationApi;
  private subscriptionEventsApi: SubscriptionEventsOrganizationApi;

  // =====================================
  //          ✨ constructor
  // =====================================
  // 👇 env
  constructor(private readonly configService: ConfigService) {
    this.useOrganizationApi();
    this.useSubscriptionEventsApi();
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
      basePath: this.organizationApiUrl,
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

  private async useOrganizationApi() {
    const config = await this.getConfiguration(['organizations:read', 'organizations:write']);
    this.organizationApi = new OrganizationsOrganizationApi(config);
  }

  private async useSubscriptionEventsApi() {
    const config = await this.getConfiguration();
    this.subscriptionEventsApi = new SubscriptionEventsOrganizationApi(config);
  }

  // =====================================
  //          👇 Public methods
  // =====================================

  // =====================================
  //          ☣️ Organization API
  // =====================================

  async getOrganization(
    getOrganizationRequest: GetOrganizationRequest,
  ): Promise<OrganizationOrganizationModel> {
    try {
      return lastValueFrom(this.organizationApi.getOrganization(getOrganizationRequest));
    } catch (error) {
      CybridException(error);
    }
  }

  async updateOrganization(
    updateOrganizationRequest: UpdateOrganizationRequest,
  ): Promise<OrganizationOrganizationModel> {
    try {
      return lastValueFrom(this.organizationApi.updateOrganization(updateOrganizationRequest));
    } catch (error) {
      CybridException(error);
    }
  }

  // =====================================
  //          🎬 Subscription Events API
  // =====================================
  getSubscriptionEvent(getSubscriptionEventRequest: GetSubscriptionEventRequest) {
    try {
      return lastValueFrom(
        this.subscriptionEventsApi.getSubscriptionEvent(getSubscriptionEventRequest),
      );
    } catch (error) {
      CybridException(error);
    }
  }
  listSubscriptionEvents(listSubscriptionEventsRequest: ListSubscriptionEventsRequest) {
    try {
      return lastValueFrom(
        this.subscriptionEventsApi.listSubscriptionEvents(listSubscriptionEventsRequest),
      );
    } catch (error) {
      CybridException(error);
    }
  }
}
