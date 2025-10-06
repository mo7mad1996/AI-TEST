import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { StorageDriver, initializeTransactionalContext } from 'typeorm-transactional';
import * as xhr2 from 'xhr2';
import { setupApp, setupSwagger } from '@config/app.config';
import { AppModule } from './modules/app.module';

// Attach to global
(global as any).XMLHttpRequest = xhr2.XMLHttpRequest;
async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO }); // database
  const app = await NestFactory.create(AppModule, { rawBody: true }); // application

  // config Service
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: [configService.get('frontend.url')],
  });

  // Swagger
  setupApp(app); // General application config
  setupSwagger(app); // Swagger

  // run application
  await app.listen(process.env.PORT ?? 3000);
  console.info('🚀 application works on port', configService.get('server.port'));
}
bootstrap();
