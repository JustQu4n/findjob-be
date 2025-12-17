export class JobPostResponseDto {
  job_post_id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  address: string;
  experience: string;
  level: string;
  salary_range: string;
  gender: string;
  job_type: string;
  status: string;
  views_count: number;
  saves_count: number;
  created_at: Date;
  updated_at: Date;
  expires_at: Date;
  deadline: Date;
  
  // Company info
  company: {
    company_id: string;
    name: string;
    logo: string;
    location: string;
    size: string;
    website: string;
  };

  // Category info
  category: {
    category_id: string;
    name: string;
  };

  // Skills
  skills: Array<{
    skill_id: string;
    name: string;
  }>;
}
