export const environmentConfig = () => ({
  environment: process.env.NODE_ENV,

  frontend: { url: process.env.FRONTEND_URL },
  server: { port: Number(process.env.PORT) },

  admin: {
    email: process.env.ADMIN_EMAIL,
    TemporaryPassword: process.env.COGNITO_TEMPORARY_PASSWORD,
  },

  // providers
  cognito: {
    region: process.env.COGNITO_REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID,
    clientSecret: process.env.COGNITO_CLIENT_SECRET,
    endpoint: process.env.COGNITO_ENDPOINT,
  },
  cybrid: {
    clientId: process.env.CYBRID_CLIENT_ID,
    clientSecret: process.env.CYBRID_CLIENT_SECRET,

    // URLs
    idApiUrl: process.env.CYBRID_ID_API_URL,
    bankApiUrl: process.env.CYBRID_BANK_API_URL,
    organizationApiUrl: process.env.CYBRID_ORGANIZATION_API_URL,

    webhookSecret: process.env.CYBRID_WEBHOOK_SECRET,
    externalWalletId: process.env.CYBRID_EXTERNAL_WALLET_GUID,
  },
});
