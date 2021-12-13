import { Module } from '@nestjs/common';
import { TasksService } from './news';
import {TypeOrmModule} from '@nestjs/typeorm';


import {NewsService} from './NewsService';
import {ActivityReward} from './jobs.entity';
import {JobController} from './job.controller';
import {HttpModule} from '@nestjs/axios';

@Module({
    imports: [TypeOrmModule.forFeature([ActivityReward]),HttpModule],
    providers: [NewsService],
    exports:[],
    controllers: [JobController],

})
export class JobsModule {}
