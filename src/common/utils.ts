import {
  HttpException,
  InternalServerErrorException,
  type Logger,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';

/**
 * generate hash from password or string
 * @param {string} password
 * @returns {string}
 */
export function generateHash(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * validate text with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export function validateHash(
  password: string | undefined,
  hash: string | undefined | null,
): boolean {
  if (!password || !hash) {
    return false;
  }

  return bcrypt.compareSync(password, hash);
}

export function getVariableName<TResult>(
  getVar: () => TResult,
): string | undefined {
  const m = /\(\)=>(.*)/.exec(
    getVar.toString().replaceAll(/(\r\n|\n|\r|\s)/gm, ''),
  );

  if (!m) {
    throw new Error(
      `The function does not contain a statement matching return variableName;`,
    );
  }

  const fullMemberName = m[1];

  const memberParts = fullMemberName.split('.');

  return memberParts[-1];
}

export function handleError(logger: Logger, error: unknown): HttpException {
  logger.error(error);

  if (error instanceof HttpException) {
    throw error;
  }

  throw new InternalServerErrorException(error);
}

export function removeDuplicateSpace(q: string): string {
  return q.trim().replaceAll(/\s+/g, ' ');
}
