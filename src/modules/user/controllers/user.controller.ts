import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Req,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { trace } from '@opentelemetry/api';
import { Request } from 'express';

import {
  createSpan,
  handleErrorSpan,
  handleOkSpan,
} from '../../../common/span-handler';
import { PublicRoute, UUIDParam } from '../../../decorators';
import { IUserService } from '../services/user.service';

const tracer = trace.getTracer('user-module');

@Controller('/v1/users')
@ApiTags('users')
export class UserController {
  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
  ) {}

  @Get('/:userId')
  @PublicRoute(true)
  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({ description: 'User found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @HttpCode(HttpStatus.OK)
  getUser(@UUIDParam('userId') id: string, @Req() req: Request) {
    const span = createSpan('Get User by Id', req.url, req.method, tracer);
    span.setAttribute('data', JSON.stringify(id));

    try {
      const user = this.userService.getUserById(id);

      handleOkSpan(span);
      span.setAttribute('result', JSON.stringify(user));

      return user;
    } catch (error) {
      handleErrorSpan(span, error);

      throw error;
    } finally {
      span.end();
    }
  }
}
