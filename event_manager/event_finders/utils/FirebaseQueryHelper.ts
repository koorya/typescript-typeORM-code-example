import {
  collection,
  Firestore,
  getDocs,
  getDocsFromServer,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { EventData } from '@alert-service/events/dto/events.dto';
import { EventTypeEnum } from '@alert-service/types';

export interface Handbook {
  tzpDataByTankNumber: () => Promise<{ id: number; name: string; volume: number; }[]>;
  unfinishedRoutes: () => Promise<
    Extract<EventData, { type: EventTypeEnum.UNCLOSED_RACE }>['data'][]
  >;

  zeroOutcomeTransaction: () => Promise<
    Extract<EventData, { type: EventTypeEnum.ZERO_TRANSACTION }>['data'][]
  >;
  shortNameByShopKey: () => Promise<string[]>;
}

export class FirebaseQueryHelper implements Handbook {
  private _firestore: Firestore;

  constructor(firestore: Firestore) {
    this._firestore = firestore;
  }

  async tzpDataByTankNumber() {
    const querySnapshot = await getDocsFromServer(
      collection(this._firestore, 'objects'),
    );

    const tzpNameByTankNumber = querySnapshot.docs
      .map((res) => {
        const tzp: { [key in string]: { kmazs: number[]; volume: number } } = res.get('tzp');
        const fbObjectName: string = res.id;
        const shortName: string = res.get('short');
        const shopKey: number = res.get('shopKey');
        const OrganizationKey: number = res.get('OrganizationKey');

        const tzpNameByTankNumber: {
          id: number;
          name: string;
          volume: number;
          fbObjectName: string;
          shortName: string;
          shopKey: number;
          OrganizationKey: number;
        }[] = [];
        if (shopKey != undefined)
          for (const tzp_name in tzp) {
            for (const index of tzp[tzp_name].kmazs)
              tzpNameByTankNumber.push({
                id: index,
                name: tzp_name,
                volume: tzp[tzp_name].volume,
                fbObjectName,
                shortName,
                shopKey,
                OrganizationKey
              });
          }
        return tzpNameByTankNumber;
      })
      .flat();
    return tzpNameByTankNumber;
  }
  async shortNameByShopKey() {
    const querySnapshot = await getDocsFromServer(
      collection(this._firestore, 'objects'),
    );

    const shortNameByShopKey: string[] = [];
    for (const doc of querySnapshot.docs) {

      const shopKey: number = doc.get('shopKey');
      if (typeof shopKey !== 'number') continue;
      const shortName: string = doc.get('short');
      if (!shortNameByShopKey[shopKey])
        shortNameByShopKey[shopKey] = shortName;
      else
        shortNameByShopKey[shopKey] += '/' + shortName;

    }
    return shortNameByShopKey;
  }
  async fbObjectNameByShopKey() {
    const querySnapshot = await getDocsFromServer(
      collection(this._firestore, 'objects'),
    );

    const fbObjectNameByShopKey: string[][] = [];
    for (const doc of querySnapshot.docs) {

      const shopKey: number = doc.get('shopKey');
      if (typeof shopKey !== 'number') continue;
      const fbObjectName: string = doc.ref.path;
      if (!fbObjectNameByShopKey[shopKey])
        fbObjectNameByShopKey[shopKey] = [fbObjectName];
      else
        fbObjectNameByShopKey[shopKey].push(fbObjectName);

    }
    return fbObjectNameByShopKey;
  }
  async unfinishedRoutes() {
    const querySnapshot = await getDocsFromServer(
      collection(this._firestore, 'objects'),
    );
    const unfinishedRoutes = await Promise.all(
      querySnapshot.docs.map(async (res) => {
        const fbObjectName: string = res.id;
        const shortName: string = res.get('short');
        const notFinishedRoutesQuery = await getDocs(
          query(
            collection(this._firestore, res.ref.path, 'routes'),
            where('status', '!=', 'finished'),
          ),
        );
        return notFinishedRoutesQuery.docs.map((route) => {
          return {
            fbObjectNames: [fbObjectName],
            shortName,
            id: route.id,
            createdOn: (route.get('createdOn') as Timestamp).toDate().toUTCString(),
            carNumber: route.get('car')['number'] as string,
            name: route.get('name') as string,
            link: route.ref.path,
          };
        });
      }),
    );
    return unfinishedRoutes.flat();
  }

  async zeroOutcomeTransaction() {
    const querySnapshot = await getDocsFromServer(
      collection(this._firestore, 'objects'),
    );

    // Некорректная транзакция выдачи топлива из {АТЗ/ТЗП}
    // {наименование АТЗ/ТЗП по справочнику} в {time} (дата и время заправки)

    const zeroOutcomeTransactionList = await Promise.all(
      querySnapshot.docs.map(async (res) => {
        const tzp: { [key in string]: { kmazs: number[] } } = res.get('tzp');
        const fbObjectName: string = res.id;
        const shortName: string = res.get('short');

        const tpzNameByTankNumber: string[] = [];
        for (const tpz_name in tzp) {
          for (const index of tzp[tpz_name].kmazs)
            tpzNameByTankNumber[index] = tpz_name;
        }

        const atz: { [key in string]: { kmazs: number; nomer: string } } =
          res.get('atz');

        const atzNameByTankNumber: string[] = [];
        for (const atz_id in atz) {
          atzNameByTankNumber[atz[atz_id].kmazs] = atz[atz_id].nomer;
        }

        const date = new Date();
        date.setDate(date.getDate() - 1);

        // нельзя сразу два ограничения накладывать,
        // второе ограничение делается на пользовательской стороне
        // https://stackoverflow.com/a/52066276
        const zeroOutcomeQuery = await getDocs(
          query(
            collection(this._firestore, res.ref.path, 'outcome'),
            where('time', '>', date),
          ),
        );
        return zeroOutcomeQuery.docs
          .filter((outcome) => outcome.get('liters') <= 1)
          .map((outcome): Extract<EventData, { type: EventTypeEnum.ZERO_TRANSACTION }>['data'] => {
            const tank: number = outcome.get('tank');
            const isAtz: boolean = outcome.get('atz');
            const time = outcome.get('time') as Timestamp;
            const start_time = outcome.get('start_time') as Timestamp;
            const company = outcome.get('company') as string;
            const carmarka = outcome.get('carmarka') as string;
            const carnumber = outcome.get('carnumber') as string;
            const weight = outcome.get('weight') as number;
            const density = outcome.get('density') as number;
            const liters = outcome.get('liters') as number;
            return {
              fbObjectNames: [fbObjectName],
              shortName,
              id: outcome.id,
              time: time.toDate().toUTCString(),
              start_time: start_time.toDate().toUTCString(),
              isAtz,
              liters,
              weight,
              density,
              tank,
              name: !isAtz
                ? tpzNameByTankNumber[tank]
                : atzNameByTankNumber[tank] ? atzNameByTankNumber[tank] : `tank number ${tank}`,
              link: outcome.ref.path,
              to: {
                company,
                carmarka,
                carnumber,
              },
            };
          });
      }),
    );
    const merged = zeroOutcomeTransactionList.flat();
    return merged;
  }
}
