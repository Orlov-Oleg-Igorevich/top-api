import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';

export const getMongoConfig = async (
  configService: ConfigService,
): Promise<MongooseModuleFactoryOptions> => {
  return {
    uri: getMongoString(configService),
    ...getMongoOptions(configService),
  };
};

const getMongoString = (configService: ConfigService): string =>
  // mongodb://admin:admin@localhost:27018/top-api?authSource=admin
  'mongodb://' +
  configService.get('MONGO_LOGIN') +
  ':' +
  configService.get('MONGO_PASSWORD') +
  '@' +
  configService.get('MONGO_HOST') +
  ':' +
  configService.get('MONGO_PORT') +
  '/' +
  configService.get('MONGO_DATABASE');

const getMongoOptions = (configService: ConfigService): object => {
  return {
    authSource: configService.get('MONGO_AUTH_DATABASE'),
  };
};
