import { EmailDto } from '@module/user/dto/create-confirm-user-dto';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppType } from '@base/base.enum';
import { BasePageQueryParamsDto } from '@base/dto/page-query-params.dto';
import { Auth } from '@/decorators/auth.decorator';
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create-agent.dto';

@Auth(AppType.AGENT)
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @ApiOperation({
    description: 'Confirm normal user no need code',
    summary: 'CONFIRM NORMAL USER',
  })
  @Post('confirm-user')
  @HttpCode(HttpStatus.ACCEPTED)
  async active_user(@Body() body: EmailDto) {
    return await this.agentService.adminConfirmUser(body.email);
  }

  @ApiOperation({
    summary: 'FORCE LOGOUT FOR NORMAL USER',
  })
  @Delete('logoutForUser')
  logoutForUser(@Body() body: EmailDto) {
    this.agentService.logoutForUser(body.email);
  }

  @Get('users')
  async getAllUsers(@Query() query: BasePageQueryParamsDto) {
    return await this.agentService.get_all_users(query);
  }

  @ApiOperation({
    description: 'TemporaryPassword: 0000',
    summary: 'Create an Agent',
  })
  @Post('create')
  async createAgent(@Body() body: CreateAgentDto) {
    return await this.agentService.createAgent(body);
  }

  @Get('agents')
  async getAllAgents(@Query() query: BasePageQueryParamsDto) {
    return await this.agentService.getAllAgents(query);
  }
}
