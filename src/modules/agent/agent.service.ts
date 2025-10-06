import { UserListDto } from '@module/user/dto/user.dto';
import { UserEntity } from '@module/user/entities/user.entity';
import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentRole } from '@base/base.enum';
import { BasePageQueryParamsDto } from '@base/dto/page-query-params.dto';
import {
  IDENTITY_PROVIDER_KEY,
  IIdentityProviderService,
} from '@/providers/cognito/cognito.interface';
import { AgentListDto } from './dto/agent.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AgentEntity } from './entities/agent.entity';

@Injectable()
export class AgentService {
  constructor(
    // 👇 Auth Providers
    @Inject(IDENTITY_PROVIDER_KEY)
    private readonly authProvider: IIdentityProviderService,

    // 👇 databases
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    // 👇 env
    private readonly configService: ConfigService,
  ) {
    this.createInitAdmin();
  }

  async createInitAdmin() {
    const email = this.configService.get('admin.email');
    const password = this.configService.get('admin.TemporaryPassword');
    const exists = await this.agentRepository.findOne({ where: { email } });

    if (exists) return;

    await this.createAgent(
      {
        email,
        role: [AgentRole.ADMIN, AgentRole.AGENT],
      },
      true,
    );
    console.info('Admin created with email:', { email, password });
  }

  // confirm user
  async adminConfirmUser(email: string) {
    return await this.authProvider.adminConfirmUser(email);
  }

  // get users
  async get_all_users(q: BasePageQueryParamsDto): Promise<UserListDto> {
    const [data, total] = await this.userRepository.findAndCount({
      skip: q.offset,
      take: q.per_page,
    });

    return {
      page: q.page,
      per_page: q.per_page,
      pagesCount: q.pageCount(total),
      total,
      objects: data,
    };
  }

  // get agents
  async getAllAgents(q: BasePageQueryParamsDto): Promise<AgentListDto> {
    try {
      const [data, total] = await this.agentRepository.findAndCount({
        skip: q.offset,
        take: q.per_page,
      });

      return {
        page: q.page,
        per_page: q.per_page,
        pagesCount: q.pageCount(total),
        total,
        objects: data,
      };
    } catch (err: any) {
      throw new ForbiddenException(err.message);
    }
  }

  // create a new agent
  async createAgent(data: CreateAgentDto, skip: boolean = false): Promise<AgentEntity> {
    try {
      // check in database if exists
      const existingAgent = await this.agentRepository.exists({ where: { email: data.email } });
      if (existingAgent) throw new BadRequestException('Agent already exists');

      // create cognito user
      const { User } = await this.authProvider.createAgentUser(data.email, skip);

      // save in database
      const db_agent = this.agentRepository.create({
        ...data,
        authProviderId: User.Username,
      });
      if (!db_agent) throw new ForbiddenException('can not create Agent!');

      await db_agent.save();
      return db_agent;
    } catch (err: any) {
      throw new ForbiddenException(err.message);
    }
  }

  // logout for user
  async logoutForUser(email: string) {
    return await this.authProvider.logoutForUser(email);
  }
}
