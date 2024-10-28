import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../../../../common/abstract.entity';
import { UseDto } from '../../../../decorators';
import { UserDto, type UserDtoOptions } from '../dtos/responses/user.dto';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto, UserDtoOptions> {
  @Column({ unique: true, nullable: true, type: 'varchar' })
  email!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  password!: string | null;
}
