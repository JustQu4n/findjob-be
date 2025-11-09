import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [ProfileModule, ApplicationsModule],
  controllers: [],
  providers: []
})
export class UsersModule {}
