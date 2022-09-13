import { EventTypeEnum } from '@alert-service/types';
import { EventDataWithKey, EventFinder } from './EventFinder';
import { QueryHelper } from './utils/QueryHelper';

export class UnclosedRaceFinder implements EventFinder {
  queryHelper: QueryHelper;

  constructor(queryHelper: QueryHelper) {
    this.queryHelper = queryHelper;
  }
  async find() {
    const unfinishedRoutesFlatList = await this.queryHelper.unfinishedRoutes();

    const date_now = Date.now();
    const unfinishedRacesOver24h = unfinishedRoutesFlatList.filter(
      (item) => date_now - new Date(item.createdOn).getTime() > 1000 * 60 * 60 * 24,
    );
    return unfinishedRacesOver24h.map(
      (race): EventDataWithKey => ({
        type: EventTypeEnum.UNCLOSED_RACE,
        key: race.id,
        data: race,
      }),
    );
  }
}
