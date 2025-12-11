import { Body, Controller, Post, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';
import { ChatWithGeminiDto } from './dto/chat-with-gemini.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../../database/entities/user/user.entity';

@Controller('ai-assistant')
export class AiAssistantController {
  constructor(private readonly aiService: AiAssistantService) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  async chatWithGemini(
    @Body() chatDto: ChatWithGeminiDto,
    @GetUser() user: User,
  ): Promise<ChatResponseDto> {
    // Extract user info from authenticated request
    const userId = user.user_id;
    
    // Determine user type based on relations
    let userType = 'guest';
    if (user.jobSeeker) userType = 'job_seeker';
    else if (user.employer) userType = 'employer';
    else if (user.admin) userType = 'admin';

    return this.aiService.chatWithGemini(chatDto, userId, userType);
  }

  @Get('suggestions')
  @Public()
  getSuggestions(): { suggestions: string[] } {
    return {
      suggestions: this.aiService.getSuggestions(),
    };
  }

  @Get('status')
  @Public()
  getStatus(): { configured: boolean; message: string } {
    const configured = this.aiService.isConfigured();
    return {
      configured,
      message: configured
        ? 'AI Assistant is ready'
        : 'AI Assistant is not configured. Please set GEMINI_API_KEY.',
    };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getChatHistory(
    @GetUser('user_id') userId: string,
    @Query('limit') limit?: number,
  ) {
    const history = await this.aiService.getChatHistory(
      userId,
      limit ? Number(limit) : 50,
    );
    return { history, total: history.length };
  }

  @Get('history/all')
  @UseGuards(JwtAuthGuard)
  async getAllChatHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // TODO: Add admin role check here
    return this.aiService.getAllChatHistory(
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
    );
  }

  @Delete('history')
  @UseGuards(JwtAuthGuard)
  async deleteChatHistory(@GetUser('user_id') userId: string) {
    await this.aiService.deleteChatHistory(userId);
    return { message: 'Chat history deleted successfully' };
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getChatStatistics() {
    // TODO: Add admin role check here
    return this.aiService.getChatStatistics();
  }
}
