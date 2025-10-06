import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@base/base.entity';
import { AgentRole, AppType } from '@base/base.enum';

@Entity('agents')
export class AgentEntity extends BaseEntity {
  // ids
  @Column({ unique: true })
  authProviderId: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'bool', default: true })
  enabled: boolean;

  @Column({ type: 'enum', enum: AppType, default: AppType.AGENT })
  type: AppType;

  @Column({ array: true, type: 'enum', enum: AgentRole, default: [] })
  role: AgentRole[];
}
