import { UserDto } from '@module/user/dto/user.dto';
import { BeforeUpdate, Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '@base/base.entity';
import { AppType, RegularRoles } from '@base/base.enum';
import { UserBusinessEntity } from './business.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  // ids
  @Column({ nullable: true })
  authProviderId: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ unique: true, nullable: true })
  phone_number: string;

  @Column({ default: false, type: 'bool' })
  confirmationEmail: boolean;

  @Column({ default: false, type: 'bool' })
  confirmationPhone: boolean;

  // name
  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ nullable: true })
  lastName: string;

  get fullName() {
    return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(' ');
  }

  // dob
  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  // address
  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  postcode: string;

  // account types
  @Column({ type: 'enum', enum: AppType, default: AppType.REGULAR })
  type: AppType;

  @Column({ type: 'enum', enum: RegularRoles, default: RegularRoles.INDIVIDUAL })
  role: RegularRoles;

  @OneToOne(() => UserBusinessEntity, (businessInfo) => businessInfo.user, { nullable: true })
  businessInfo: UserBusinessEntity;

  // =============================
  // ---------- methods ----------
  // =============================
  async setConfirmationEmail(newValue: boolean) {
    this.confirmationEmail = newValue;
    await this.save();
    return this;
  }
  async setConfirmationPhone(newValue: boolean) {
    this.confirmationPhone = newValue;

    await this.save();
    return this;
  }

  // watch data changes
  private previousEmail: string;
  private previousPhone: string;

  @BeforeUpdate()
  checkChanges() {
    if (this.previousEmail && this.previousEmail !== this.email) this.confirmationEmail = false;
    if (this.previousPhone && this.previousPhone !== this.phone_number)
      this.confirmationPhone = false;
  }

  afterLoad() {
    // store old values when entity is loaded
    this.previousEmail = this.email;
    this.previousPhone = this.phone_number;
  }
}
