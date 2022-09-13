import { SensorName } from '@alert-service/events/dto/events.dto';
import { FirebirdQueryer } from '@connections/FirebirdQueryer';
import { MysqlQueryer } from '@connections/MysqlQueryer';


export type Queryer = { [K in keyof SQLQueryHelper as SQLQueryHelper[K] extends Function ? K : never]: SQLQueryHelper[K] };


export class SQLQueryHelper {
  private _firebirdQueryer: FirebirdQueryer;
  private _mysqlQueryer: MysqlQueryer;

  constructor(firebirdQueryer: FirebirdQueryer, mysqlQueryer: MysqlQueryer) {
    this._firebirdQueryer = firebirdQueryer;
    this._mysqlQueryer = mysqlQueryer;
  }

  async lastMeashuredNormalLevel(KM_ID_LIST: number[]) {
    const query = /* sql */ `
          SELECT
          A.KM_ID,	
          -- A.TH_ST_VOLUME,
          B.LAST_NORMAL_VOLUME_TIME
        FROM 
          TANKHISTORY AS A
          INNER JOIN
            (
              SELECT 
                KM_ID,
                MAX(TH_ST_TIME) AS LAST_NORMAL_VOLUME_TIME
              FROM
                TANKHISTORY
              WHERE 
                TH_ST_TIME>dateadd(-2 day to current_date)
                AND
                TH_ST_VOLUME > 3000
              GROUP BY KM_ID
            ) AS B
          ON A.KM_ID = B.KM_ID
              AND A.TH_ST_TIME = B.LAST_NORMAL_VOLUME_TIME
        WHERE A.KM_ID IN (${KM_ID_LIST.join(', ')})
      ;
    `;
    const res = (await this._firebirdQueryer.query(query)) as {
      KM_ID: number;
      LAST_NORMAL_VOLUME_TIME: Date;
    }[]
      ;
    return res;
  }

  async idWithLowLevel() {
    const query = /* sql */ `
      SELECT
        C.KM_ID AS KM_ID,
        C.TH_ST_TIME AS TH_ST_TIME,
        C.TH_ST_VOLUME AS TH_ST_VOLUME
      FROM
      (
        SELECT 
          A.KM_ID,
          A.MAX_TIME
        FROM
          (SELECT 
            KM_ID,
            MAX(TH_ST_TIME) AS MAX_TIME
          FROM 
            TANKHISTORY
          WHERE  
            TH_ST_TIME>dateadd(-2 day to current_date)
          GROUP BY KM_ID
          ) AS A
          INNER JOIN
            (SELECT
              KM_ID,
              MAX(TH_ST_TIME) AS MAX_TIME_UNDERLEVEL
            FROM 
              TANKHISTORY
            WHERE 
              TH_ST_TIME>dateadd(-2 day to current_date)
              AND
              TH_ST_VOLUME < 3000
            GROUP BY KM_ID) AS B
              ON A.MAX_TIME = B.MAX_TIME_UNDERLEVEL 
              AND A.KM_ID=B.KM_ID 
      ) A
      INNER JOIN 
        TANKHISTORY C
      ON 
        C.KM_ID = A.KM_ID
        AND
        C.TH_ST_TIME = A.MAX_TIME
      ;	
    `;
    const res = (await this._firebirdQueryer.query(query)) as {
      KM_ID: number;
      TH_ST_TIME: Date;
      TH_ST_VOLUME: number;
    }[];

    return res.map(({ KM_ID }) => KM_ID);
  }
  async meashuredValues() {
    const last_week_date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('ru', { timeZone: 'utc' })
      .split('.')
      .reverse()
      .join('-');

    const query = /* sql */ `
      select 
        b.KM_ID, 
        b.TH_ST_VOLUME, 
        b.TH_ST_PLOTN, 
        b.TH_ST_TEMPER, 
        b.TH_ST_LEVEL, 
        b.TH_ST_MASSA, 
        b.TH_ST_TIME
      from
        (select * from TANKHISTORY where TH_ST_TIME>='${last_week_date}') b 
        inner join
          (
          select  
            a.KM_ID,
            max(a.TH_ST_TIME) last_time
          from 
            TANKHISTORY a 
            where
              a.TH_ST_TIME>='${last_week_date}'
            group by 
              a.KM_ID
          ) c
        on 
          b.KM_ID=c.KM_ID and
          b.TH_ST_TIME=c.last_time 
      ;

    `;

    const res = (await this._firebirdQueryer.query(query)) as
      ({
        KM_ID: number;
        TH_ST_TIME: Date;

      } & { [key in SensorName]: number })[];
    return res;
  }

  async getLastMeashurementDates(minutesConstraint: number) {
    const minutesRest = Math.ceil(minutesConstraint % 60);
    const hoursConstraint = Math.ceil(minutesConstraint / 60);

    // рассматриваются записи за неделю

    const query = /*sql*/`

    select 
      a.WarehouseMeasurementKey, 
      a.MeasurementDateTime, 
      a.ShopKey, 
      a.WarehouseKey 
    from 
      warehousemeasurement a
    inner join 
      (
        select 
          max(MeasurementDateTime) last_MeasurementDateTime, 
          ShopKey
        from  
          warehousemeasurement
        where 
          MeasurementDateTime>subdate(now(), 7)
        group by 
          ShopKey
      ) b
    on
      a.ShopKey=b.ShopKey
      and 
      a.MeasurementDateTime=b.last_MeasurementDateTime
    where MeasurementDateTime<=subtime(now(), '${hoursConstraint}:${minutesRest}:0');
    `
    const res = (await this._mysqlQueryer.query(query)) as any as {
      WarehouseMeasurementKey: number;
      MeasurementDateTime: Date;
      ShopKey: number;
      WarehouseKey: number;
    }[];

    return res;
  }


  async getTZPFillingMySQLInfo() {

    const query = /*sql*/`
      select 
        count(volume) FILLINCOUNT,
        TIMEDIFF(max(transactiondatetime), min(transactiondatetime))  deltatime,
        sum(volume) volume,
        COALESCE(waybill.shopkey) shopKey, 
        ttnnumber,
        max(transactiondatetime) transactiondatetime,
        COALESCE(organizationPayerKey) organizationKey,
        COALESCE(convert(cast(TrailerNumber as binary) using cp1251)) TrailerNumber,
        COALESCE(convert(cast(DriverName as binary) using cp1251)) DriverName
      from 
        (select * from Selling 
          where 
            transactiondatetime>subtime(now(), '2 00:00:00')
        ) Selling
        inner join 
          ( select * from waybill
           where 
            waybilltime > subtime(now(), '2 00:00:00')
          ) waybill 
          on 
            waybill.WaybillCode=Selling.WaybillCode 
            and waybill.ShopKey=selling.ShopKey 
      group by
        ttnnumber
      having 
        TIMEDIFF(max(transactiondatetime), min(transactiondatetime))<'02:00:00'
      ;
    `
    const res = (await this._mysqlQueryer.query(query)) as any as {
      FILLINCOUNT: number;
      deltatime: string; //'hh:mm:ss'
      volume: number;
      shopKey: number;
      ttnnumber: number;
      transactiondatetime: Date;
      organizationKey: number;
      TrailerNumber: string;
      DriverName: string;
    }[];

    return res.map(({ ttnnumber, ...rest }) => ({ TTNNUM: `${ttnnumber}`, ...rest }));
  }

  async getTZPFillingFirebirdInfo() {
    const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('ru', { timeZone: 'utc' })
      .split('.')
      .reverse()
      .join('-');
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      .toLocaleString('ru', { timeZone: 'utc' }).split(',').map(d => d.split('.').reverse().join('-')).join('');

    const query = /* sql */ `
      select
        count(id) FILLOUTCOUNT,
        max(id) ID, 
        cast(list(km_id) as varchar(20)) km_ids, 
        cast(ttnnum as integer) ttnnum, 
        max(ttndate) tnndate, 
        sum(ttnvolume) ttnvolume, 
        sum(accountvolume) accountvolume,
        min(addtime) minaddtime,
        max(addtime) maxaddtime,
        min(begtime) begtime,
        max(endtime) endtime
      from 
        prx 
      where
        ttnnum is not null
        and
        ttnnum similar to '[[:DIGIT:]]*'
        and
        addtime>dateadd(-1 day to current_timestamp) --yesterday 
        and
        addtime<dateadd(-2 hour to current_timestamp) --two hours ago
      group by
        ttnnum
      having 
        max(addtime)<dateadd(-4 hour to current_timestamp) --four hours ago
        and
        min(addtime)>dateadd(-22 hour to current_timestamp) --yesterday + two hours
      order by
        maxaddtime 
      ;
  `;

    const res = (await this._firebirdQueryer.query(query)) as {
      FILLOUTCOUNT: number;
      ID: number;
      KM_IDS: string; //number[];
      TTNNUM: number;
      TTNDATE: Date;
      TTNVOLUME: number;
      ACCOUNTVOLUME: number;
      MINADDTIME: Date;
      MAXADDTIME: Date;
      BEGTIME: Date;
      ENDTIME: Date;
    }[];
    return res.map(({ KM_IDS, ...rest }) => ({ ...rest, KM_IDS: `${KM_IDS}`.split(',').map(v => parseInt(v)) }));
  }

  async getTZPFillingDayNaightSkew(days_ago: number = 1) {

    const query = /* sql */ `
      select dateadd(-1 day to current_date) "dateadd", count(addtime) "count", km_id "km_id", (CASE WHEN ( addtime between 
          dateadd(17 hour to cast(dateadd(-${days_ago + 1} day to current_date) as timestamp))
          and 
          dateadd(5 hour to cast(dateadd(-${days_ago} day to current_date) as timestamp)) ) then 'night' else 'day' end) as "day_night"
          from prx  
      where 
        addtime between 
          dateadd(17 hour to cast(dateadd(-${days_ago + 1} day to current_date) as timestamp))
          and 
          dateadd(17 hour to cast(dateadd(-${days_ago} day to current_date) as timestamp))
      group by 
        km_id,
      "day_night"
      order by
        "day_night",
        km_id
      ;
  `;

    const res = (await this._firebirdQueryer.query(query)) as {
      dateadd: Date;
      count: number;
      km_id: number;
      day_night: string;
    }[];
    return res.map(({ day_night, ...rest }) => ({ day_night: day_night.trim() as "day" | "night", ...rest }));
  }
}
