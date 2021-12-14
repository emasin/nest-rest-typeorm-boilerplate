import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';


import {NewsService} from './NewsService';
import {ActivityReward} from './jobs.entity';

import {HttpModule} from '@nestjs/axios';
import {ConfigModule} from '../config/config.module';

@Module({
    imports: [TypeOrmModule.forFeature([ActivityReward]),HttpModule,ConfigModule],
    providers: [NewsService],
    exports:[],


})
export class JobsModule {}
