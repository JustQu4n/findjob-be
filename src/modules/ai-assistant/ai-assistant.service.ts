import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatWithGeminiDto } from './dto/chat-with-gemini.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { SummarizeJdDto } from './dto/summarize-jd.dto';
import { JdSummaryResponseDto } from './dto/jd-summary-response.dto';
import { AiChatHistory } from '../../database/entities/ai-chat-history/ai-chat-history.entity';

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    @InjectRepository(AiChatHistory)
    private chatHistoryRepository: Repository<AiChatHistory>,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not configured');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  /**
   * System context for the chatbot about the job platform
   */
  private getSystemContext(): string {
    return `Bạn là một trợ lý AI thông minh cho nền tảng tuyển dụng việc làm. 
Nhiệm vụ của bạn là hỗ trợ người dùng với các câu hỏi về:

1. **Tìm kiếm công việc**: Giúp job seeker tìm việc phù hợp, tư vấn về kỹ năng, kinh nghiệm cần thiết.
2. **Đăng tin tuyển dụng**: Hướng dẫn employer cách đăng tin, quản lý ứng viên.
3. **Hồ sơ cá nhân**: Tư vấn cách tạo profile ấn tượng, viết CV hiệu quả.
4. **Ứng tuyển**: Hướng dẫn quy trình apply job, theo dõi trạng thái đơn ứng tuyển.
5. **Thông tin công ty**: Cung cấp thông tin về các công ty tuyển dụng, văn hóa làm việc.
6. **Kỹ năng & Ngành nghề**: Tư vấn về các kỹ năng phổ biến, xu hướng thị trường lao động.

**Hệ thống có các tính năng chính:**
- Đăng ký/Đăng nhập cho Job Seeker và Employer
- Tạo và quản lý hồ sơ (profile, education, experience, skills, projects)
- Tìm kiếm và lọc công việc theo nhiều tiêu chí
- Ứng tuyển và theo dõi trạng thái application
- Đăng tin tuyển dụng và quản lý ứng viên (cho employer)
- Lưu công việc yêu thích và theo dõi công ty
- Chat giữa employer và candidate
- Nhận thông báo về job mới và application updates

Hãy trả lời một cách thân thiện, chuyên nghiệp và hữu ích. Nếu câu hỏi không liên quan đến tuyển dụng hoặc hệ thống, 
hãy lịch sự nhắc người dùng rằng bạn được thiết kế để hỗ trợ các vấn đề về tuyển dụng.`;
  }

  /**
   * Chat with Gemini AI
   */
  async chatWithGemini(
    chatDto: ChatWithGeminiDto,
    userId?: string,
    userType?: string,
  ): Promise<ChatResponseDto> {
    if (!this.genAI) {
      throw new BadRequestException(
        'Gemini AI is not configured. Please set GEMINI_API_KEY in environment variables.',
      );
    }

    try {
      // Use latest stable model (available models may change over time)
      // Try: gemini-1.5-flash-latest, gemini-1.5-pro-latest, or just use model name without version
      const modelName = chatDto.model || 'gemini-2.5-flash';
      const model = this.genAI.getGenerativeModel({ 
        model: modelName,
      });

      // Create prompt with system context
      const systemContext = this.getSystemContext();
      const fullPrompt = `${systemContext}\n\nCâu hỏi của người dùng: ${chatDto.message}`;

      this.logger.log(`Sending request to Gemini model: ${modelName}`);

      // Generate response
      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      // Get token usage if available
      const tokensUsed = response.usageMetadata
        ? response.usageMetadata.totalTokenCount
        : undefined;

      this.logger.log(
        `Received response from Gemini. Tokens used: ${tokensUsed || 'N/A'}`,
      );

      // Save chat history to database
      try {
        const chatHistory = this.chatHistoryRepository.create({
          userId: userId || undefined,
          userMessage: chatDto.message,
          aiResponse: text,
          model: modelName,
          tokensUsed: tokensUsed,
          userType: userType || 'guest',
        });
        await this.chatHistoryRepository.save(chatHistory);
        this.logger.log(`Chat history saved with ID: ${chatHistory.id}`);
      } catch (saveError) {
        this.logger.error('Failed to save chat history:', saveError);
        // Don't throw error, just log it - chat should still work
      }

      return new ChatResponseDto({
        response: text,
        model: modelName,
        tokensUsed,
      });
    } catch (error) {
      this.logger.error('Error communicating with Gemini AI:', error);
      
      // Handle quota limit (429 Too Many Requests)
      if (error.status === 429) {
        throw new BadRequestException(
          'Đã vượt quá giới hạn sử dụng API miễn phí (20 requests/ngày). Vui lòng thử lại sau hoặc nâng cấp API key.',
        );
      }
      
      // If it's an API key issue, provide helpful message
      if (error.message && error.message.includes('API_KEY_INVALID')) {
        throw new BadRequestException(
          'Invalid Gemini API Key. Please check your GEMINI_API_KEY in .env file. Get a free key at: https://makersuite.google.com/app/apikey',
        );
      }
      
      throw new BadRequestException(
        `Failed to get response from AI: ${error.message}`,
      );
    }
  }

  /**
   * Get suggestions for common questions
   */
  getSuggestions(): string[] {
    return [
      'Làm thế nào để tạo hồ sơ xin việc ấn tượng?',
      'Tôi nên chuẩn bị gì cho một buổi phỏng vấn?',
      'Các kỹ năng nào đang được tìm kiếm nhiều hiện nay?',
      'Làm sao để theo dõi các công việc tôi đã ứng tuyển?',
      'Tôi muốn đăng tin tuyển dụng, cần làm gì?',
      'Hệ thống có những tính năng gì?',
    ];
  }

  /**
   * Check if Gemini API is configured
   */
  isConfigured(): boolean {
    return !!this.genAI;
  }

  /**
   * Get chat history for a user
   */
  async getChatHistory(
    userId: string,
    limit: number = 50,
  ): Promise<AiChatHistory[]> {
    return this.chatHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  /**
   * Get all chat history (admin only)
   */
  async getAllChatHistory(
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: AiChatHistory[]; total: number; page: number; totalPages: number }> {
    const [data, total] = await this.chatHistoryRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Delete chat history for a user
   */
  async deleteChatHistory(userId: string): Promise<void> {
    await this.chatHistoryRepository.delete({ userId });
  }

  /**
   * Get chat statistics
   */
  async getChatStatistics(): Promise<any> {
    const total = await this.chatHistoryRepository.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await this.chatHistoryRepository
      .createQueryBuilder('chat')
      .where('chat.created_at >= :today', { today })
      .getCount();

    const byUserType = await this.chatHistoryRepository
      .createQueryBuilder('chat')
      .select('chat.user_type', 'userType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('chat.user_type')
      .getRawMany();

    return {
      total,
      today: todayCount,
      byUserType,
    };
  }

  /**
   * Summarize Job Description with language detection
   */
  async summarizeJobDescription(
    summarizeDto: SummarizeJdDto,
    userId: string,
  ): Promise<JdSummaryResponseDto> {
    if (!this.genAI) {
      throw new BadRequestException(
        'Gemini AI is not configured. Please set GEMINI_API_KEY in environment variables.',
      );
    }

    try {
      const modelName = 'gemini-2.5-flash';
      const model = this.genAI.getGenerativeModel({ model: modelName });

      // Optimized prompt for JD summarization - concise description, complete content, list format
      const prompt = `You will be given a job description (JD) in either English or Vietnamese.  
              Your task is to:
              1. Detect the language of the JD.
              2. Summarize the job in the **same language** as the JD.
              3. Include only the most **important information**, such as:
                - Job title / position
                - Main responsibilities
                - Required skills
                - Required experience
                - Location (if available)
                - Salary range (if available)
              4. Present the summary in a **clear and organized** manner, preferably in bullet points.

              Keep the summary **short (about 3–5 bullet points or 5–7 lines)** and **easy to understand**. Avoid repeating unnecessary details.
              And no break lines in the summary.

              === JD START ===
              ${summarizeDto.jobDescription}
              === JD END ===
              `;

      this.logger.log(`Summarizing Job Description for user: ${userId}`);

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON response
      let parsedResponse;
      try {
        // Clean the response text (remove markdown code blocks if present)
        const cleanedText = text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        parsedResponse = JSON.parse(cleanedText);
      } catch (parseError) {
        this.logger.error('Failed to parse AI response as JSON:', parseError);
        // Fallback: return raw text
        parsedResponse = {
          detectedLanguage: 'Unknown',
          summary: text,
          position: 'N/A',
          company: 'N/A',
          keyInformation: {},
        };
      }

      this.logger.log(
        `JD summarization completed. Language: ${parsedResponse.detectedLanguage}`,
      );

      return new JdSummaryResponseDto(
        parsedResponse.summary,
        parsedResponse.detectedLanguage,
        parsedResponse.position,
        parsedResponse.company,
        parsedResponse.keyInformation,
      );
    } catch (error) {
      this.logger.error('Error summarizing Job Description:', error);

      // Handle quota limit (429 Too Many Requests)
      if (error.status === 429) {
        throw new BadRequestException(
          'Đã vượt quá giới hạn sử dụng API miễn phí (20 requests/ngày). Vui lòng thử lại sau hoặc nâng cấp API key. Chi tiết: https://ai.google.dev/gemini-api/docs/rate-limits',
        );
      }

      if (error.message && error.message.includes('API_KEY_INVALID')) {
        throw new BadRequestException(
          'Invalid Gemini API Key. Please check your GEMINI_API_KEY in .env file.',
        );
      }

      throw new BadRequestException(
        `Failed to summarize Job Description: ${error.message}`,
      );
    }
  }
}
