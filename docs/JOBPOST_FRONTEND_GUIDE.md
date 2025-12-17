# Job Posts Frontend Implementation Guide

## 📋 Tổng Quan

Hướng dẫn này giúp frontend developer tích hợp API Job Posts với giao diện tìm kiếm và lọc công việc.

## 🎯 Các Tính Năng Cần Implement

### 1. **Trang Danh Sách Job Posts** (Job Listing Page)
- Hiển thị danh sách tất cả job posts
- Thanh tìm kiếm (search bar)
- Bộ lọc sidebar/filter panel
- Pagination
- Sorting options
- Loading states
- Empty states


import axios from 'axios';
import type { 
  JobFilters, 
  JobsResponse, 
  JobDetailResponse,
  SavedJobsResponse 
} from '@/types/job.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const jobApi = {
  // Lấy danh sách jobs với filters
  getJobs: async (filters: JobFilters): Promise<JobsResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          // Convert array to comma-separated string
          params.append(key, value.join(','));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    const { data } = await api.get<JobsResponse>(
      `/jobseeker/job-posts?${params.toString()}`
    );
    return data;
  },

  // Tìm kiếm jobs
  searchJobs: async (filters: JobFilters): Promise<JobsResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    const { data } = await api.get<JobsResponse>(
      `/jobseeker/job-posts/search?${params.toString()}`
    );
    return data;
  },

  // Lấy jobs nổi bật
  getFeaturedJobs: async (page = 1, limit = 10): Promise<JobsResponse> => {
    const { data } = await api.get<JobsResponse>(
      `/jobseeker/job-posts/featured?page=${page}&limit=${limit}`
    );
    return data;
  },

  // Lấy jobs xem nhiều nhất
  getMostViewedJobs: async (page = 1, limit = 10): Promise<JobsResponse> => {
    const { data } = await api.get<JobsResponse>(
      `/jobseeker/job-posts/most-viewed?page=${page}&limit=${limit}`
    );
    return data;
  },

  // Lấy jobs lưu nhiều nhất
  getMostSavedJobs: async (page = 1, limit = 10): Promise<JobsResponse> => {
    const { data } = await api.get<JobsResponse>(
      `/jobseeker/job-posts/most-saved?page=${page}&limit=${limit}`
    );
    return data;
  },

  // Lấy chi tiết job
  getJobDetail: async (jobId: string): Promise<JobDetailResponse> => {
    const { data } = await api.get<JobDetailResponse>(
      `/jobseeker/job-posts/${jobId}`
    );
    return data;
  },

  // Lấy jobs liên quan
  getRelatedJobs: async (jobId: string, limit = 5): Promise<JobsResponse> => {
    const { data } = await api.get<JobsResponse>(
      `/jobseeker/job-posts/${jobId}/related?limit=${limit}`
    );
    return data;
  },

  // Lưu job (requires auth)
  saveJob: async (jobId: string): Promise<any> => {
    const { data } = await api.post(`/jobseeker/saved/save-job/${jobId}`);
    return data;
  },

  // Bỏ lưu job (requires auth)
  unsaveJob: async (jobId: string): Promise<any> => {
    const { data } = await api.delete(`/jobseeker/saved/unsave-job/${jobId}`);
    return data;
  },

  // Lấy danh sách jobs đã lưu (requires auth)
  getSavedJobs: async (page = 1, limit = 10): Promise<SavedJobsResponse> => {
    const { data } = await api.get<SavedJobsResponse>(
      `/jobseeker/saved/jobs?page=${page}&limit=${limit}`
    );
    return data;
  },

  // Kiểm tra job đã lưu chưa (requires auth)
  checkJobSaved: async (jobId: string): Promise<{ isSaved: boolean; savedAt: string | null }> => {
    const { data } = await api.get(`/jobseeker/saved/check/${jobId}`);
    return data;
  },
};
```

---

## 🪝 Custom Hooks

### 1. useJobs Hook

```typescript
// hooks/useJobs.ts

import { useState, useEffect } from 'react';
import { jobApi } from '@/services/jobApi';
import type { JobFilters, JobsResponse } from '@/types/job.types';

export const useJobs = (initialFilters: JobFilters = {}) => {
  const [jobs, setJobs] = useState<JobsResponse | null>(null);
  const [filters, setFilters] = useState<JobFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobApi.getJobs(filters);
      setJobs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [JSON.stringify(filters)]); // Re-fetch when filters change

  const updateFilters = (newFilters: Partial<JobFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1
  };

  const resetFilters = () => {
    setFilters({ page: 1, limit: 10 });
  };

  const goToPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return {
    jobs: jobs?.data || [],
    meta: jobs?.meta,
    filters,
    loading,
    error,
    updateFilters,
    resetFilters,
    goToPage,
    refetch: fetchJobs,
  };
};
```

### 2. useJobDetail Hook

```typescript
// hooks/useJobDetail.ts

import { useState, useEffect } from 'react';
import { jobApi } from '@/services/jobApi';
import type { JobPost } from '@/types/job.types';

export const useJobDetail = (jobId: string) => {
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await jobApi.getJobDetail(jobId);
        
        // Transform jobPostSkills to skills array
        const jobData = {
          ...response.data,
          skills: response.data.jobPostSkills?.map(jps => jps.skill) || [],
        };
        
        setJob(jobData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch job details');
        console.error('Error fetching job detail:', err);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetail();
    }
  }, [jobId]);

  return { job, loading, error };
};
```

### 3. useSaveJob Hook

```typescript
// hooks/useSaveJob.ts

import { useState, useEffect } from 'react';
import { jobApi } from '@/services/jobApi';
import { toast } from 'react-hot-toast'; // or your toast library

export const useSaveJob = (jobId: string) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if job is already saved
  useEffect(() => {
    const checkSaved = async () => {
      try {
        setChecking(true);
        const response = await jobApi.checkJobSaved(jobId);
        setIsSaved(response.isSaved);
      } catch (err) {
        // User not logged in or error
        setIsSaved(false);
      } finally {
        setChecking(false);
      }
    };

    checkSaved();
  }, [jobId]);

  const toggleSave = async () => {
    try {
      setLoading(true);
      
      if (isSaved) {
        await jobApi.unsaveJob(jobId);
        setIsSaved(false);
        toast.success('Đã bỏ lưu công việc');
      } else {
        await jobApi.saveJob(jobId);
        setIsSaved(true);
        toast.success('Đã lưu công việc');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để lưu công việc');
      } else {
        toast.error(err.message || 'Có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  return { isSaved, loading, checking, toggleSave };
};
```

---

## 🎨 UI Components Examples

### 1. JobCard Component

```tsx
// components/jobs/JobCard.tsx

import React from 'react';
import Link from 'next/link';
import { JobPost, JobType, JobLevel } from '@/types/job.types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MapPin, Briefcase, DollarSign, Eye, Bookmark } from 'lucide-react';

interface JobCardProps {
  job: JobPost;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const jobTypeLabels: Record<JobType, string> = {
    [JobType.FULL_TIME]: 'Full-time',
    [JobType.PART_TIME]: 'Part-time',
    [JobType.CONTRACT]: 'Hợp đồng',
    [JobType.INTERNSHIP]: 'Thực tập',
  };

  return (
    <Link href={`/jobs/${job.job_post_id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200">
        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <img
            src={job.company.logo || '/placeholder-company.png'}
            alt={job.company.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          
          <div className="flex-1">
            {/* Job Title */}
            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            
            {/* Company Name */}
            <p className="text-gray-600 mt-1">{job.company.name}</p>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                {jobTypeLabels[job.job_type]}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                {job.level}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{job.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">{job.salary_range || 'Thỏa thuận'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm">{job.experience || 'Không yêu cầu'}</span>
          </div>
        </div>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.skills.slice(0, 5).map((skill) => (
              <span
                key={skill.id}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {skill.name}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{job.skills.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <span>
            {formatDistanceToNow(new Date(job.created_at), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{job.views_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="w-4 h-4" />
              <span>{job.saves_count}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
```

### 2. JobFilters Component

```tsx
// components/jobs/JobFilters.tsx

import React from 'react';
import { JobType, JobLevel, JobFilters as JobFiltersType } from '@/types/job.types';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFilterChange: (filters: Partial<JobFiltersType>) => void;
  onReset: () => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const jobTypes = [
    { value: JobType.FULL_TIME, label: 'Full-time' },
    { value: JobType.PART_TIME, label: 'Part-time' },
    { value: JobType.CONTRACT, label: 'Hợp đồng' },
    { value: JobType.INTERNSHIP, label: 'Thực tập' },
  ];

  const jobLevels = [
    { value: JobLevel.INTERN, label: 'Thực tập sinh' },
    { value: JobLevel.JUNIOR, label: 'Junior' },
    { value: JobLevel.MIDDLE, label: 'Middle' },
    { value: JobLevel.SENIOR, label: 'Senior' },
    { value: JobLevel.LEAD, label: 'Lead' },
    { value: JobLevel.MANAGER, label: 'Manager' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Bộ lọc</h3>
        <button
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Địa điểm
        </label>
        <input
          type="text"
          placeholder="VD: Hà Nội, TP.HCM..."
          value={filters.location || ''}
          onChange={(e) => onFilterChange({ location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Job Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại công việc
        </label>
        <div className="space-y-2">
          {jobTypes.map((type) => (
            <label key={type.value} className="flex items-center">
              <input
                type="radio"
                name="job_type"
                checked={filters.job_type === type.value}
                onChange={() => onFilterChange({ job_type: type.value })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
          <label className="flex items-center">
            <input
              type="radio"
              name="job_type"
              checked={!filters.job_type}
              onChange={() => onFilterChange({ job_type: undefined })}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Tất cả</span>
          </label>
        </div>
      </div>

      {/* Job Level Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cấp độ
        </label>
        <select
          value={filters.level || ''}
          onChange={(e) =>
            onFilterChange({
              level: e.target.value ? (e.target.value as JobLevel) : undefined,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả</option>
          {jobLevels.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      {/* Experience Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kinh nghiệm
        </label>
        <input
          type="text"
          placeholder="VD: 2-3 năm, 5+ năm..."
          value={filters.experience || ''}
          onChange={(e) => onFilterChange({ experience: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Salary Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mức lương
        </label>
        <input
          type="text"
          placeholder="VD: 10-20 triệu..."
          value={filters.salary_range || ''}
          onChange={(e) => onFilterChange({ salary_range: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};
```

### 3. JobSearchBar Component

```tsx
// components/jobs/JobSearchBar.tsx

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { JobFilters } from '@/types/job.types';

interface JobSearchBarProps {
  onSearch: (filters: Partial<JobFilters>) => void;
  initialKeyword?: string;
}

export const JobSearchBar: React.FC<JobSearchBarProps> = ({
  onSearch,
  initialKeyword = '',
}) => {
  const [keyword, setKeyword] = useState(initialKeyword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ keyword });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm công việc, vị trí, công ty..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Tìm kiếm
        </button>
      </div>
    </form>
  );
};
```

### 4. Job List Page

```tsx
// pages/jobs/index.tsx

import React from 'react';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobSearchBar } from '@/components/jobs/JobSearchBar';
import { JobPagination } from '@/components/jobs/JobPagination';
import { useJobs } from '@/hooks/useJobs';
import { Loader2 } from 'lucide-react';

export default function JobsPage() {
  const { jobs, meta, filters, loading, updateFilters, resetFilters, goToPage } = useJobs({
    page: 1,
    limit: 12,
  });

  if (loading && !jobs.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tìm việc làm
          </h1>
          <JobSearchBar 
            onSearch={updateFilters}
            initialKeyword={filters.keyword}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <JobFilters
              filters={filters}
              onFilterChange={updateFilters}
              onReset={resetFilters}
            />
          </aside>

          {/* Job List */}
          <main className="lg:col-span-3">
            {/* Sort & Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Tìm thấy <span className="font-semibold">{meta?.total || 0}</span> công việc
              </p>
              
              <select
                value={`${filters.sort_by || 'created_at'}_${filters.sort_order || 'DESC'}`}
                onChange={(e) => {
                  const [sort_by, sort_order] = e.target.value.split('_');
                  updateFilters({ 
                    sort_by: sort_by as any, 
                    sort_order: sort_order as any 
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="created_at_DESC">Mới nhất</option>
                <option value="views_count_DESC">Xem nhiều nhất</option>
                <option value="saves_count_DESC">Lưu nhiều nhất</option>
                <option value="salary_range_DESC">Lương cao nhất</option>
                <option value="title_ASC">Tên A-Z</option>
              </select>
            </div>

            {/* Jobs Grid */}
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Không tìm thấy công việc phù hợp
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobs.map((job) => (
                  <JobCard key={job.job_post_id} job={job} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-8">
                <JobPagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={goToPage}
                />
              </div>
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
```

---

## 📱 Responsive Design Tips

### Breakpoints (Tailwind CSS)

```css
/* Mobile first approach */
sm: 640px  /* Small devices */
md: 768px  /* Tablets */
lg: 1024px /* Laptops */
xl: 1280px /* Desktops */
2xl: 1536px /* Large screens */
```

### Mobile Layout

```tsx
// Ẩn filters trên mobile, hiển thị dạng drawer/modal
<div className="hidden lg:block">
  <JobFilters />
</div>

// Button mở filter modal trên mobile
<button className="lg:hidden fixed bottom-4 right-4 ...">
  <Filter /> Lọc
</button>
```

---

## 🎯 Best Practices

### 1. **Debounce Search Input**

```typescript
import { useDebounce } from 'use-debounce';

const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

useEffect(() => {
  updateFilters({ keyword: debouncedSearchTerm });
}, [debouncedSearchTerm]);
```

### 2. **URL Query Params Sync**

```typescript
import { useRouter } from 'next/router';

// Sync filters with URL
useEffect(() => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.append(key, String(value));
  });
  router.push(`/jobs?${query.toString()}`, undefined, { shallow: true });
}, [filters]);
```

### 3. **Infinite Scroll Alternative**

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['jobs', filters],
  queryFn: ({ pageParam = 1 }) =>
    jobApi.getJobs({ ...filters, page: pageParam }),
  getNextPageParam: (lastPage) =>
    lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
});
```

### 4. **Error Boundary**

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onReset={() => window.location.reload()}
>
  <JobList />
</ErrorBoundary>
```

---

## 🧪 Testing

### Example Test (Jest + React Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { JobSearchBar } from '@/components/jobs/JobSearchBar';

describe('JobSearchBar', () => {
  it('calls onSearch with keyword when submitted', () => {
    const onSearch = jest.fn();
    render(<JobSearchBar onSearch={onSearch} />);
    
    const input = screen.getByPlaceholderText(/Tìm kiếm/i);
    const submitBtn = screen.getByRole('button', { name: /Tìm kiếm/i });
    
    fireEvent.change(input, { target: { value: 'React Developer' } });
    fireEvent.click(submitBtn);
    
    expect(onSearch).toHaveBeenCalledWith({ keyword: 'React Developer' });
  });
});
```

---

## 🚀 Performance Optimization

### 1. **Memoization**

```tsx
import { memo } from 'react';

export const JobCard = memo<JobCardProps>(({ job }) => {
  // Component code
}, (prevProps, nextProps) => {
  return prevProps.job.job_post_id === nextProps.job.job_post_id;
});
```

### 2. **Virtual Scrolling**

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);

const virtualizer = useVirtualizer({
  count: jobs.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 200, // Estimated card height
});
```

### 3. **Image Optimization (Next.js)**

```tsx
import Image from 'next/image';

<Image
  src={job.company.logo}
  alt={job.company.name}
  width={64}
  height={64}
  className="rounded-lg"
  loading="lazy"
/>
```

---

## 📦 Recommended Libraries

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.300.0",
    "use-debounce": "^10.0.0",
    "zustand": "^4.4.0"
  }
}
```

---

## 🎨 UI/UX Recommendations

1. **Loading States**: Skeleton screens cho initial load
2. **Empty States**: Thông báo rõ ràng khi không có kết quả
3. **Error Handling**: Toast notifications cho errors
4. **Optimistic UI**: Update UI ngay khi save/unsave
5. **Animations**: Smooth transitions với Framer Motion
6. **Accessibility**: ARIA labels, keyboard navigation
7. **Mobile-First**: Responsive design từ mobile
8. **Dark Mode**: Support dark mode với Tailwind

---

## 📝 Checklist Implementation

- [ ] Setup TypeScript types
- [ ] Create API service layer
- [ ] Implement custom hooks
- [ ] Build JobCard component
- [ ] Build JobFilters component
- [ ] Build JobSearchBar component
- [ ] Create Job List page
- [ ] Create Job Detail page
- [ ] Implement save/unsave functionality
- [ ] Add pagination
- [ ] Add sorting
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test responsive design
- [ ] Add SEO meta tags
- [ ] Performance optimization
- [ ] Write tests

---

## 🎬 Demo Flow

1. User lands on `/jobs`
2. Sees list of all active jobs
3. Can search by keyword
4. Can filter by location, type, level, etc.
5. Can sort results
6. Clicks on a job → Redirects to `/jobs/[id]`
7. Views job details, company info, required skills
8. Can save job (if logged in)
9. Can view related jobs
10. Can navigate to saved jobs page

---

Hãy tham khảo file này khi implement frontend! Nếu cần ví dụ cụ thể hơn cho bất kỳ component nào, hãy hỏi tôi.
