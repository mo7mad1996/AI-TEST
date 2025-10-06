import { AuthService } from '@module/auth/auth.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBusinessInfoDto, UpdateBusinessInfoDto } from './dto/business-info.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UserBusinessEntity } from './entities/business.entity';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,

    // 👇 databases
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(UserBusinessEntity)
    private readonly userBusinessRepository: Repository<UserBusinessEntity>,
  ) {}

  async updateUser(data: UpdateUserDto, user: UserDto, token: string) {
    if (data.email && data.email !== user.email)
      await this.authService.updateUserAttributes({ email: data.email }, token);

    if (data.phone_number && data.phone_number !== user.phone_number)
      await this.authService.updateUserAttributes({ phone_number: data.phone_number }, token);

    if (data.password)
      await this.authService.changePassword(token, data.password, data.old_password);

    // remove attribute the is not in UserEntity
    delete data.password;
    delete data.old_password;

    await this.userRepository.update({ id: user.id }, data);
    return Object.assign(user, data);
    // this.userRepository.findOne({ where: { id: user.id }, relations: ['businessInfo'] });
  }

  resendCode(token: string, AttributeName: 'phone_number' | 'email') {
    return this.authService.getUserAttributeVerificationCode(token, AttributeName);
  }

  async createBusinessInfo(data: CreateBusinessInfoDto, user: UserDto) {
    const where = { user: { id: user.id } };

    const userBusiness = await this.userBusinessRepository.findOne({ where });
    if (userBusiness) throw new Error('Business info already exists try to update.');

    return this.userBusinessRepository.save({ ...data, user });
  }
  async updateBusinessInfo(data: UpdateBusinessInfoDto, user: UserDto) {
    const where = { user: { id: user.id } };

    const userBusiness = await this.userBusinessRepository.findOne({ where });
    if (!userBusiness) throw new Error('Business info not found! create one first.');

    await this.userBusinessRepository.update(where, data);
    return this.userBusinessRepository.findOne({ where });
  }

  async verifyUserAttribute(token: string, code: string, AttributeName: 'phone_number' | 'email') {
    return this.authService.verifyUserAttribute(token, code, AttributeName);
  }
}
