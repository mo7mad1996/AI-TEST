import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { environmentConfig } from '@config/environment.config';
import { datasourceOptions } from '@config/orm.config';
import { CognitoModule } from '@/providers/cognito/cognito.module';
import { CybridModule } from '@/providers/cybrid/cybrid.module';
// modules
import { AgentModule } from './agent/agent.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    // to allow environment variables in any module
    ConfigModule.forRoot({
      load: [environmentConfig],
      isGlobal: true,
    }),

    // database
    TypeOrmModule.forRootAsync({
      // Database configurations
      useFactory: () => ({
        ...datasourceOptions,
        autoLoadEntities: true,
      }),

      // connect to Database
      dataSourceFactory: async (options) => {
        try {
          const dataSource = new DataSource(options);

          // Prevent adding the same data source more than once
          if (!DataSource.hasOwnProperty('isInitialized') || !dataSource.isInitialized) {
            await dataSource.initialize();
            addTransactionalDataSource(dataSource);

            console.info('👌 Database connection established');

            return dataSource;
          }
        } catch (error) {
          console.error('❌ Database connection failed:', error);
          process.exit(1); // stop the app
        }
      },
    }),

    // application modules
    AuthModule,
    UserModule,
    AgentModule,

    // Providers
    CognitoModule,
    CybridModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
