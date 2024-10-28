import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { generateHash, handleError, validateHash } from '../../../common/utils';
import { RefreshTokenBody } from '../domains/dtos/requests/refresh-token.dto';
import { UserRequest } from '../domains/dtos/requests/user.dto';
import {
  DecodedToken,
  TokenPayload,
} from '../domains/dtos/responses/token.dto';
import { UserResponse } from '../domains/dtos/responses/user-response.dto';
import { RefreshTokenEntity } from '../domains/entities/refresh-token.entity';
import { UserRepository } from '../repository/user.repository';

export interface IUserService {
  handleLogin(user: UserRequest): Promise<TokenPayload>;
  handleRegister(user: UserRequest): Promise<UserResponse>;
  handleLogout(refreshToken: RefreshTokenBody): Promise<RefreshTokenEntity>;
  // renewToken(
  //   refreshToken: RefreshTokenBody,
  // ): Promise<TokenPayload | RenewTokenResponse>;
}

@Injectable()
export class UserService implements IUserService {
  public logger: Logger;

  constructor(
    public configService: ConfigService,
    @Inject('IUserRepository')
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {
    this.logger = new Logger(UserService.name);
  }

  public async handleLogin(userRequest: UserRequest) {
    try {
      if (!userRequest.email) {
        throw new BadRequestException('Email is required');
      }

      const user = await this.userRepository.findUserByEmail(userRequest.email);

      if (!user) {
        throw new NotFoundException('User is not found');
      }

      const isCorrectPassword = validateHash(
        userRequest.password!,
        user.password,
      );

      if (!isCorrectPassword) {
        throw new BadRequestException('Password is incorrect');
      }

      const refreshToken = await this.signRefreshToken(userRequest);

      const tokenPayload: TokenPayload = {
        accessToken: this.jwtService.sign({
          email: userRequest.email,
          id: user.id,
        }),
        refreshToken,
        user: userRequest,
      };

      return tokenPayload;
    } catch (error) {
      throw handleError(this.logger, error);
    }
  }

  async handleLogout(refreshToken: RefreshTokenBody) {
    try {
      const removeToken = await this.userRepository.removeRefreshToken(
        refreshToken.token,
      );

      return removeToken;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  // async renewToken(refreshToken: RefreshTokenBody) {
  //   try {
  //     const secretKey =
  //       this.configService.get<string>('JWT_REFRESH_SECRET') ??
  //       'default_token_key';
  //     const decoded: DecodedToken = this.jwtService.verify(refreshToken.token, {
  //       secret: secretKey,
  //     });
  //     const userResponse: UserResponse = {
  //       id: decoded.id,
  //       email: decoded.email,
  //       fullName: decoded.fullName,
  //       role:
  //         decoded.role === RoleType.USER.toString()
  //           ? RoleType.USER
  //           : RoleType.ADMIN,
  //     };

  //     const isTokenExisted = await this.authRepository.isTokenExist(
  //       userResponse.id,
  //       refreshToken.token,
  //     );

  //     if (!isTokenExisted) {
  //       const renewTokenResponse: RenewTokenResponse = {
  //         message: `Token was used`,
  //       };

  //       return renewTokenResponse;
  //     }

  //     const [newRefreshToken] = await Promise.all([
  //       this.signRefreshToken(userResponse),
  //       this.authRepository.removeRefreshToken(
  //         userResponse.id,
  //         refreshToken.token,
  //       ),
  //     ]);

  //     const tokenPayload: TokenPayload = {
  //       accessToken: this.jwtService.sign(userResponse),
  //       refreshToken: newRefreshToken,
  //       user: userResponse,
  //     };

  //     return tokenPayload;
  //   } catch (error) {
  //     this.logger.error(error);

  //     throw error;
  //   }
  // }

  async signRefreshToken(userRequest: UserRequest) {
    try {
      if (!userRequest.email) {
        throw new BadRequestException('Email is required');
      }

      const user = await this.userRepository.findUserByEmail(userRequest.email);

      if (!user) {
        throw new NotFoundException('User is not found');
      }

      const refreshToken: string = this.jwtService.sign(
        { email: userRequest.email, id: user.id },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRED'),
        },
      );

      const decodedToken: DecodedToken = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      await this.userRepository.saveRefreshToken(
        user.id,
        refreshToken,
        decodedToken,
      );

      return refreshToken;
    } catch (error) {
      throw handleError(this.logger, error);
    }
  }

  async handleRegister(userRequest: UserRequest) {
    try {
      if (!userRequest.email) {
        throw new BadRequestException('Email is required');
      }

      const existedUser = await this.userRepository.findUserByEmail(
        userRequest.email,
      );

      if (existedUser) {
        throw new BadRequestException('Email is already existed');
      }

      if (!userRequest.password) {
        throw new BadRequestException('Password is required');
      }

      const hashedPassword = generateHash(userRequest.password);

      const user = await this.userRepository.createUser({
        ...userRequest,
        password: hashedPassword,
      });

      return user;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
