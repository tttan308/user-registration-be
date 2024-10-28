import { AbstractDto } from '../../../../../common/dto/abstract.dto';
import { EmailFieldOptional } from '../../../../../decorators';
import { type UserEntity } from '../../entities/user.entity';

export type UserDtoOptions = Partial<{ isActive: boolean }>;

export class UserDto extends AbstractDto {
  @EmailFieldOptional({ nullable: true })
  email?: string | null;

  constructor(user: UserEntity) {
    super(user);
  }
}
