import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface InterviewQuestion {
  question: string;
  answer: string;
  criteria?: string[] | null;
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
  group2Analysis?: {
    learningAttitude?: {
      score: number;
      evidence: string[];
    };
    professionalAttitude?: {
      score: number;
      evidence: string[];
    };
  };
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
      console.log('🔍 Parsed AI Response:', JSON.stringify(parsedResult, null, 2));
      console.log('🔍 group2Analysis from AI:', parsedResult.group2Analysis);

      // Validate and normalize the result
      return this.normalizeResult(parsedResult);
    } catch (error) {
      this.logger.error(`Error scoring interview with OpenAI: ${error.message}`, error.stack);
      throw new Error(`AI scoring failed: ${error.message}`);
    }
  }

  private buildPrompt(input: InterviewInput): string {
    const questionsText = input.questions
      .map((q, index) => {
        const criteriaText = q.criteria && q.criteria.length > 0 
          ? `\nCriteria: ${q.criteria.join(', ')}`
          : '';
        return `Câu ${index + 1}: ${q.question}${criteriaText}\nTrả lời: ${q.answer}`;
      })
      .join('\n\n');
      console.log('questionsText:', questionsText);
    // Detect if input is in Vietnamese
    const isVietnamese = this.detectVietnamese(input);
    
    if (isVietnamese) {
      return `Bạn là chuyên gia phỏng vấn đánh giá ứng viên fresher/junior/senior cho vị trí ${input.jobTitle}.
 PHƯƠNG PHÁP CHẤM ĐIỂM THEO 2 NHÓM TIÊU CHÍ:

**NHÓM 1 - Tiêu chí Kỹ thuật/Kiến thức (chấm TỪNG CÂU):**
- Basic IT Awareness (Nhận thức IT cơ bản)
- Logical Thinking (Tư duy logic)
- Clarity of Expression (Diễn đạt rõ ràng)

**NHÓM 2 - Tiêu chí Hành vi/Thái độ (chấm TOÀN BỘ BÀI):**
- Learning Attitude & Growth Mindset (Thái độ học hỏi)
- Professional Attitude & Honesty (Thái độ chuyên nghiệp)

---

CÁC CÂU HỎI VÀ TRẢ LỜI:

${questionsText}

---

HƯỚNG DẪN CHI TIẾT:

**CHO NHÓM 1 (chấm từng câu dựa trên Criteria của câu hỏi):**

Với mỗi câu hỏi:
- Xem "Criteria" của câu hỏi đó
- CHỈ chấm điểm các tiêu chí NHÓM 1 có trong Criteria
- Nếu tiêu chí KHÔNG có trong Criteria → đặt null
- Mỗi tiêu chí: 0-10 điểm

Ví dụ:
- Câu 1 có Criteria: "Basic IT Awareness, Clarity of Expression, Logical Thinking"
  → Chấm 3 tiêu chí này
- Câu 1 có Criteria: "Basic IT Awareness, Clarity of Expression"
  → Chấm 2 tiêu chí này, Logical Thinking = null

# SCORING RUBRIC (Tiêu chí chấm điểm)

## 1. BASIC IT AWARENESS (Nhận thức IT cơ bản)
*Mục tiêu: Đánh giá độ hiểu bản chất, không đánh giá thuật ngữ sáo rỗng.*
- **0 điểm:** Sai hoàn toàn, nhầm lẫn khái niệm cơ bản (VD: Frontend ≈ Backend), hoặc không trả lời.
- **1-2 điểm:** Nhắc lại định nghĩa mơ hồ, học vẹt, không giải thích được bằng lời riêng.
- **3-4 điểm:** Hiểu bề mặt, đúng tên gọi nhưng thiếu ngữ cảnh/ví dụ. Giải thích rời rạc.
- **5-6 điểm:** Hiểu đúng bản chất. Dùng ngôn ngữ đời thường dễ hiểu. Thuật ngữ sử dụng chính xác.
- **7-8 điểm:** Hiểu sâu. Có ví dụ thực tế hoặc kinh nghiệm đã làm. Nêu được ưu/nhược điểm cơ bản.
- **9 điểm:** Rất chắc chắn. Liên hệ hệ thống thực tế tốt. Không thừa, không thiếu.
- **10 điểm:** Master. Giải thích cho người khác hiểu được. Thể hiện rõ tư duy của người đã làm thực tế (bối cảnh, hệ quả).

## 2. LOGICAL THINKING (Tư duy Logic)
*Mục tiêu: Đánh giá luồng suy nghĩ (Problem Solving), không đánh giá trí nhớ.*
⚠️ **QUY TẮC ĐẶC BIỆT:** Nếu câu hỏi thuộc dạng "Định nghĩa/Lý thuyết thuần túy" (Knowledge-based) -> Trả về điểm 'N/A'.
- **0 điểm:** Mâu thuẫn logic, trả lời lạc đề, nhảy ý loạn xạ.
- **1-2 điểm:** Lập luận yếu, không có cấu trúc (Mở bài/Thân bài/Kết luận), thiếu quan hệ nhân-quả.
- **3-4 điểm:** Có logic cơ bản nhưng trình tự lộn xộn, thiếu bước trung gian.
- **5-6 điểm:** Trình tự rõ ràng (Bước 1 -> Bước 2 -> Kết luận). Đi đúng trọng tâm.
- **7-8 điểm:** Chặt chẽ. Biết phân tích đánh đổi (trade-off). Giải thích được "Tại sao" (Why) thay vì chỉ "Làm gì" (What).
- **9 điểm:** Tư duy sâu, dự đoán được các trường hợp ngoại lệ (edge cases).
- **10 điểm:** Tư duy hệ thống (System Thinking). Có khả năng trừu tượng hóa và đề xuất cải tiến mở rộng.

## 3. CLARITY OF EXPRESSION (Diễn đạt)
*Mục tiêu: Đánh giá khả năng truyền đạt thông tin.*
- **0 điểm:** Lủng củng, sai ngữ pháp nặng, người nghe không hiểu gì.
- **1-2 điểm:** Dùng nhiều từ đệm (à, ừ, cái đó...), không cấu trúc, diễn đạt kém.
- **3-4 điểm:** Hiểu được nhưng dài dòng, lặp ý, lan man.
- **5-6 điểm:** Rõ ràng, tách bạch ý chính, cấu trúc câu ổn.
- **7-8 điểm:** Mạch lạc. Biết nhấn mạnh trọng tâm. Dùng thuật ngữ đúng lúc, đúng chỗ.
- **9 điểm:** Rất dễ hiểu ngay cả với người không chuyên (Non-tech).
- **10 điểm:** Xuất sắc. Ngắn gọn, súc tích (Concise). Phong cách chuyên nghiệp như đang training team.

# CONSTRAINT (Quy tắc bắt buộc)
1. **Critical Thinking:** Không chấm điểm cao chỉ vì câu trả lời dài hoặc dùng nhiều thuật ngữ tiếng Anh ("buzzwords") nếu bản chất sai.
2. **Score Selection:** Nếu phân vân giữa 2 mức điểm (ví dụ 6 và 7), BẮT BUỘC chọn mức THẤP HƠN (6).
3. **Reasoning:** Phải cung cấp lý do ngắn gọn (Evidence) trích xuất từ câu trả lời để bảo vệ số điểm đã cho.

**CHO NHÓM 2 (chấm toàn bộ bài phỏng vấn):**

Đọc TẤT CẢ câu trả lời và đánh giá tổng thể 2 tiêu chí sau:

DEFINED ENUMS (Bảng định danh bắt buộc)

Khi gán nhãn (Labeling), bạn CHỈ ĐƯỢC PHÉP sử dụng các giá trị trong danh sách dưới đây. Tuyệt đối không tự sáng tạo từ mới.

1. VALID TAGS:

"Honesty": Sự trung thực, dám nhận sai, chính trực.
"Communication": Kỹ năng diễn đạt, lắng nghe, chốt vấn đề.
"Problem_Solving": Cách tiếp cận và xử lý vấn đề, tư duy giải pháp.
"Technical_Depth": Độ sâu kiến thức chuyên môn, hiểu bản chất.
"Defensive": Thái độ phòng thủ, bảo thủ, đổ lỗi, bao biện.
"Curiosity": Sự tò mò, ham học hỏi, cầu tiến.

2. VALID SENTIMENTS:

"Positive": Tín hiệu tốt, mang tính xây dựng.
"Negative": Tín hiệu xấu, cảnh báo rủi ro (red flag).
"Neutral": Trung tính, mô tả sự thật khách quan.

INSTRUCTION: CHAIN OF THOUGHT PROCESS

Thực hiện quy trình suy luận 4 bước sau:

STEP 1: Evidence Extraction (Trích xuất & Gán nhãn)
Quét hội thoại, tìm các câu nói thể hiện rõ tính cách/tư duy.
Trích dẫn nguyên văn ("quote").
Map câu nói đó vào duy nhất 01 Tag phù hợp nhất trong danh sách "VALID TAGS".
Xác định Sentiment trong danh sách "VALID SENTIMENTS".
STEP 2: Conflict & Context Analysis

Phân tích sự thay đổi thái độ (VD: Ban đầu "Defensive" nhưng sau đó chuyển sang "Honesty" hoặc "Curiosity").
Xác định xem các tín hiệu "Negative" là bản chất cố hữu hay do áp lực tâm lý nhất thời.

STEP 3: Reasoning (Lập luận)

Tổng hợp dữ liệu từ Step 1 & 2 để lập luận cho 2 nhóm điểm số:
Learning Attitude & Growth Mindset: Dựa nhiều vào tag "Curiosity", "Technical_Depth", và cách xử lý khi gặp cái mới.
Professional Attitude & Honesty: Dựa nhiều vào tag "Honesty", "Defensive", "Communication".
STEP 4: Scoring (Chấm điểm 0-10)

< 5: Nhiều tag "Defensive", "Negative".
5 - 6.5: Trung bình, còn thụ động.
7 - 8.5: Tốt, nhiều tag "Positive", "Curiosity".
9 - 10: Xuất sắc, tư duy "Problem_Solving" và "Honesty" cao.

---

📊 **OUTPUT JSON (CHỈ trả về JSON hợp lệ):**

{
  "finalRecommendation": "PASS|FAIL",
  "criteria": {
    "clarity": <trung bình từ các câu có tiêu chí này, hoặc 0>,
    "logic": <trung bình từ các câu có tiêu chí này, hoặc 0>,
    "learningAttitude": <điểm toàn bộ bài 0-10>,
    "itAwareness": <trung bình từ các câu có tiêu chí này, hoặc 0>,
    "professionalAttitude": <điểm toàn bộ bài 0-10>
  },
  "redFlags": ["<cờ đỏ nếu có>"],
  "summary": "<Đánh giá tổng quan 5-10 câu bằng tiếng Việt>",
  "detailedFeedback": [
    {
      "questionIndex": 0,
      "questionCriteria": ["<criteria của câu hỏi>"],
      "scores": {
        "clarity": <0-10 hoặc null nếu không có trong criteria>,
        "logic": <0-10 hoặc null nếu không có trong criteria>,
        "itAwareness": <0-10 hoặc null nếu không có trong criteria>
      },
      "strengths": ["<điểm mạnh>"],
      "weaknesses": ["<điểm yếu>"]
    }
  ],
  "group2Analysis": {
    "learningAttitude": {
      "score": <0-10>,
      "evidence": ["<bằng chứng từ các câu trả lời>"]
    },
    "professionalAttitude": {
      "score": <0-10>,
      "evidence": ["<bằng chứng từ các câu trả lời>"]
    }
  }
}

**Chấm điểm:** 40-50 PASS xuất sắc | 25-39 PASS tốt | 0-24 FAIL`;
}

    // English prompt
    return `You are an expert interviewer evaluating fresher/junior/senior candidates for a ${input.jobTitle} position.

SCORING METHOD - 2 GROUPS OF CRITERIA:

**GROUP 1 - Technical/Knowledge Criteria (score PER QUESTION):**
- Basic IT Awareness
- Logical Thinking
- Clarity of Expression

**GROUP 2 - Behavioral/Attitude Criteria (score ENTIRE INTERVIEW):**
- Learning Attitude & Growth Mindset
- Professional Attitude & Honesty

---

QUESTIONS AND ANSWERS:

${questionsText}

---

📋 DETAILED INSTRUCTIONS:

**FOR GROUP 1 (score each question based on its Criteria):**

For each question:
- Check the "Criteria" of that question
- ONLY score GROUP 1 criteria that are in the Criteria list
- If a criterion is NOT in Criteria → set null
- Each criterion: 0-10 points

Example:
- Question 1 has Criteria: "Basic IT Awareness, Clarity of Expression, Logical Thinking"
  → Score these 3 criteria
- Question 1 has Criteria: "Basic IT Awareness, Clarity of Expression"
  → Score these 2, set Logical Thinking = null

# SCORING RUBRIC (Scoring Criteria)

## 1. BASIC IT AWARENESS
*Objective: Assess understanding of concepts, not memorization of buzzwords.*
- **0 points:** Completely wrong, confuses basic concepts (e.g., Frontend ≈ Backend), or no answer.
- **1-2 points:** Vague parroting of definitions, rote learning, cannot explain in own words.
- **3-4 points:** Surface understanding, correct terminology but lacks context/examples. Fragmented explanation.
- **5-6 points:** Understands core concept. Uses everyday language that's easy to understand. Terminology used accurately.
- **7-8 points:** Deep understanding. Has real-world examples or hands-on experience. Can state basic pros/cons.
- **9 points:** Very confident. Good connection to real systems. Nothing excessive, nothing missing.
- **10 points:** Master level. Can explain to others clearly. Shows thinking of someone with practical experience (context, consequences).

## 2. LOGICAL THINKING
*Objective: Assess reasoning flow (Problem Solving), not memorization.*
⚠️ **SPECIAL RULE:** If question is "Definition/Pure Theory" (Knowledge-based) -> Return score 'N/A'.
- **0 points:** Logical contradictions, off-topic answer, jumping ideas randomly.
- **1-2 points:** Weak reasoning, no structure (Intro/Body/Conclusion), lacks cause-effect relationships.
- **3-4 points:** Basic logic but messy sequence, missing intermediate steps.
- **5-6 points:** Clear sequence (Step 1 -> Step 2 -> Conclusion). Stays on point.
- **7-8 points:** Rigorous. Analyzes trade-offs. Explains "Why" (not just "What").
- **9 points:** Deep thinking, anticipates edge cases.
- **10 points:** System Thinking. Can abstract and propose extended improvements.

## 3. CLARITY OF EXPRESSION
*Objective: Assess ability to communicate information.*
- **0 points:** Incoherent, severe grammar errors, listener understands nothing.
- **1-2 points:** Many filler words (um, uh, that thing...), no structure, poor expression.
- **3-4 points:** Understandable but wordy, repetitive, rambling.
- **5-6 points:** Clear, separates main ideas, decent sentence structure.
- **7-8 points:** Coherent. Emphasizes key points. Uses terminology at the right time and place.
- **9 points:** Very easy to understand even for non-technical people.
- **10 points:** Excellent. Brief, concise. Professional style like training a team.

# CONSTRAINT (Mandatory Rules)
1. **Critical Thinking:** Don't score high just because answer is long or uses many English buzzwords if the core is wrong.
2. **Score Selection:** If torn between 2 score levels (e.g., 6 and 7), MUST choose the LOWER level (6).
3. **Reasoning:** Must provide brief reason (Evidence) extracted from the answer to defend the score given.

**FOR GROUP 2 (score entire interview):**

Read ALL answers and evaluate these 2 criteria holistically:

DEFINED ENUMS (Mandatory Label Set)

When labeling, you MAY ONLY use values from the lists below. Absolutely no improvising new terms.

1. VALID TAGS:

"Honesty": Truthfulness, admits mistakes, integrity.
"Communication": Expression skills, listening, clarifying issues.
"Problem_Solving": Approach to handling problems, solution thinking.
"Technical_Depth": Depth of technical knowledge, understanding essence.
"Defensive": Defensive attitude, conservative, blames others, makes excuses.
"Curiosity": Curiosity, eagerness to learn, drive for improvement.

2. VALID SENTIMENTS:

"Positive": Good signal, constructive.
"Negative": Bad signal, risk warning (red flag).
"Neutral": Neutral, objective fact description.

INSTRUCTION: CHAIN OF THOUGHT PROCESS

Execute this 4-step reasoning process:

STEP 1: Evidence Extraction (Extract & Label)
Scan conversation, find statements clearly showing personality/thinking.
Quote verbatim ("quote").
Map that statement to exactly 01 most appropriate Tag from "VALID TAGS" list.
Determine Sentiment from "VALID SENTIMENTS" list.

STEP 2: Conflict & Context Analysis

Analyze attitude changes (e.g., initially "Defensive" but later shifts to "Honesty" or "Curiosity").
Determine if "Negative" signals are inherent nature or temporary psychological pressure.

STEP 3: Reasoning (Argumentation)

Synthesize data from Steps 1 & 2 to argue for 2 score groups:
Learning Attitude & Growth Mindset: Heavily based on "Curiosity", "Technical_Depth" tags, and how they handle new things.
Professional Attitude & Honesty: Heavily based on "Honesty", "Defensive", "Communication" tags.

STEP 4: Scoring (Score 0-10)

< 5: Many "Defensive", "Negative" tags.
5 - 6.5: Average, still passive.
7 - 8.5: Good, many "Positive", "Curiosity" tags.
9 - 10: Excellent, high "Problem_Solving" and "Honesty" thinking.

---

📊 **JSON OUTPUT (respond with ONLY valid JSON):**

{
  "finalRecommendation": "PASS|FAIL",
  "criteria": {
    "clarity": <average from questions with this criterion, or 0>,
    "logic": <average from questions with this criterion, or 0>,
    "learningAttitude": <score for entire interview 0-10>,
    "itAwareness": <average from questions with this criterion, or 0>,
    "professionalAttitude": <score for entire interview 0-10>
  },
  "redFlags": ["<red flag if any>"],
  "summary": "<2-3 sentence overall evaluation in English>",
  "detailedFeedback": [
    {
      "questionIndex": 0,
      "questionCriteria": ["<criteria of this question>"],
      "scores": {
        "clarity": <0-10 or null if not in criteria>,
        "logic": <0-10 or null if not in criteria>,
        "itAwareness": <0-10 or null if not in criteria>
      },
      "strengths": ["<strength>"],
      "weaknesses": ["<weakness>"]
    }
  ],
  "group2Analysis": {
    "learningAttitude": {
      "score": <0-10>,
      "evidence": ["<evidence from answers>"]
    },
    "professionalAttitude": {
      "score": <0-10>,
      "evidence": ["<evidence from answers>"]
    }
  }
}

**Scoring:** 40-50 PASS excellent | 25-39 PASS good | 0-24 FAIL`;
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
      group2Analysis: rawResult.group2Analysis || null,
    };
  }
}
