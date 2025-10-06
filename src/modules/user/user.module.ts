import { AuthModule } from '@module/auth/auth.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBusinessEntity } from './entities/business.entity';
import { UserEntity } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([UserEntity, UserBusinessEntity])],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
