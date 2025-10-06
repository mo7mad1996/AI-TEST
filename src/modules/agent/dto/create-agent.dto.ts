import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { AgentRole } from '@base/base.enum';

export class CreateAgentDto {
  @ApiProperty()
  @IsOptional()
  name?: string = '';

  @ApiProperty({ format: 'email', required: true })
  @IsString()
  email: string;

  @ApiProperty({ enum: AgentRole, isArray: true })
  @IsArray()
  @IsEnum(AgentRole, { each: true })
  role: AgentRole[];

  @ApiPropertyOptional()
  @IsOptional()
  enabled?: boolean = true;
}
