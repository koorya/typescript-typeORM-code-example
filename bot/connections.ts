import * as dotenv from 'dotenv';
import admin from 'firebase-admin';
import {
  Connection,
  createConnection,
  EntityTarget,
  Repository,
} from 'typeorm';
import postgresConnectionOptions from '@orm/ormconfig';

let postgresConnection: Connection;

export const createConnections = async () => {
  dotenv.config();

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://rosnova54.firebaseio.com',
  });

  postgresConnection = await createConnection(postgresConnectionOptions);

  console.log('databases connected');
};

export const getRepository = <T>(classProp: EntityTarget<T>): Repository<T> =>
  postgresConnection.getRepository(classProp);
