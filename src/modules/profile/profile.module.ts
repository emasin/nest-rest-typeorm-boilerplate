import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Profile } from './profile.entity.bak';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from '../app/roles.entity.bak';
import { ProfileController } from './profile.controller';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, Roles])],
  providers: [ProfileService],
  exports: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
