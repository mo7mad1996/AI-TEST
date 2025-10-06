import { AuthModule } from '@module/auth/auth.module';
import { UserEntity } from '@module/user/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { AgentEntity } from './entities/agent.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([AgentEntity, UserEntity])],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
