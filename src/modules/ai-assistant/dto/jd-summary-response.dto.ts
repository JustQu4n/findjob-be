export class JdSummaryResponseDto {
  summary: string;
  detectedLanguage: string;
  position: string;
  company: string;
  keyInformation: {
    requirements?: string[];
    responsibilities?: string[];
    benefits?: string[];
    skills?: string[];
    experience?: string;
    location?: string;
    salary?: string;
  };
  timestamp: Date;

  constructor(
    summary: string,
    detectedLanguage: string,
    position: string,
    company: string,
    keyInformation: any,
    timestamp?: Date,
  ) {
    this.summary = summary;
    this.detectedLanguage = detectedLanguage;
    this.position = position;
    this.company = company;
    this.keyInformation = keyInformation;
    this.timestamp = timestamp || new Date();
  }
}
