import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppType } from '@base/base.enum';

export const setupApp = (app: INestApplication) => {
  // /api/v1
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // global validations for incoming request
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
};

export const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Jaudi Core-api')
    .setDescription('Core for Jaudi mobile and web apps')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, AppType.REGULAR) // define Bearer token auth
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, AppType.AGENT)
    .build();

  // create automatic document
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  // route
  SwaggerModule.setup('/', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: true,
    },
  });
};
