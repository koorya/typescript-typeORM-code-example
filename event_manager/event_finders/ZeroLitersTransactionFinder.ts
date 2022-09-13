import { EventTypeEnum } from '@alert-service/types';
import { EventDataWithKey, EventFinder } from './EventFinder';
import { QueryHelper } from './utils/QueryHelper';

export class ZeroLitersTransactionFinder implements EventFinder {
  queryHelper: QueryHelper;

  constructor(queryHelper: QueryHelper) {
    this.queryHelper = queryHelper;
  }
  async find() {
    const zeroOutcomeTransaction =
      await this.queryHelper.zeroOutcomeTransaction();

    return zeroOutcomeTransaction.map(
      (data): EventDataWithKey => ({
        type: EventTypeEnum.ZERO_TRANSACTION,
        key: data.id,
        data,
      }),
    );
  }
}
