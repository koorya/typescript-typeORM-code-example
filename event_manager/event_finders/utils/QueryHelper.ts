import { FirebaseQueryHelper, Handbook } from './FirebaseQueryHelper';
import { SQLQueryHelper, Queryer } from './SQLQueryHelper';

export class QueryHelper implements Handbook, Queryer {
  private _sqlQueryHelper: SQLQueryHelper;
  private _firebaseQueryHelper: FirebaseQueryHelper;

  constructor(
    sqlQueryHelper: SQLQueryHelper,
    firebaseQueryHelper: FirebaseQueryHelper,
  ) {
    this._sqlQueryHelper = sqlQueryHelper;
    this._firebaseQueryHelper = firebaseQueryHelper;
  }

  lastMeashuredNormalLevel(KM_ID_LIST: number[]) {
    return this._sqlQueryHelper.lastMeashuredNormalLevel(KM_ID_LIST);
  }
  idWithLowLevel() {
    return this._sqlQueryHelper.idWithLowLevel();
  }
  meashuredValues() {
    return this._sqlQueryHelper.meashuredValues();
  }
  getLastMeashurementDates(minutesConstraint: number) {
    return this._sqlQueryHelper.getLastMeashurementDates(minutesConstraint);
  }
  tzpDataByTankNumber() {
    return this._firebaseQueryHelper.tzpDataByTankNumber();
  }
  shortNameByShopKey() {
    return this._firebaseQueryHelper.shortNameByShopKey();
  }
  fbObjectNameByShopKey() {
    return this._firebaseQueryHelper.fbObjectNameByShopKey();
  }
  unfinishedRoutes() {
    return this._firebaseQueryHelper.unfinishedRoutes();
  }
  zeroOutcomeTransaction() {
    return this._firebaseQueryHelper.zeroOutcomeTransaction();
  }
  getTZPFillingFirebirdInfo() {
    return this._sqlQueryHelper.getTZPFillingFirebirdInfo();
  }
  getTZPFillingMySQLInfo() {
    return this._sqlQueryHelper.getTZPFillingMySQLInfo();
  }
  getTZPFillingDayNaightSkew(days_ago: number = 1) {
    return this._sqlQueryHelper.getTZPFillingDayNaightSkew(days_ago);
  }
}
