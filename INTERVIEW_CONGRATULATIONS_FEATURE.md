# Interview Congratulations Email Feature

## Overview
Feature to send congratulations email to candidates who passed interviews. Employer can click a Mail icon to send the email.

## API Endpoint

### Send Congratulations Email
```
POST /employer/interviews/:interviewId/candidates/:candidateInterviewId/send-congratulations
```

**Authorization:** Requires JWT Auth + Employer role

**Path Parameters:**
- `interviewId`: Interview ID (required for route structure)
- `candidateInterviewId`: The candidate interview ID

**Response:**
```json
{
  "success": true,
  "message": "Congratulations email sent successfully",
  "sentTo": "candidate@example.com"
}
```

**Error Responses:**
- `404 Not Found`: Candidate interview not found or candidate email not found
- `403 Forbidden`: Interview doesn't belong to the employer
- `400 Bad Request`: Candidate has not passed the interview (result !== 'passed')

## Implementation Details

### 1. Email Service (`email.service.ts`)
Added `sendInterviewCongratulationsEmail()` method that:
- Sends a beautiful HTML email with celebration theme (green gradient header)
- Includes interview title, company name, and score (if available)
- Provides next steps and tips for the candidate
- Uses professional email template with emojis and styling

### 2. Interviews Service (`interviews.service.ts`)
Added `sendCongratulationsEmail()` method that:
- Verifies employer permissions
- Validates candidate interview exists and belongs to employer
- Checks if candidate has passed (`result === 'passed'`)
- Retrieves candidate and company information
- Sends both email and in-app notification
- Returns success confirmation

### 3. Interviews Controller (`interviews.controller.ts`)
Added endpoint:
```typescript
@Post(':interviewId/candidates/:candidateInterviewId/send-congratulations')
```

## Email Template Features

The congratulations email includes:
- 🎉 Celebration header with gradient background
- ✅ Success banner with confirmation message
- 📋 Interview and company details
- 🎯 Candidate's score (if available)
- 🚀 Next steps section with actionable items
- 💡 Pro tip for profile optimization
- Professional footer with branding

## Frontend Integration

### Example Usage
```typescript
// When employer clicks the Mail icon on a passed candidate
const response = await fetch(
  `/api/employer/interviews/${interviewId}/candidates/${candidateInterviewId}/send-congratulations`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

const result = await response.json();
if (result.success) {
  // Show success message
  toast.success(`Congratulations email sent to ${result.sentTo}`);
}
```

### UI Suggestions
- Show Mail icon only for candidates with `result === 'passed'`
- Disable button after sending to prevent duplicate emails
- Show confirmation toast with recipient email
- Add loading state while sending

## Requirements
- Candidate interview must have `result = 'passed'`
- Candidate must have a valid email address
- Employer must own the interview
- Email service must be configured

## Notifications
When email is sent, also creates an in-app notification:
- **Type:** `interview_passed`
- **Message:** "Congratulations! You passed the interview '{title}' from {company}"
- **Metadata:** Contains candidate_interview_id, interview_id, company_name

## Testing

### Manual Test Steps
1. Login as employer
2. Find a candidate interview with `result = 'passed'`
3. Send POST request to the endpoint
4. Verify email is received with correct information
5. Check in-app notification is created for the candidate

### Test Data
```sql
-- Update a candidate interview to passed status
UPDATE candidate_interviews 
SET result = 'passed', total_score = 85 
WHERE candidate_interview_id = 'YOUR_ID';
```

## Future Enhancements
- Track if congratulations email has been sent (add `congratulations_sent_at` column)
- Prevent sending duplicate emails
- Allow custom message from employer
- Email templates for different results (failed, pending review, etc.)
- Batch send for multiple candidates
