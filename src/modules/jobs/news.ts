import {Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression, Timeout} from '@nestjs/schedule';
import {ProfileService} from '../profile/profile.service';



@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(private readonly profileService: ProfileService) {}

    /**
     * constructor(private readonly profileService: NewsService,) {}
     *
     * **/
    @Cron(CronExpression.EVERY_12_HOURS)
    async handleCron(){
        /**
         * [{COPT: Content.Post}, {COAT: Content.Article}, {CMMT: Comment}, {CMPT: PortalComment(=CommentPortal)}
         * 뉴밍투데이 조회 , 밍투표 참여
         */
        const {BigQuery} = require('@google-cloud/bigquery');
        const bigquery = new BigQuery();
        const query = 'SELECT *,FORMAT_DATETIME(\'%F %X\', DATETIME(TIMESTAMP(`timestamp`), \'Asia/Seoul\')) AS datetime  from `newming-8a774.fluentd.newming-api` where DATE(TIMESTAMP(`timestamp`)) >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) ';
        const options = {
            'query' : query,
            'location': 'US',
        }
        const [job] = await bigquery.createQueryJob(options);
        const [rows] = await job.getQueryResults();
        //rows.forEach(row=> this.logger.log(`row ${row.group_id}  ${row.content_type} ${row.content_id} ${row.user_name}   ${row.user_id} ${row.action}  ${row.datetime} ${row.hash_key}   `));

        rows.forEach((row)=>{ if(row.action !== 'login') {
            this.logger.log(`row ${row.group_id}  ${row.content_type} ${row.content_id} ${row.user_name}   ${row.user_id} ${row.action}  ${row.datetime} ${row.hash_key}   `)}});

        this.profileService.getByUsername('scott');

        //this.profileService.create(rows).then((r)=>{this.logger.log(r)});


    }
}
