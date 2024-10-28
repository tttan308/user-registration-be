import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { PublicRoute } from '../../../decorators';
import { UserRequest } from '../domains/dtos/requests/user.dto';
import { IUserService } from '../services/user.service';

@Controller('/user')
@ApiTags('user')
export class UserController {
  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
  ) {}

  @Post('/login')
  @ApiOperation({ summary: 'Login' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Login success',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Login failed',
  })
  @PublicRoute(true)
  async login(@Body() user: UserRequest, @Res() res: Response) {
    try {
      const tokenPayload = await this.userService.handleLogin(user);

      return res.status(HttpStatus.CREATED).json(tokenPayload);
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json(error);
    }
  }

  @Post('/register')
  @ApiOperation({ summary: 'Register' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Register success',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Register failed',
  })
  @PublicRoute(true)
  async register(@Body() userRequest: UserRequest, @Res() res: Response) {
    try {
      const user = await this.userService.handleRegister(userRequest);

      return res.status(HttpStatus.CREATED).json(user);
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json(error);
    }
  }
}
