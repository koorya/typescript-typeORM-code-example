import { AbnormalValuesFinder } from "event_manager/event_finders/AbnormalValuesFinder";
import { FirebaseQueryHelper } from "event_manager/event_finders/utils/FirebaseQueryHelper";
import { SQLQueryHelper } from "event_manager/event_finders/utils/SQLQueryHelper";
import { QueryHelper } from "event_manager/event_finders/utils/QueryHelper";
import * as dotenv from 'dotenv';
import { FirebaseConnector } from "@connections/firebasestore";
import { FirebirdConfigType, FirebirdQueryer } from "@connections/FirebirdQueryer";
import { EventFinder } from "event_manager/event_finders/EventFinder";
import { UnclosedRaceFinder } from "event_manager/event_finders/UnclosedRaceFinder";
import { CriticalFuelLevelFinder } from "event_manager/event_finders/CriticalFuelLevelFinder";
import { ZeroLitersTransactionFinder } from "event_manager/event_finders/ZeroLitersTransactionFinder";
import { MysqlConfigType, MysqlQueryer } from "@connections/MysqlQueryer";
import { MysqlConnectionFaultFinder } from "event_manager/event_finders/MysqlConnectionFaultFinder";
import { logEventExecuterError, logEventExecuterInfo } from "common/log_utils";
import { TZPFillingDeviationFinder } from "event_manager/event_finders/TZPFillingDeviationFinder";
import { TZPFillingDayNightSkewFinder } from "event_manager/event_finders/TZPFillingDayNightSkewFinder";




const finders = {
	UnclosedRaceFinder,
	AbnormalValuesFinder,
	CriticalFuelLevelFinder,
	ZeroLitersTransactionFinder,
	MysqlConnectionFaultFinder,
	TZPFillingDeviationFinder,
	TZPFillingDayNightSkewFinder,
}

interface EventFinderConstructor {
	new(arg1: QueryHelper, arg2?: number): EventFinder;
}

class EventFinderExecutor {
	eventFinder: EventFinderConstructor;


	constructor(eventFinder: EventFinderConstructor) {
		this.eventFinder = eventFinder;
	}

	async run() {
		dotenv.config();
		logEventExecuterInfo('env read success');

		const firebirdConfig: FirebirdConfigType = process.env as any;
		const mysqlConfig: MysqlConfigType = process.env as any;

		const firebirdQueryer = new FirebirdQueryer(firebirdConfig);
		const mysqlQueryer = new MysqlQueryer(mysqlConfig);
		await mysqlQueryer.connect();
		logEventExecuterInfo('mysqlQueryer connected');

		const firestoreConnector = new FirebaseConnector();
		let res;
		try {

			const firebirdQueryHelper = new SQLQueryHelper(firebirdQueryer, mysqlQueryer);
			const firebaseQueryHelper = new FirebaseQueryHelper(firestoreConnector.db);
			const queryHelper = new QueryHelper(
				firebirdQueryHelper,
				firebaseQueryHelper,
			);
			logEventExecuterInfo('eventFinder runned');
			res = await new this.eventFinder(queryHelper, 1).find();
			logEventExecuterInfo('eventFinder finished');


		} catch (e) {
			logEventExecuterError(e);
		} finally {
			await firestoreConnector.close();
			logEventExecuterInfo('firestoreConnector closed');
			await firebirdQueryer.close();
			logEventExecuterInfo('firebirdQueryer closed');
			mysqlQueryer.close();
			logEventExecuterInfo('mysqlQueryer closed');
		}
		return res;
	}
}
const finderName = process.argv.pop();
logEventExecuterInfo(finderName);
if (finderName in finders) {
	logEventExecuterInfo('started');
	new EventFinderExecutor(finders[finderName]).run().then((res) => {
		logEventExecuterInfo('finished')
		logEventExecuterInfo('res: ', JSON.stringify(res, null, 2));
	});
}
else {
	logEventExecuterError('invalid finder name');
}