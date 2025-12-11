# Job Description Summarization Feature

## Overview
Tính năng tóm tắt Job Description (JD) sử dụng Gemini AI để phân tích và tóm tắt chi tiết công việc một cách thông minh.

## Features

### 1. **Language Detection**
- Tự động phát hiện ngôn ngữ của JD (Vietnamese, English, hoặc ngôn ngữ khác)
- Đảm bảo tóm tắt được tạo ra bằng chính ngôn ngữ của JD gốc

### 2. **Intelligent Summarization**
- Tóm tắt toàn diện trong 200-300 từ
- Trung thực với nội dung gốc, không thêm thông tin không có trong JD
- Giọng văn chuyên nghiệp phù hợp với JD gốc

### 3. **Structured Key Points Extraction**
Trích xuất các thông tin quan trọng:
- **Position**: Vị trí/chức danh công việc
- **Requirements**: Yêu cầu về kỹ năng, kinh nghiệm
- **Responsibilities**: Trách nhiệm công việc chính
- **Benefits**: Quyền lợi, phúc lợi
- **Experience**: Mức độ kinh nghiệm yêu cầu
- **Skills**: Kỹ năng cần thiết

### 4. **Authentication Required**
- Chỉ người dùng đã đăng nhập mới có thể sử dụng tính năng
- Sử dụng JWT authentication

## API Endpoint

### POST /api/ai-assistant/summarize-jd

**Authentication**: Required (JWT Bearer token)

**Request Body:**
```json
{
  "jobDescription": "string (Job description text)"
}
```

**Response:**
```json
{
  "summary": "Comprehensive summary in original language",
  "detectedLanguage": "Vietnamese | English | Other",
  "keyPoints": {
    "position": "Job title",
    "requirements": ["Requirement 1", "Requirement 2"],
    "responsibilities": ["Responsibility 1", "Responsibility 2"],
    "benefits": ["Benefit 1", "Benefit 2"],
    "experience": "Experience level",
    "skills": ["Skill 1", "Skill 2"]
  },
  "timestamp": "2025-12-11T10:00:00.000Z"
}
```

## Usage Examples

### Example 1: Vietnamese Job Description

**Request:**
```bash
curl -X POST http://localhost:5000/api/ai-assistant/summarize-jd \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Công ty ABC tuyển dụng Backend Developer\n\nMô tả công việc:\n- Phát triển và bảo trì các API RESTful\n- Làm việc với Node.js, TypeScript, NestJS\n- Thiết kế database với PostgreSQL\n- Tối ưu hóa performance và security\n\nYêu cầu:\n- 2+ năm kinh nghiệm Backend\n- Thành thạo Node.js và TypeScript\n- Kinh nghiệm với NestJS, PostgreSQL\n- Hiểu biết về microservices, Docker\n- Kỹ năng làm việc nhóm tốt\n\nQuyền lợi:\n- Lương: 20-30 triệu (negotiable)\n- Làm việc hybrid (3 ngày văn phòng, 2 ngày WFH)\n- Bảo hiểm đầy đủ\n- Review lương 2 lần/năm\n- Môi trường trẻ, năng động"
  }'
```

**Response:**
```json
{
  "summary": "Công ty ABC đang tìm kiếm Backend Developer với ít nhất 2 năm kinh nghiệm để tham gia phát triển và bảo trì hệ thống API RESTful. Ứng viên sẽ làm việc chủ yếu với Node.js, TypeScript và NestJS framework, đồng thời chịu trách nhiệm thiết kế và tối ưu hóa database PostgreSQL. Yêu cầu thành thạo các công nghệ backend hiện đại như microservices và Docker, cùng với kỹ năng làm việc nhóm tốt. Công ty cung cấp mức lương hấp dẫn từ 20-30 triệu đồng có thể thương lượng, chế độ làm việc linh hoạt hybrid (3 ngày văn phòng, 2 ngày từ xa), bảo hiểm đầy đủ theo luật, và cơ hội review tăng lương 2 lần mỗi năm. Môi trường làm việc trẻ trung, năng động, phù hợp cho những ai muốn phát triển sự nghiệp trong lĩnh vực công nghệ.",
  "detectedLanguage": "Vietnamese",
  "keyPoints": {
    "position": "Backend Developer",
    "requirements": [
      "2+ năm kinh nghiệm Backend Development",
      "Thành thạo Node.js và TypeScript",
      "Kinh nghiệm với NestJS framework",
      "Kinh nghiệm với PostgreSQL database",
      "Hiểu biết về kiến trúc microservices",
      "Kinh nghiệm với Docker",
      "Kỹ năng làm việc nhóm tốt"
    ],
    "responsibilities": [
      "Phát triển API RESTful",
      "Bảo trì và nâng cấp hệ thống API",
      "Làm việc với Node.js, TypeScript, NestJS",
      "Thiết kế và quản lý database PostgreSQL",
      "Tối ưu hóa performance của hệ thống",
      "Đảm bảo security cho các API"
    ],
    "benefits": [
      "Lương 20-30 triệu VND (có thể thương lượng)",
      "Chế độ làm việc hybrid: 3 ngày văn phòng, 2 ngày WFH",
      "Bảo hiểm đầy đủ theo quy định",
      "Review lương 2 lần mỗi năm",
      "Môi trường làm việc trẻ và năng động"
    ],
    "experience": "2+ năm kinh nghiệm",
    "skills": [
      "Node.js",
      "TypeScript",
      "NestJS",
      "PostgreSQL",
      "RESTful API",
      "Microservices",
      "Docker",
      "Database Design",
      "Performance Optimization",
      "Security"
    ]
  },
  "timestamp": "2025-12-11T10:00:00.000Z"
}
```

### Example 2: English Job Description

**Request:**
```bash
curl -X POST http://localhost:5000/api/ai-assistant/summarize-jd \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Senior Frontend Developer - React/Next.js\n\nAbout the role:\nWe are seeking an experienced Frontend Developer to join our growing team. You will be responsible for building modern, responsive web applications using React and Next.js.\n\nKey Responsibilities:\n- Develop and maintain web applications using React and Next.js\n- Collaborate with designers to implement pixel-perfect UIs\n- Optimize applications for maximum speed and scalability\n- Write clean, maintainable code following best practices\n- Participate in code reviews and mentor junior developers\n\nRequirements:\n- 3+ years of experience with React\n- Strong proficiency in TypeScript and modern JavaScript\n- Experience with Next.js, Redux/Zustand\n- Understanding of responsive design and CSS-in-JS\n- Experience with RESTful APIs and GraphQL\n- Excellent problem-solving skills\n\nWhat we offer:\n- Competitive salary: $3000-5000\n- Remote-first culture\n- Professional development budget\n- Health insurance\n- Flexible working hours\n- Modern tech stack"
  }'
```

**Response:**
```json
{
  "summary": "We are looking for a Senior Frontend Developer with 3+ years of React experience to build modern, responsive web applications. The ideal candidate will work extensively with React and Next.js, collaborating with designers to create pixel-perfect user interfaces while ensuring optimal performance and scalability. Key responsibilities include developing and maintaining web applications, writing clean and maintainable code, participating in code reviews, and mentoring junior team members. Required skills include strong proficiency in TypeScript and modern JavaScript, hands-on experience with Next.js and state management libraries (Redux/Zustand), solid understanding of responsive design and CSS-in-JS solutions, and familiarity with both RESTful APIs and GraphQL. The position offers a competitive salary ranging from $3000-5000, embraces a remote-first work culture with flexible hours, provides a professional development budget for continuous learning, includes comprehensive health insurance, and features a modern tech stack to work with cutting-edge technologies.",
  "detectedLanguage": "English",
  "keyPoints": {
    "position": "Senior Frontend Developer",
    "requirements": [
      "3+ years of experience with React",
      "Strong proficiency in TypeScript",
      "Proficiency in modern JavaScript (ES6+)",
      "Experience with Next.js framework",
      "Experience with Redux or Zustand",
      "Understanding of responsive design principles",
      "Knowledge of CSS-in-JS solutions",
      "Experience with RESTful APIs",
      "Experience with GraphQL",
      "Excellent problem-solving skills"
    ],
    "responsibilities": [
      "Develop web applications using React and Next.js",
      "Maintain and update existing applications",
      "Collaborate with designers for pixel-perfect UI implementation",
      "Optimize applications for maximum speed and scalability",
      "Write clean, maintainable code following best practices",
      "Participate in code reviews",
      "Mentor junior developers"
    ],
    "benefits": [
      "Competitive salary: $3000-5000",
      "Remote-first work culture",
      "Professional development budget",
      "Health insurance coverage",
      "Flexible working hours",
      "Modern tech stack and tools"
    ],
    "experience": "3+ years with React",
    "skills": [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript (ES6+)",
      "Redux",
      "Zustand",
      "Responsive Design",
      "CSS-in-JS",
      "RESTful API",
      "GraphQL",
      "Code Review",
      "Mentoring"
    ]
  },
  "timestamp": "2025-12-11T10:05:00.000Z"
}
```

## Prompt Engineering Details

### Prompt Structure

The prompt is carefully crafted to ensure:

1. **Language Detection**
   - AI identifies the language before processing
   - Ensures output matches input language

2. **Context Setting**
   - Define role: "expert Job Description analyzer"
   - Clear task description

3. **Rules & Guidelines**
   - Explicit instructions for language matching
   - Word count guidelines (200-300 words)
   - Faithfulness to original content
   - Professional tone requirement

4. **Output Format**
   - Structured JSON format for easy parsing
   - Detailed keyPoints breakdown
   - Examples in both Vietnamese and English

5. **Examples**
   - Bilingual examples demonstrate expected output
   - Shows proper formatting and detail level

### Why This Prompt Works

- **Clarity**: Clear instructions reduce ambiguity
- **Structure**: JSON format ensures consistent output
- **Examples**: Demonstrate desired quality and format
- **Constraints**: Prevent hallucination and maintain accuracy
- **Language Awareness**: Explicit language matching rules

## Error Handling

### Common Errors

1. **401 Unauthorized**
   - User not authenticated
   - Solution: Login and provide valid JWT token

2. **400 Bad Request**
   - Empty jobDescription
   - Invalid input format
   - Solution: Check request body format

3. **500 Internal Server Error**
   - Gemini API error
   - Invalid API key
   - Solution: Check server logs, verify GEMINI_API_KEY

### Response on Errors

```json
{
  "statusCode": 400,
  "message": "Failed to summarize Job Description: error details",
  "error": "Bad Request"
}
```

## Integration with Frontend

### React/Next.js Example

```typescript
// services/jd-summarize.service.ts
import axios from 'axios';

export const summarizeJD = async (jobDescription: string) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.post(
    'http://localhost:5000/api/ai-assistant/summarize-jd',
    { jobDescription },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return response.data;
};

// Component usage
const JobDescriptionSummarizer = () => {
  const [jd, setJd] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const result = await summarizeJD(jd);
      setSummary(result);
    } catch (error) {
      console.error('Summarization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste job description here..."
        rows={10}
      />
      <button onClick={handleSummarize} disabled={loading}>
        {loading ? 'Summarizing...' : 'Summarize'}
      </button>
      
      {summary && (
        <div>
          <h3>Language: {summary.detectedLanguage}</h3>
          <p>{summary.summary}</p>
          
          <h4>Key Points:</h4>
          <div>
            <strong>Position:</strong> {summary.keyPoints.position}
          </div>
          <div>
            <strong>Experience:</strong> {summary.keyPoints.experience}
          </div>
          {/* Render other key points */}
        </div>
      )}
    </div>
  );
};
```

## Performance Considerations

- **Response Time**: 2-5 seconds (depends on JD length and API latency)
- **Token Usage**: ~500-1500 tokens per request
- **Rate Limiting**: Consider implementing per-user rate limits
- **Caching**: Cache summaries for identical JDs

## Best Practices

1. **Input Validation**: Validate JD length (min 50 chars, max 10000 chars)
2. **Loading States**: Show loading indicator during API call
3. **Error Handling**: Display user-friendly error messages
4. **Response Display**: Format key points as lists or cards
5. **Copy Function**: Allow users to copy summary
6. **Save Feature**: Let users save summaries for later reference

## Future Enhancements

- [ ] Save JD summaries to database
- [ ] Compare multiple JDs side-by-side
- [ ] Extract salary information separately
- [ ] Identify missing information in JD
- [ ] Generate application tips based on JD
- [ ] Multi-language support beyond Vietnamese/English
- [ ] Batch processing for multiple JDs
- [ ] Export summaries to PDF/Word

## Testing

See [test-jd-summarize.ps1](../test-jd-summarize.ps1) for automated testing script.

Manual test:
1. Login to get JWT token
2. Copy a job description
3. Send POST request to `/api/ai-assistant/summarize-jd`
4. Verify response contains summary and key points
5. Check that response language matches input language

---

**Note**: Requires valid GEMINI_API_KEY in environment variables.
