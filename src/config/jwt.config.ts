import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJWTconfig = async (configService: ConfigService): Promise<JwtModuleOptions> => {
  const secret = configService.get('JWT_SECRET');
  if (!secret) {
    throw new Error('JWT_SECRET не определен в переменных окружения');
  }
  return {
    secret,
  };
};
