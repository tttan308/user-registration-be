import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('/v1/users')
@ApiTags('users')
export class UserController {}
