import { Injectable } from '@nestjs/common';
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
}
