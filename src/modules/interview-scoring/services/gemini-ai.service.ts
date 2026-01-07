import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

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
  finalRecommendation: 'PASS' | 'FAIL';
  criteria: {
    clarity: number;
    logic: number;
    learningAttitude: number;
    itAwareness: number;
    professionalAttitude: number;
  };
  summary: string;
  redFlags?: string[];
  detailedFeedback?: any;
}

@Injectable()
export class GeminiAiService {
  private readonly logger = new Logger(GeminiAiService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not found in environment variables');
      throw new Error('OPENAI_API_KEY is required');
    }
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async scoreInterview(input: InterviewInput): Promise<AiScoringResult> {
    try {
      const prompt = this.buildPrompt(input);
      this.logger.debug(`Sending prompt to OpenAI for job: ${input.jobTitle}`);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interviewer evaluating candidates. Always respond with valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const text = completion.choices[0].message.content;

      if (!text) {
        throw new Error('No content received from OpenAI');
      }

      this.logger.debug(`Received response from OpenAI`);

      // Parse JSON response
      const parsedResult = JSON.parse(text);

      // Validate and normalize the result
      return this.normalizeResult(parsedResult);
    } catch (error) {
      this.logger.error(`Error scoring interview with OpenAI: ${error.message}`, error.stack);
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
      return `Bạn là một chuyên gia phỏng vấn đang đánh giá ứng viên fresher/junior cho vị trí ${input.jobTitle}.

Đánh giá cẩn thận các câu trả lời phỏng vấn sau:

${questionsText}

📋 ĐÁNH GIÁ THEO 5 TIÊU CHÍ (mỗi tiêu chí 0-10 điểm):

① Độ Rõ Ràng Diễn Đạt (Clarity of Expression) - 0-10 điểm
Kiểm tra:
- Câu văn rõ ràng, súc tích
- Mỗi câu truyền tải một ý
- Ít mơ hồ, dễ hiểu

Dấu hiệu tốt: Câu trả lời có cấu trúc, đoạn ngắn gọn
Dấu hiệu xấu: Câu quá dài, đại từ không rõ, lan man

Thang điểm:
- 0-2: Khó hiểu
- 3-5: Hiểu được nhưng rối
- 6-7: Khá rõ ràng
- 8-10: Rõ ràng, súc tích, logic

② Tư Duy Logic (Logical Thinking) - 0-10 điểm
Kiểm tra:
- Nguyên nhân → kết quả rõ ràng
- Lập luận từng bước
- Câu trả lời khớp với câu hỏi

Dấu hiệu tốt: "Đầu tiên..., sau đó..., do đó..."
Dấu hiệu xấu: Nhảy ý, kể chuyện không liên quan

Ví dụ tốt: "Em thất bại khi học X vì..., nên em đã thay đổi cách tiếp cận bằng..."

③ Thái Độ Học Hỏi & Phát Triển (Learning Attitude & Growth Mindset) - 0-10 điểm
⭐ QUAN TRỌNG NHẤT với fresher

Kiểm tra:
- Có ví dụ tự học không?
- Cách xử lý khó khăn
- Sẵn sàng cải thiện

Dấu hiệu tốt: Đề cập khóa học online, thực hành, sửa lỗi
Dấu hiệu xấu: Đổ lỗi người khác, nói "Em không giỏi học"

④ Nhận Thức IT Cơ Bản (Basic IT Awareness) - 0-10 điểm
Không cần sâu - chỉ cần có nhận thức

Kiểm tra:
- Biết các khái niệm cơ bản
- Có thể giải thích đơn giản
- Dùng thuật ngữ đúng (dù chưa sâu)

Dấu hiệu tốt: Giải thích HTML, API, Git bằng ngôn ngữ của mình
Dấu hiệu xấu: Copy-paste định nghĩa không hiểu

⑤ Thái Độ Chuyên Nghiệp & Trung Thực (Professional Attitude & Honesty) - 0-10 điểm
Kiểm tra:
- Tự đánh giá thực tế
- Thừa nhận điểm yếu
- Giọng điệu tôn trọng

🚩 Cờ đỏ:
- Thổi phồng kỹ năng
- "Em biết tất cả", "Không có điểm yếu"
- Câu trả lời giống ChatGPT, chung chung, không chi tiết cá nhân

⚠️ CÁC CỜ ĐỎ CẦN KIỂM TRA (độc lập với điểm số):

| Cờ Đỏ | Lý Do |
|--------|-------|
| Câu trả lời không khớp câu hỏi | Kỹ năng lắng nghe kém |
| Copy-paste nội dung chung chung | Thiếu chính trực |
| Đổ lỗi thầy cô/công ty | Tư duy tiêu cực |
| Câu trả lời cực kỳ ngắn/lười biếng | Thiếu nỗ lực |
| Quá tự tin không có bằng chứng | Thái độ rủi ro |

👉 1 cờ đỏ lớn = cần phỏng vấn trực tiếp

Trả về kết quả theo định dạng JSON sau (CHỈ trả về JSON hợp lệ, không có văn bản bổ sung):

{
  "totalScore": <tổng điểm của 5 tiêu chí (0-50)>,
  "finalRecommendation": "<PASS | FAIL>",
  "criteria": {
    "clarity": <0-10>,
    "logic": <0-10>,
    "learningAttitude": <0-10>,
    "itAwareness": <0-10>,
    "professionalAttitude": <0-10>
  },
  "redFlags": ["<cờ đỏ 1 nếu có>", "<cờ đỏ 2 nếu có>"],
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

📊 HƯỚNG DẪN CHẤM ĐIỂM (Tổng: 50 điểm):
- 40-50 điểm: ✅ PASS (Ứng viên xuất sắc - rất đáp ứng yêu cầu)
- 25-39 điểm: ✅ PASS (Ứng viên tốt - đáp ứng yêu cầu)
- 0-24 điểm: ❌ FAIL (Chưa đáp ứng yêu cầu)

Lưu ý: Dự án hướng đến giáo dục và phát triển, nên ưu tiên thái độ học hỏi hơn kỹ thuật sâu. Hãy khách quan, công bằng và cung cấp phản hồi mang tính xây dựng.`;
    }

    // English prompt
    return `You are a senior interviewer evaluating fresher/junior candidates for a ${input.jobTitle} position.

Evaluate the following interview answers carefully:

${questionsText}

📋 EVALUATE BASED ON 5 CORE DIMENSIONS (each scored 0-10):

① Clarity of Expression (0-10)
What to check:
- Clear sentences
- One idea per sentence
- Minimal ambiguity

Signals:
✅ Structured answers, short paragraphs
❌ Very long sentences, unclear pronouns, rambling

Score guide:
- 0-2: Hard to understand
- 3-5: Understandable but messy
- 6-7: Quite clear
- 8-10: Clear, concise, logical

② Logical Thinking (0-10)
What to check:
- Cause → effect
- Step-by-step reasoning
- Answer matches the question

Signals:
✅ "First…, then…, therefore…"
❌ Jumping ideas, unrelated stories

Example: "I failed to learn X because…, so I changed my approach by…"

③ Learning Attitude & Growth Mindset (0-10)
⭐ MOST IMPORTANT for freshers

What to check:
- Self-learning examples
- Handling difficulty
- Willingness to improve

Signals:
✅ Mentions online courses, practice, fixing mistakes
❌ Blames others, says "I'm not good at learning"

④ Basic IT Awareness (0-10)
Not depth — awareness

What to check:
- Knows basic concepts
- Can explain simply
- Uses correct terms (even if shallow)

Signals:
✅ Can explain HTML, API, Git in own words
❌ Copy-paste definitions without understanding

⑤ Professional Attitude & Honesty (0-10)
What to check:
- Realistic self-assessment
- Admits weaknesses
- Respectful tone

🚩 Red flags:
- Overclaiming skills
- "I know everything", "No weaknesses"
- ChatGPT-like generic answers with no personal detail

⚠️ RED FLAGS (check independently of score):

| Red Flag | Why |
|----------|-----|
| Answers don't match questions | Poor listening |
| Copy-paste generic content | Low integrity |
| Blaming teachers/company | Poor mindset |
| Extremely short / lazy answers | Low effort |
| Overly confident without evidence | Risky attitude |

👉 1 major red flag = manual interview required

Provide your evaluation in the following JSON format (respond with ONLY valid JSON, no additional text):

{
  "totalScore": <sum of all 5 criteria scores (0-50)>,
  "finalRecommendation": "<PASS | FAIL>",
  "criteria": {
    "clarity": <0-10>,
    "logic": <0-10>,
    "learningAttitude": <0-10>,
    "itAwareness": <0-10>,
    "professionalAttitude": <0-10>
  },
  "redFlags": ["<red flag 1 if any>", "<red flag 2 if any>"],
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

📊 SCORING MODEL (Total: 50 points):
- 40-50: ✅ PASS (Excellent candidate - highly qualified)
- 25-39: ✅ PASS (Good candidate - meets requirements)
- 0-24: ❌ FAIL (Does not meet requirements)

Note: For education-oriented projects, prioritize attitude over deep technical skills. Be objective, fair, and provide constructive feedback.`;
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
      (criteria.clarity || 0) +
      (criteria.logic || 0) +
      (criteria.learningAttitude || 0) +
      (criteria.itAwareness || 0) +
      (criteria.professionalAttitude || 0);

    // Determine recommendation based on score if not provided
    let recommendation = rawResult.finalRecommendation;
    if (!recommendation) {
      if (totalScore >= 25) recommendation = 'PASS';
      else recommendation = 'FAIL';
    }

    return {
      totalScore,
      finalRecommendation: recommendation as 'PASS' | 'FAIL',
      criteria: {
        clarity: criteria.clarity || 0,
        logic: criteria.logic || 0,
        learningAttitude: criteria.learningAttitude || 0,
        itAwareness: criteria.itAwareness || 0,
        professionalAttitude: criteria.professionalAttitude || 0,
      },
      summary: rawResult.summary || 'No summary provided',
      redFlags: rawResult.redFlags || [],
      detailedFeedback: rawResult.detailedFeedback || null,
    };
  }
}
