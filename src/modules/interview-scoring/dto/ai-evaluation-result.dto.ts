export class AiEvaluationResultDto {
  totalScore: number;
  recommendation: string;
  criteria: {
    technical: number;
    logic: number;
    experience: number;
    clarity: number;
    relevance: number;
  };
  summary: string;
  detailedFeedback?: any;
  modelUsed: string;
  createdAt: Date;
}
