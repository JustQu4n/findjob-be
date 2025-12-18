export class ChatResponseDto {
  response: string;
  model: string;
  tokensUsed?: number;
  timestamp: Date;

  constructor(partial: Partial<ChatResponseDto>) {
    Object.assign(this, partial);
    this.timestamp = new Date();
  }
}
