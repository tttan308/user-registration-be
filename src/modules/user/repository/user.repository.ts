import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserRequest } from '../domains/dtos/requests/user.dto';
import { DecodedToken } from '../domains/dtos/responses/token.dto';
import { RefreshTokenEntity } from '../domains/entities/refresh-token.entity';
import { UserEntity } from '../domains/entities/user.entity';

export interface IUserRepository {
  saveRefreshToken(
    userId: string,
    refreshToken: string,
    decodedToken: DecodedToken,
  ): Promise<RefreshTokenEntity>;
  findUserByEmail(email: string): Promise<UserEntity | null>;
  createUser(user: UserRequest): Promise<UserEntity | null>;
  removeRefreshToken(token: string): Promise<RefreshTokenEntity>;
  isTokenExist(userId: string, refreshToken: string): Promise<boolean>;
}

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly tokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async saveRefreshToken(
    userId: string,
    refreshToken: string,
    decodedToken: DecodedToken,
  ): Promise<RefreshTokenEntity> {
    const createToken = {
      token: refreshToken,
      iat: new Date(decodedToken.iat * 1000),
      exp: new Date(decodedToken.exp * 1000),
      userId,
    };

    const tokenEntity = this.tokenRepository.create(createToken);

    await this.tokenRepository.save(tokenEntity);

    return tokenEntity;
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    return user || null;
  }

  async createUser(user: UserRequest): Promise<UserEntity> {
    const createdAt = new Date();
    const newUser = this.userRepository.create({
      ...user,
      createdAt,
    });

    await this.userRepository.save(newUser);

    return newUser;
  }

  async removeRefreshToken(token: string): Promise<RefreshTokenEntity> {
    const refreshToken = await this.tokenRepository.findOne({
      where: { token },
    });

    if (!refreshToken) {
      throw new NotFoundException('Token not found');
    }

    await this.tokenRepository.remove(refreshToken);

    return refreshToken;
  }

  async isTokenExist(userId: string, refreshToken: string): Promise<boolean> {
    const token = await this.tokenRepository.findOne({
      where: { userId, token: refreshToken },
    });

    return Boolean(token);
  }
}
