import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { Response } from 'express';

import { PublicRoute } from '../../../decorators';
import { RefreshTokenBody } from '../domains/dtos/requests/refresh-token.dto';
import { UserRequest } from '../domains/dtos/requests/user.dto';
import {
  LogOutResponse,
  RenewTokenResponse,
} from '../domains/dtos/responses/logout.dto';
import { TokenPayload } from '../domains/dtos/responses/token.dto';
import { RefreshTokenEntity } from '../domains/entities/refresh-token.entity';
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

  @Post('/logout')
  @ApiOperation({ summary: 'Logout' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Logout success',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Logout failed',
  })
  @PublicRoute(true)
  async logout(@Body() token: RefreshTokenBody, @Res() res: Response) {
    try {
      const removedToken: RefreshTokenEntity =
        await this.userService.handleLogout(token);

      const logOutResponse: LogOutResponse = {
        message: 'Logged out',
        userId: removedToken.userId,
      };

      return res.status(HttpStatus.CREATED).json(logOutResponse);
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json(error);
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Get new access token' })
  @ApiExtraModels(TokenPayload, RenewTokenResponse)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Get new access token',
    content: {
      application_json: {
        schema: {
          anyOf: refs(TokenPayload, RenewTokenResponse),
        },
      },
    },
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Get new access token failed',
  })
  @PublicRoute(true)
  async renewToken(@Body() token: RefreshTokenBody, @Res() res: Response) {
    try {
      const newPairToken = await this.userService.renewToken(token);

      return newPairToken;
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json(error);
    }
  }
}
