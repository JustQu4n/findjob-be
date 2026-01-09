# Backend Requirements: Candidate Behavior Tracking System

## Overview
This document outlines the requirements for implementing a candidate behavior tracking system that monitors and logs suspicious activities during interview sessions.

---

## 1. Database Schema

### 1.1 New Table: `candidate_behavior_logs`

```sql
CREATE TABLE candidate_behavior_logs (
    behavior_log_id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_interview_id INT NOT NULL,
    question_id INT NOT NULL,
    behavior_type ENUM(
        'PASTE',
        'COPY', 
        'LARGE_DELETION',
        'FAST_TYPING',
        'TAB_SWITCH',
        'FOCUS_LOSS'
    ) NOT NULL,
    timestamp DATETIME NOT NULL,
    description VARCHAR(500),
    metadata JSON, -- Stores additional data like character count, typing speed, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (candidate_interview_id) REFERENCES candidate_interviews(candidate_interview_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES interview_questions(question_id) ON DELETE CASCADE,
    
    INDEX idx_candidate_interview (candidate_interview_id),
    INDEX idx_behavior_type (behavior_type),
    INDEX idx_timestamp (timestamp)
);
```

### 1.2 Metadata Structure (JSON Field)

The `metadata` field stores additional context about each behavior event:

**For PASTE events:**
```json
{
  "length": 150,
  "preview": "Pasted text preview (first 50 chars)..."
}
```

**For COPY events:**
```json
{
  "length": 75
}
```

**For LARGE_DELETION events:**
```json
{
  "deleted_chars": 85,
  "previous_length": 200,
  "new_length": 115
}
```

**For FAST_TYPING events:**
```json
{
  "instant_speed": 12.5,
  "average_speed": 9.8
}
```

**For TAB_SWITCH and FOCUS_LOSS:**
```json
{} // No additional data needed
```

---

## 2. API Endpoints

### 2.1 Store Behavior Logs (During Interview Submission)

**Endpoint:** `POST /api/candidate/interviews/:candidateInterviewId/submit`

**Modified Request Body:**
```json
{
  "answers": [
    {
      "question_id": 123,
      "answer_text": "My answer text...",
      "elapsed_seconds": 180,
      "behavior_logs": [
        {
          "type": "PASTE",
          "timestamp": "2026-01-09T14:30:45.123Z",
          "question_id": 123,
          "description": "Pasted 150 characters",
          "data": {
            "length": 150,
            "preview": "Pasted text preview..."
          }
        },
        {
          "type": "TAB_SWITCH",
          "timestamp": "2026-01-09T14:32:10.456Z",
          "question_id": 123,
          "description": "Candidate switched to another tab/window"
        },
        {
          "type": "LARGE_DELETION",
          "timestamp": "2026-01-09T14:33:20.789Z",
          "question_id": 123,
          "description": "Deleted 85 characters (possible rethinking/rewriting)",
          "data": {
            "deleted_chars": 85,
            "previous_length": 200,
            "new_length": 115
          }
        }
      ]
    }
  ]
}
```

**Backend Processing:**
1. Validate and store interview answers as usual
2. For each answer, iterate through `behavior_logs` array
3. Insert each behavior log into `candidate_behavior_logs` table
4. Return success response

**Response:**
```json
{
  "success": true,
  "message": "Interview submitted successfully",
  "answers_saved": 5,
  "behavior_logs_saved": 12
}
```

---

### 2.2 Retrieve Behavior Logs for a Candidate

**Endpoint:** `GET /api/employer/interviews/:interviewId/candidates/:candidateInterviewId/behavior-logs`

**Description:** Retrieve all behavior logs for a specific candidate's interview session.

**Authorization:** Employer/Admin only (must own the interview)

**Response:**
```json
{
  "success": true,
  "candidate_interview_id": 456,
  "candidate_name": "John Doe",
  "candidate_email": "john@example.com",
  "total_logs": 12,
  "behavior_summary": {
    "PASTE": 3,
    "COPY": 1,
    "LARGE_DELETION": 2,
    "FAST_TYPING": 1,
    "TAB_SWITCH": 4,
    "FOCUS_LOSS": 1
  },
  "risk_score": 65, // 0-100 score based on suspicious behaviors
  "logs": [
    {
      "behavior_log_id": 1,
      "question_id": 123,
      "question_text": "Explain your experience with React...",
      "behavior_type": "PASTE",
      "timestamp": "2026-01-09T14:30:45.123Z",
      "description": "Pasted 150 characters",
      "metadata": {
        "length": 150,
        "preview": "Pasted text preview..."
      }
    },
    {
      "behavior_log_id": 2,
      "question_id": 123,
      "question_text": "Explain your experience with React...",
      "behavior_type": "TAB_SWITCH",
      "timestamp": "2026-01-09T14:32:10.456Z",
      "description": "Candidate switched to another tab/window",
      "metadata": {}
    }
  ]
}
```

---

### 2.3 Get Behavior Summary for All Candidates

**Endpoint:** `GET /api/employer/interviews/:interviewId/behavior-summary`

**Description:** Get aggregated behavior statistics for all candidates who took this interview.

**Authorization:** Employer/Admin only

**Response:**
```json
{
  "success": true,
  "interview_id": 789,
  "interview_title": "Frontend Developer Assessment",
  "total_candidates": 25,
  "candidates_with_suspicious_behavior": 8,
  "aggregated_stats": {
    "PASTE": 45,
    "COPY": 12,
    "LARGE_DELETION": 30,
    "FAST_TYPING": 15,
    "TAB_SWITCH": 67,
    "FOCUS_LOSS": 23
  },
  "candidates": [
    {
      "candidate_interview_id": 456,
      "candidate_name": "John Doe",
      "total_score": 85,
      "behavior_count": 12,
      "risk_score": 65,
      "flagged": true
    },
    {
      "candidate_interview_id": 457,
      "candidate_name": "Jane Smith",
      "total_score": 92,
      "behavior_count": 2,
      "risk_score": 15,
      "flagged": false
    }
  ]
}
```

---

## 3. Risk Score Calculation

### 3.1 Scoring Algorithm

Calculate a risk score (0-100) based on the frequency and severity of suspicious behaviors:

```javascript
function calculateRiskScore(behaviorLogs) {
  let score = 0;
  
  // Weight for each behavior type
  const weights = {
    PASTE: 15,           // High risk
    COPY: 5,             // Low risk (might be legitimate)
    LARGE_DELETION: 10,  // Medium risk (could be legitimate editing)
    FAST_TYPING: 8,      // Medium risk
    TAB_SWITCH: 12,      // High risk (potential cheating)
    FOCUS_LOSS: 8        // Medium risk
  };
  
  behaviorLogs.forEach(log => {
    score += weights[log.behavior_type] || 0;
  });
  
  // Cap at 100
  return Math.min(score, 100);
}
```

### 3.2 Flag Candidates

Flag candidates with:
- Risk score > 50
- More than 3 PASTE events
- More than 5 TAB_SWITCH events

---

## 4. Business Logic

### 4.1 When to Store Logs

- Store behavior logs **when the candidate submits their interview** (not in real-time)
- Frontend collects logs during the session and sends them with the final submission
- This reduces server load and ensures data integrity

### 4.2 Data Retention

- Keep behavior logs for **12 months** after interview completion
- Automatically delete logs older than 12 months (GDPR compliance)
- Implement a scheduled job to clean up old logs

### 4.3 Privacy Considerations

- **Do NOT** store the actual pasted content (only length and preview)
- **Do NOT** track keystrokes (only behavioral patterns)
- Inform candidates that their behavior is monitored (add to terms)
- Allow candidates to view their own behavior logs

---

## 5. Implementation Steps

### Backend Implementation Order:

1. **Database Migration**
   - Create `candidate_behavior_logs` table
   - Add indexes for performance

2. **Update Interview Submission Endpoint**
   - Modify `POST /api/candidate/interviews/:id/submit` to accept `behavior_logs`
   - Add validation for behavior log structure
   - Store logs in database

3. **Create Behavior Retrieval Endpoints**
   - Implement `GET /api/employer/interviews/:id/candidates/:candidateId/behavior-logs`
   - Implement `GET /api/employer/interviews/:id/behavior-summary`
   - Add authorization checks

4. **Implement Risk Scoring**
   - Create utility function for risk score calculation
   - Add risk score to candidate responses

5. **Add Cleanup Job**
   - Create scheduled task to delete old logs (12+ months)
   - Run daily at 2 AM

---

## 6. Testing Requirements

### 6.1 Unit Tests

- Test behavior log storage
- Test risk score calculation
- Test data retrieval with various filters

### 6.2 Integration Tests

- Test interview submission with behavior logs
- Test retrieval of logs for employer
- Test authorization (ensure employers can't see other employers' data)

### 6.3 Performance Tests

- Test with 1000+ behavior logs per candidate
- Ensure queries are optimized with proper indexes

---

## 7. Frontend Integration Points

### 7.1 Data Format Sent from Frontend

The frontend will send behavior logs in this format:

```javascript
{
  type: 'PASTE' | 'COPY' | 'LARGE_DELETION' | 'FAST_TYPING' | 'TAB_SWITCH' | 'FOCUS_LOSS',
  timestamp: '2026-01-09T14:30:45.123Z', // ISO 8601 format
  question_id: 123,
  description: 'Human-readable description',
  data: { /* Additional metadata */ }
}
```

### 7.2 Frontend Display Requirements

The frontend will display behavior logs in:
- **InterviewAnswers.jsx** - Show behavior logs for each candidate
- **InterviewStatistics.jsx** - Show risk scores and flags
- New component: **BehaviorLogsPanel.jsx** - Detailed view of all behaviors

---

## 8. Security Considerations

1. **Authorization:** Only interview owner can view behavior logs
2. **Rate Limiting:** Prevent abuse of behavior log endpoints
3. **Data Sanitization:** Clean all user inputs before storing
4. **Audit Trail:** Log when employers view behavior logs

---

## 9. Example SQL Queries

### Insert Behavior Log
```sql
INSERT INTO candidate_behavior_logs 
(candidate_interview_id, question_id, behavior_type, timestamp, description, metadata)
VALUES 
(456, 123, 'PASTE', '2026-01-09 14:30:45', 'Pasted 150 characters', '{"length": 150, "preview": "..."}');
```

### Get All Logs for a Candidate
```sql
SELECT 
    cbl.*,
    iq.question_text
FROM candidate_behavior_logs cbl
JOIN interview_questions iq ON cbl.question_id = iq.question_id
WHERE cbl.candidate_interview_id = 456
ORDER BY cbl.timestamp ASC;
```

### Get Behavior Summary
```sql
SELECT 
    behavior_type,
    COUNT(*) as count
FROM candidate_behavior_logs
WHERE candidate_interview_id = 456
GROUP BY behavior_type;
```

### Get High-Risk Candidates
```sql
SELECT 
    ci.candidate_interview_id,
    c.full_name,
    COUNT(cbl.behavior_log_id) as behavior_count
FROM candidate_interviews ci
JOIN candidates c ON ci.candidate_id = c.candidate_id
LEFT JOIN candidate_behavior_logs cbl ON ci.candidate_interview_id = cbl.candidate_interview_id
WHERE ci.interview_id = 789
GROUP BY ci.candidate_interview_id
HAVING behavior_count > 5
ORDER BY behavior_count DESC;
```

---

## 10. Future Enhancements

1. **Machine Learning:** Train a model to detect cheating patterns
2. **Real-time Alerts:** Notify employers of suspicious behavior during interview
3. **Webcam Monitoring:** Detect multiple faces or looking away
4. **Screen Recording:** Optional feature for high-stakes interviews
5. **Browser Extension Detection:** Detect if candidate is using AI assistants

---

## Contact

For questions about this implementation, contact:
- **Frontend Team:** careervibe-frontend@example.com
- **Backend Team:** careervibe-backend@example.com
