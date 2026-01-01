import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { User } from 'src/database/entities/user/user.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { EmailModule } from 'src/modules/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Employer]),
    EmailModule,
  ],
  controllers: [MessagingController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
