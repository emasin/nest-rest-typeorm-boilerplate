import * as crypto from 'crypto';
import { url } from 'gravatar';
import {Md5} from 'ts-md5/dist/md5';
import {
    BadRequestException,
    Injectable, Logger,
    NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ActivityReward } from './jobs.entity';
import { RegisterPayload } from '../auth/payload/register.payload';

import {Cron, CronExpression} from '@nestjs/schedule';
import {HttpService} from '@nestjs/axios';
import {ConfigService} from '../config/config.service';


/**
 * Profile Service
 */
@Injectable()
export class NewsService {
    private readonly logger = new Logger(NewsService.name);
    /**
     * Constructor
     * @param {Repository<Roles>} rolesRepository
     */
    constructor(
        @InjectRepository(ActivityReward)
        private readonly rolesRepository: Repository<ActivityReward>,
        private  readonly  httpService : HttpService,
        private readonly configService: ConfigService
    ) {}



    /**
     * Create a profile with RegisterPayload fields
     * @param {RegisterPayload} payload profile payload
     * @returns {Promise<Profile>} data from the created profile
     */
    async create(payload: ActivityReward[]): Promise<ActivityReward[]> {
        return this.rolesRepository.save(
           payload
        );
    }

    /**
     * Create a profile with RegisterPayload fields
     * @param {RegisterPayload} payload profile payload
     * @returns {Promise<Profile>} data from the created profile
     */
    async createPoint(rdate: string): Promise<ActivityReward[]> {
        return this.rolesRepository.query(`
        INSERT INTO nm_point (user_id,point_reason,point_apply,point_before,point_after,point_total,created_at,updated_at)
    (
        SELECT T3.user_id,
               concat(date_format(NOW(), '%Y.%m.%d'), ' 활동 보상 이벤트') as point_reason,
               point                                                                      as point_apply,
               point_before,
               point + point_before                                                       as point_after,
               point_total + point                                                        as point_total,
               current_timestamp,
               current_timestamp


        FROM (
                 select user_id, sum(point) as point
                 FROM (
                          select user_id
                               , case
                                     when type = 'type1' then '댓글 작성 '
                                     when type = 'type2' then '게시글 작성'
                                     when type = 'type3' then '좋아요'
                                     when type = 'type4' then '게시글 조회'
                                     else 0 end as type
                               , case
                                     when type = 'type1' and sum(cnt) >= 3 then 6
                                     when type = 'type1' and sum(cnt) < 3 then sum(cnt) * 2
                                     when type = 'type2' and sum(cnt) >= 1 then 5
                                     when type = 'type3' and sum(cnt) >= 4 then 4
                                     when type = 'type3' and sum(cnt) < 4 then sum(cnt)
                                     when type = 'type4' and sum(cnt) >= 5 then 5
                                     when type = 'type4' and sum(cnt) < 5 then sum(cnt)
                                     else 0 end as point
                               , sum(cnt)
                          from (
                                   select user_id
                                        , CASE
                                              WHEN content_type = 'page'
                                                  THEN '뉴밍투데이'
                                              WHEN content_type = 'post'
                                                  THEN '게시글'
                                              WHEN content_type = 'article'
                                                  THEN '기사'
                                              ELSE '코멘트'
                                       END         AS content_type
                                        , action
                                        , type
                                        , count(1) as cnt
                                   from (
                                            select user_id
                                                 , action
                                                 , content_type
                                                 , content_id
                                                 , case
                                                       when content_type = 'comment' and action = 'create'
                                                           then 'type1'
                                                       when content_type = 'post' and action = 'create' then 'type2'
                                                       when action = 'reaction' then 'type3'
                                                       when action = 'delete' then '-'
                                                       else 'type4' end as type
                                            from activity_reward
                                            where content_type in ('page', 'post', 'article', 'comment', 'content')
                                              and reward_date = '${rdate}'
                                            group by user_id, content_type, action, content_id
                                        ) t1
                                   group by user_id, action, content_type
                               ) as t1
                          where type in ('type1', 'type2', 'type3', 'type4')
                          group by user_id, type) AS T2
                 group by user_id
             ) AS T3
                ,
             (
                 select *
                 from (
                          select user_id
                               , point_after                                                                as point_before
                               , point_total                                                                as point_total
                               , case when @grp = user_id then @rownum := @rownum + 1 else @rownum := 1 end as rownum
                               , (@grp := nm_point.user_id)                                                 as dum
                          from nm_point,
                               (select @rownum := 0, @grp := '') as t2
                          order by user_id, created_at desc
                      ) as t3
                 where rownum = 1) AS T4
        WHERE T3.user_id = T4.user_id
    )

        `)
    }


    @Cron(CronExpression.EVERY_30_SECONDS)
    async test(){
        this.logger.log(`test!! ${this.configService.get('APP_ENV')}`)
    }


    @Cron(CronExpression.EVERY_12_HOURS)
    async exec(){
        this.logger.log(`test!! ${this.configService.get('APP_ENV')}`)
        if(!this.configService.isEnv('production')){
           this.logger.log(`exec!! ${this.configService.get('APP_ENV')}`)
           await this.makeData();
        }
    }
    @Cron(CronExpression.EVERY_10_MINUTES)
    async makeData(){
        /**
         * [{COPT: Content.Post}, {COAT: Content.Article}, {CMMT: Comment}, {CMPT: PortalComment(=CommentPortal)}
         * 뉴밍투데이 조회 , 밍투표 참여
         */

        const { BigQuery } = require('@google-cloud/bigquery');
        const bigquery = new BigQuery();
        const query = 'SELECT *,FORMAT_DATETIME(\'%F %X\', DATETIME(TIMESTAMP(`timestamp`), \'Asia/Seoul\')) AS datetime  from `newming-8a774.fluentd.newming-api` where DATE(TIMESTAMP(`timestamp`)) >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)';
        const options = {
            'query' : query,
            'location': 'US',
        }
        const [job] = await bigquery.createQueryJob(options);
        const [rows] = await job.getQueryResults();
        const items : ActivityReward[] = [];
        /**
         * rows.forEach(row=> this.logger.log(`row ${row.group_id}  ${row.content_type}
         * ${row.content_id} ${row.user_name}   ${row.user_id} ${row.action}
         * ${row.datetime} ${row.hash_key}   `));
         */
        this.logger.log('start')
        const today = new Date();
        today.setHours(today.getHours() + 9);
        const  d = today.toISOString().replace('T', ' ').substring(0, 10);

        rows.forEach((row)=>{
            if(row.user_name === null || !row.user_name) {
                this.logger.log(`username null user row ${row.group_id}  ${row.content_type} ${row.content_id} ${row.user_name}   ${row.user_id} ${row.action}  ${row.datetime} ${row.hash_key}   `)
            }
            if(row.action !== 'login' && row.action !== 'register'){
            items.push({id:0,reward_date:d,group_id:row.group_id,content_type:row.content_type
                ,content_id:row.content_id,username:Md5.hashStr(row.user_name),user_id:row.user_id
                ,action: row.action,datetime:row.datetime,hash_key:row.hash_key});
            }
        });
        this.logger.log('done bigquery')
        await this.create(items);
        await this.createPoint(d);
        this.logger.log('done point')
        /*
        const c = await this.httpService.post('http://localhost:3801/v1/admin/push/send',{'title':'test','message':'test' , 'user_ids': 2})
        this.logger.log(`push res ${c}`)
         */
    }


}
