import { CollectionDto } from '@base/dto/collection.dto';
import { AgentEntity } from '../entities/agent.entity';

export class AgentDto extends AgentEntity {}

export class AgentListDto extends CollectionDto(AgentDto) {}
