import * as dotenv from 'dotenv';
import { FirebaseConnector } from '@connections/firebasestore';
import {
  FirebirdConfigType,
  FirebirdQueryer,
} from '@connections/FirebirdQueryer';
import { CriticalFuelLevelFinder } from 'event_manager/event_finders/CriticalFuelLevelFinder';
import { UnclosedRaceFinder } from 'event_manager/event_finders/UnclosedRaceFinder';
import { ZeroLitersTransactionFinder } from 'event_manager/event_finders/ZeroLitersTransactionFinder';
import { SQLQueryHelper } from 'event_manager/event_finders/utils/SQLQueryHelper';
import { FirebaseQueryHelper } from 'event_manager/event_finders/utils/FirebaseQueryHelper';
import { QueryHelper } from 'event_manager/event_finders/utils/QueryHelper';
import { EventManager } from 'event_manager';
import { logEventManagerError, logEventManagerInfo } from "../../common/log_utils";
import { AbnormalValuesFinder } from 'event_manager/event_finders/AbnormalValuesFinder';
import { MysqlConfigType, MysqlQueryer } from '@connections/MysqlQueryer';
import { MysqlConnectionFaultFinder } from 'event_manager/event_finders/MysqlConnectionFaultFinder';
import { TZPFillingDeviationFinder } from 'event_manager/event_finders/TZPFillingDeviationFinder';
import { TZPFillingDayNightSkewFinder } from 'event_manager/event_finders/TZPFillingDayNightSkewFinder';

dotenv.config();

export async function updateEventManagerJob() {


  logEventManagerInfo('START');
  try {

    const firebirdConfig: FirebirdConfigType = process.env as any;
    const mysqlConfig: MysqlConfigType = process.env as any;


    const firebirdQueryer = new FirebirdQueryer(firebirdConfig);
    const mysqlQueryer = new MysqlQueryer(mysqlConfig);
    await mysqlQueryer.connect();
    logEventManagerInfo('mysqlQueryer connected');

    const firestoreConnector = new FirebaseConnector();

    try {
      const firebirdQueryHelper = new SQLQueryHelper(firebirdQueryer, mysqlQueryer);
      const firebaseQueryHelper = new FirebaseQueryHelper(firestoreConnector.db);
      const queryHelper = new QueryHelper(
        firebirdQueryHelper,
        firebaseQueryHelper,
      );

      const eventFinders = [
        new UnclosedRaceFinder(queryHelper),
        new ZeroLitersTransactionFinder(queryHelper),
        new CriticalFuelLevelFinder(queryHelper),
        new AbnormalValuesFinder(queryHelper),
        new MysqlConnectionFaultFinder(queryHelper, process.env.MYSQL_FOULTFINDER_TIME_MINUTES),
        new TZPFillingDeviationFinder(queryHelper, parseInt(process.env.TZP_FILLING_DEVIATION_CUTOFF)),
        new TZPFillingDayNightSkewFinder(queryHelper, parseInt(process.env.TZP_FILLING_DAY_NIGHT_SKEW_FACTOR)),
      ];

      const eventManager = new EventManager(eventFinders);
      await eventManager.update();
      logEventManagerInfo('UPDATED');
    } catch (e) {
      logEventManagerError(e);
    } finally {
      await firestoreConnector.close();
      await firebirdQueryer.close();
      mysqlQueryer.close();
      logEventManagerInfo('FINISHED');
    }
  } catch (e) {
    logEventManagerError(e);

  }


}
