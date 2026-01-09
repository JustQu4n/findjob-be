# Test Behavior Tracking Feature

## Quick Test Script

Run this in your terminal after running migrations:

```powershell
# 1. First, run the migration
npm run migration:run

# 2. Test data - Create a test interview submission with behavior logs
$body = @{
  answers = @(
    @{
      question_id = "YOUR_QUESTION_ID"
      answer_text = "This is my test answer"
      elapsed_seconds = 120
      behavior_logs = @(
        @{
          type = "PASTE"
          timestamp = "2026-01-09T14:30:45.123Z"
          question_id = "YOUR_QUESTION_ID"
          description = "Pasted 150 characters"
          data = @{
            length = 150
            preview = "Some pasted content..."
          }
        },
        @{
          type = "TAB_SWITCH"
          timestamp = "2026-01-09T14:32:10.456Z"
          question_id = "YOUR_QUESTION_ID"
          description = "Candidate switched to another tab"
        }
      )
    }
  )
} | ConvertTo-Json -Depth 10

# 3. Submit the interview (replace with actual IDs and token)
$headers = @{
  "Authorization" = "Bearer YOUR_JOBSEEKER_TOKEN"
  "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/jobseeker/interviews/YOUR_CANDIDATE_INTERVIEW_ID/submit" `
  -Method Post `
  -Headers $headers `
  -Body $body

# 4. Get behavior logs (as employer)
$employerHeaders = @{
  "Authorization" = "Bearer YOUR_EMPLOYER_TOKEN"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/employer/interviews/YOUR_INTERVIEW_ID/candidates/YOUR_CANDIDATE_INTERVIEW_ID/behavior-logs" `
  -Method Get `
  -Headers $employerHeaders

# 5. Get behavior summary
Invoke-RestMethod -Uri "http://localhost:5000/api/employer/interviews/YOUR_INTERVIEW_ID/behavior-summary" `
  -Method Get `
  -Headers $employerHeaders
```

## SQL Verification Queries

```sql
-- Check if table was created
SELECT * FROM information_schema.tables 
WHERE table_name = 'candidate_behavior_logs';

-- Check enum type
SELECT typname, enumlabel 
FROM pg_type 
JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid
WHERE typname = 'candidate_behavior_type';

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'candidate_behavior_logs';

-- View behavior logs (after submitting some)
SELECT 
  cbl.behavior_log_id,
  ci.candidate_interview_id,
  u.full_name as candidate_name,
  cbl.behavior_type,
  cbl.timestamp,
  cbl.description,
  cbl.metadata
FROM candidate_behavior_logs cbl
JOIN candidate_interviews ci ON cbl.candidate_interview_id = ci.candidate_interview_id
JOIN users u ON ci.candidate_id = u.user_id
ORDER BY cbl.timestamp DESC
LIMIT 20;

-- Get risk summary per candidate
SELECT 
  ci.candidate_interview_id,
  u.full_name,
  COUNT(*) as total_behaviors,
  COUNT(*) FILTER (WHERE cbl.behavior_type = 'PASTE') as paste_count,
  COUNT(*) FILTER (WHERE cbl.behavior_type = 'TAB_SWITCH') as tab_switch_count,
  COUNT(*) FILTER (WHERE cbl.behavior_type = 'COPY') as copy_count
FROM candidate_behavior_logs cbl
JOIN candidate_interviews ci ON cbl.candidate_interview_id = ci.candidate_interview_id
JOIN users u ON ci.candidate_id = u.user_id
GROUP BY ci.candidate_interview_id, u.full_name
ORDER BY total_behaviors DESC;
```

## Testing Checklist

- [ ] Migration runs successfully
- [ ] Can submit interview with behavior_logs
- [ ] Behavior logs are saved to database
- [ ] GET behavior logs endpoint returns correct data
- [ ] Risk score is calculated correctly
- [ ] Behavior summary shows all candidates
- [ ] Employers can only see their own interview logs
- [ ] Job seekers cannot access behavior logs endpoints
- [ ] Metadata is stored correctly in JSONB format
- [ ] Indexes improve query performance

## Expected Results

### After Submitting Interview:
```json
{
  "success": true,
  "message": "Interview submitted successfully",
  "answers_saved": 1,
  "behavior_logs_saved": 2
}
```

### After Getting Behavior Logs:
```json
{
  "success": true,
  "candidate_interview_id": "...",
  "candidate_name": "Test User",
  "candidate_email": "test@example.com",
  "total_logs": 2,
  "behavior_summary": {
    "PASTE": 1,
    "COPY": 0,
    "LARGE_DELETION": 0,
    "FAST_TYPING": 0,
    "TAB_SWITCH": 1,
    "FOCUS_LOSS": 0
  },
  "risk_score": 27,
  "logs": [...]
}
```

### Risk Score Calculation:
- 1 PASTE (15 points) + 1 TAB_SWITCH (12 points) = 27 points
- Not flagged (need >50 or >3 pastes or >5 tab switches)
