import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAssistantService } from './ai-assistant.service';
import { AiAssistantController } from './ai-assistant.controller';
import { AiChatHistory } from '../../database/entities/ai-chat-history/ai-chat-history.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AiChatHistory]),
  ],
  providers: [AiAssistantService],
  controllers: [AiAssistantController],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
