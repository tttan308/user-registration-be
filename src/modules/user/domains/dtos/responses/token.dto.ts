import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

import { EmailFieldOptional, NumberField } from '../../../../../decorators';
import { UserRequest } from '../requests/user.dto';

export class TokenPayload {
  accessToken!: string;

  refreshToken!: string;

  user!: UserRequest;
}

export class DecodedToken {
  @ApiProperty({
    example: 'b0535d19-a172-4f66-acff-ce6b28c369d2',
    description: 'User id',
  })
  @IsUUID('4', { message: 'Invalid UUID' })
  id!: string;

  @ApiProperty({
    example: 'tantran.300803@gmail.com',
    description: 'User email',
  })
  @EmailFieldOptional({ nullable: true })
  email!: string;

  @ApiProperty({
    example: 1_632_997_200,
    description: 'Issued at',
  })
  @NumberField()
  iat!: number;

  @ApiProperty({
    example: 1_632_997_200,
    description: 'Issued at',
  })
  @NumberField()
  exp!: number;
}
