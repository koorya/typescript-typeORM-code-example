import { ConnectionOptions, SimpleConsoleLogger } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export enum NodeEnv {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  MIGRATION = 'migration',
}

const { NODE_ENV, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT, DB_HOST } =
  process.env;

export const postgresConnectionOptions: ConnectionOptions = {
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  logging: NODE_ENV === NodeEnv.DEVELOPMENT,
  logger:
    NODE_ENV === NodeEnv.MIGRATION ? new SimpleConsoleLogger(false) : undefined,
  migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
  migrationsRun: true,
  entities: [`${__dirname}/**/*.entity{.ts,.js}`],
  cli: {
    migrationsDir: `${__dirname}/migrations`,
  },
  synchronize: false,
  // seeds: [path.resolve(__dirname, 'seed/**/*.seed{.ts,.js}')],
  migrationsTransactionMode: 'each',
};

export default postgresConnectionOptions;
