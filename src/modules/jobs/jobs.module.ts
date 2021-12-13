import { Module } from '@nestjs/common';
import { TasksService } from './news';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Profile} from '../profile/profile.entity';
import {Roles} from '../app/roles.entity';

import {NewsService} from './NewsService';
import {ActivityReward} from './jobs.entity';
import {JobController} from './job.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ActivityReward])],
    providers: [NewsService],
    exports:[],
    controllers: [JobController],

})
export class JobsModule {}
