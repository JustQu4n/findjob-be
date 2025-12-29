import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface InterviewQuestion {
  question: string;
  answer: string;
}

export interface InterviewInput {
  jobTitle: string;
  questions: InterviewQuestion[];
}

export interface AiScoringResult {
  totalScore: number;
  finalRecommendation: 'STRONG_FIT' | 'POTENTIAL' | 'NOT_FIT';
  criteria: {
    technical: number;
    logic: number;
    experience: number;
    clarity: number;
    relevance: number;
  };
  summary: string;
  detailedFeedback?: any;
}

@Injectable()
export class GeminiAiService {
  private readonly logger = new Logger(GeminiAiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not found in environment variables');
      throw new Error('GEMINI_API_KEY is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async scoreInterview(input: InterviewInput): Promise<AiScoringResult> {
    try {
      const prompt = this.buildPrompt(input);
      this.logger.debug(`Sending prompt to Gemini AI for job: ${input.jobTitle}`);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      this.logger.debug(`Received response from Gemini AI`);

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }

      const parsedResult = JSON.parse(jsonMatch[0]);

      // Validate and normalize the result
      return this.normalizeResult(parsedResult);
    } catch (error) {
      this.logger.error(`Error scoring interview with Gemini AI: ${error.message}`, error.stack);
      throw new Error(`AI scoring failed: ${error.message}`);
    }
  }

  private buildPrompt(input: InterviewInput): string {
    const questionsText = input.questions
      .map((q, index) => `Question ${index + 1}: ${q.question}\nAnswer: ${q.answer}`)
      .join('\n\n');

    // Detect if input is in Vietnamese
    const isVietnamese = this.detectVietnamese(input);

    if (isVietnamese) {
      return `Bạn là một chuyên gia phỏng vấn kỹ thuật đang đánh giá ứng viên cho vị trí ${input.jobTitle}.

Đánh giá cẩn thận các câu trả lời phỏng vấn sau:

${questionsText}

Đánh giá dựa trên 5 tiêu chí sau (thang điểm 0-10):
1. Độ chính xác kỹ thuật - Câu trả lời có chính xác và vững chắc về mặt kỹ thuật không?
2. Tư duy logic - Lập luận có cấu trúc rõ ràng và logic không?
3. Độ sâu kinh nghiệm - Câu trả lời có thể hiện kinh nghiệm thực tế không?
4. Độ rõ ràng diễn đạt - Câu trả lời có được diễn đạt rõ ràng không?
5. Mức độ liên quan - Câu trả lời có phù hợp với vị trí ${input.jobTitle} không?

Trả về kết quả theo định dạng JSON sau (CHỈ trả về JSON hợp lệ, không có văn bản bổ sung):

{
  "totalScore": <tổng điểm của 5 tiêu chí>,
  "finalRecommendation": "<STRONG_FIT | POTENTIAL | NOT_FIT>",
  "criteria": {
    "technical": <0-10>,
    "logic": <0-10>,
    "experience": <0-10>,
    "clarity": <0-10>,
    "relevance": <0-10>
  },
  "summary": "<Đánh giá tổng quan 2-3 câu bằng tiếng Việt>",
  "detailedFeedback": [
    {
      "questionIndex": 0,
      "strengths": ["<điểm mạnh 1 bằng tiếng Việt>", "<điểm mạnh 2>"],
      "weaknesses": ["<điểm yếu 1 bằng tiếng Việt>"],
      "score": <điểm câu hỏi>
    }
  ]
}

Hướng dẫn chấm điểm:
- Tổng điểm 40-50: STRONG_FIT (ứng viên xuất sắc)
- Tổng điểm 25-39: POTENTIAL (ứng viên tốt, cần phát triển thêm)
- Tổng điểm 0-24: NOT_FIT (chưa đáp ứng yêu cầu)

Hãy khách quan, công bằng và cung cấp phản hồi mang tính xây dựng. Tập trung vào nội dung và chất lượng câu trả lời.`;
    }

    // English prompt
    return `You are a senior technical interviewer evaluating candidates for a ${input.jobTitle} position.

Evaluate the following interview answers carefully:

${questionsText}

For each answer, evaluate based on these 5 dimensions (0-10 scale):
1. Technical Accuracy - How technically correct and sound is the answer?
2. Logical Thinking - How well-structured and logical is the reasoning?
3. Depth of Experience - Does the answer show practical, real-world experience?
4. Clarity of Expression - How clear and well-articulated is the answer?
5. Relevance to Job - How relevant is the answer to the ${input.jobTitle} role?

Provide your evaluation in the following JSON format (respond with ONLY valid JSON, no additional text):

{
  "totalScore": <sum of all 5 criteria scores>,
  "finalRecommendation": "<STRONG_FIT | POTENTIAL | NOT_FIT>",
  "criteria": {
    "technical": <0-10>,
    "logic": <0-10>,
    "experience": <0-10>,
    "clarity": <0-10>,
    "relevance": <0-10>
  },
  "summary": "<2-3 sentence overall evaluation in English>",
  "detailedFeedback": [
    {
      "questionIndex": 0,
      "strengths": ["<strength 1 in English>", "<strength 2>"],
      "weaknesses": ["<weakness 1 in English>"],
      "score": <individual question score>
    }
  ]
}

Scoring Guidelines:
- Total Score 40-50: STRONG_FIT (excellent candidate)
- Total Score 25-39: POTENTIAL (good candidate, may need development)
- Total Score 0-24: NOT_FIT (does not meet requirements)

Be objective, fair, and provide constructive feedback. Focus on the content and quality of answers, not on superficial factors.`;
  }

  private detectVietnamese(input: InterviewInput): boolean {
    // Check if questions or answers contain Vietnamese characters
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    
    const allText = input.jobTitle + ' ' + 
      input.questions.map(q => q.question + ' ' + q.answer).join(' ');
    
    return vietnamesePattern.test(allText);
  }

  private normalizeResult(rawResult: any): AiScoringResult {
    // Ensure all required fields exist
    const criteria = rawResult.criteria || {};
    const totalScore = rawResult.totalScore || 
      (criteria.technical || 0) +
      (criteria.logic || 0) +
      (criteria.experience || 0) +
      (criteria.clarity || 0) +
      (criteria.relevance || 0);

    // Determine recommendation based on score if not provided
    let recommendation = rawResult.finalRecommendation;
    if (!recommendation) {
      if (totalScore >= 40) recommendation = 'STRONG_FIT';
      else if (totalScore >= 25) recommendation = 'POTENTIAL';
      else recommendation = 'NOT_FIT';
    }

    return {
      totalScore,
      finalRecommendation: recommendation as 'STRONG_FIT' | 'POTENTIAL' | 'NOT_FIT',
      criteria: {
        technical: criteria.technical || 0,
        logic: criteria.logic || 0,
        experience: criteria.experience || 0,
        clarity: criteria.clarity || 0,
        relevance: criteria.relevance || 0,
      },
      summary: rawResult.summary || 'No summary provided',
      detailedFeedback: rawResult.detailedFeedback || null,
    };
  }
}
