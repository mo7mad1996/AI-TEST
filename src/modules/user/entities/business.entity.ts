import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '@base/base.entity';
import { BusinessPosition } from '@base/base.enum';
import { UserEntity } from './user.entity';

@Entity('users-business-info')
export class UserBusinessEntity extends BaseEntity {
  @OneToOne(() => UserEntity, (user) => user.businessInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: BusinessPosition })
  position: BusinessPosition;

  // address
  @Column()
  region: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  postcode: string;

  @Column()
  industry: string;

  @Column({ nullable: true })
  website: string;

  @Column()
  size: string;
}
