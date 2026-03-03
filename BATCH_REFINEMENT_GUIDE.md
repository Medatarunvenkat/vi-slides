# Batched Question Refinement System - Implementation Guide

## Overview
The classroom system now includes an intelligent question batching and refinement system that:
- Queues student questions temporarily
- Batches them every 10 seconds (configurable)
- Sends them to the LLM for grammar/clarity refinement
- Preserves original meaning while improving readability
- Displays refined questions on the teacher's slide with markers

## Architecture

### Components

#### 1. **questionBatchService.ts** (Backend Service)
Location: `backend/src/services/questionBatchService.ts`

**Key Functions:**
- `queueQuestion(question)` - Adds a question to the batch queue
- `processBatch(sessionId)` - Processes all queued questions for a session
- `triggerBatchProcessing(sessionId)` - Manual batch trigger for testing
- `getQueueStats()` - Returns current queue statistics
- `clearQueue(sessionId)` - Clears queue when session ends

**Configuration:**
```typescript
const BATCH_INTERVAL = 10000; // 10 seconds - adjustable
const MAX_BATCH_SIZE = 50; // Process immediately if batch grows to 50
```

#### 2. **aiService.ts** Enhancement (Backend)
Location: `backend/src/services/aiService.ts`

**New Function:**
```typescript
export const batchRefineQuestions = async (questions: { id: string; content: string }[])
```

Features:
- Takes multiple questions at once
- Asks LLM to refine for grammar, clarity, punctuation
- Preserves original meaning
- Returns structured JSON with refinement details
- Fallback to original questions if API fails

#### 3. **Question Model Update** (Backend)
Location: `backend/src/models/Question.ts`

**New Fields:**
```typescript
refinementStatus?: 'pending' | 'completed' | 'failed'
refinedContent?: string      // Grammar-improved version
originalContent?: string     // Student-submitted version
refinementTimestamp?: Date   // When refinement completed
```

#### 4. **Question Controller Update** (Backend)
Location: `backend/src/controllers/questionController.ts`

**Modified Flow:**
1. Student submits question via POST `/api/questions`
2. Question is created with `refinementStatus: 'pending'`
3. Original content is stored in `originalContent` field
4. Question is immediately queued for batch refinement
5. Question appears in UI with "Refining..." badge

#### 5. **Frontend Components**

**QuestionCard.tsx Updates:**
- Shows "Refining grammar & clarity..." badge when `refinementStatus === 'pending'`
- Shows "✓ Refined by AI" badge when `refinementStatus === 'completed'`
- Expandable "Original submission" section showing before/after
- Seamless UI updates when refinement completes

**Socket Service Updates:**
- Listens to `questions_refined` event for batches
- Listens to `batch_refinement_failed` event for error handling
- Updates question objects in real-time

## Data Flow

```
Student writes question
        ↓
POST /api/questions
        ↓
Question created with refinementStatus: 'pending'
        ↓
queueQuestion() - Added to batch queue
        ↓
[Emits 'new_question' to teacher with pending status]
        ↓
10 seconds elapse (BATCH_INTERVAL)
        ↓
processBatch() - Collects all queued questions
        ↓
batchRefineQuestions() - Send to LLM
        ↓
LLM returns refined questions in JSON format
        ↓
Update Question documents with refinedContent
        ↓
Emit 'questions_refined' socket event
        ↓
Frontend receives, updates UI with refined content
        ↓
Teacher sees improved question on slide
```

## API Endpoints

### Create Question (Existing)
```http
POST /api/questions
Content-Type: application/json

{
  "content": "What is the difference between let and const?",
  "sessionId": "session_id_here",
  "isDirectToTeacher": true
}

Response includes refinementStatus: 'pending'
```

### Manual Batch Trigger (New)
```http
POST /api/questions/batch/process/:sessionId
Authorization: Bearer <teacher_token>

Response: 202 Accepted
{
  "success": true,
  "message": "Batch refinement triggered..."
}
```

## Socket Events

### Emitted by Backend → Frontend

**questions_refined**
```javascript
{
  count: 3,
  questions: [
    {
      _id: "...",
      content: "refined version",
      refinedContent: "refined version",
      originalContent: "original version",
      refinementStatus: "completed",
      refinementTimestamp: "2026-03-02T..."
    }
  ],
  batchTimestamp: "2026-03-02T..."
}
```

**batch_refinement_failed**
```javascript
{
  error: "Failed to refine questions. Will retry.",
  count: 3  // Number of questions that failed
}
```

## Testing the System

### 1. **Manual Testing**

**Step 1: Start the application**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm run dev
```

**Step 2: Create a session and join as teacher**

**Step 3: Have a test user ask a question with grammar errors:**
```
"what is the diference between async and await functsion?"
```

You should see:
- Question appears with "Refining grammar & clarity..." spinner
- After 10 seconds, content updates to refined version
- "✓ Refined by AI" badge appears
- Original submission visible in expandable section

**Step 4: Ask multiple questions in quick succession**
```
Q1: "what is destructuring"
Q2: "how do i useeffects"
Q3: "why is my component re-rendering to much"
```

All three should be batched and refined together.

### 2. **Automatic Testing**

**Queue Statistics**
In the backend server.ts or a test endpoint, you can check queue status:
```typescript
import { getQueueStats } from './services/questionBatchService';
const stats = getQueueStats();
console.log(stats); // { sessionId123: 5, sessionId456: 2 }
```

**Manual Batch Trigger**
```bash
# Trigger batch immediately instead of waiting 10 seconds
POST http://localhost:5001/api/questions/batch/process/{sessionId}
```

### 3. **Configuration for Testing**

To test faster, modify `questionBatchService.ts`:
```typescript
// Reduce interval for testing
const BATCH_INTERVAL = 3000; // 3 seconds instead of 10
```

## Performance Considerations

### Benefits
1. **Reduced LLM Calls**: Instead of 1 call per question, now 1 call per batch
2. **Better UX**: Users see questions appear immediately, then improved
3. **Cost Optimization**: Fewer API calls = lower costs
4. **Scalability**: Handles multiple concurrent sessions with queuing

### Example Savings
- 30 students asking questions in 30 seconds
- **Old System**: 30 LLM API calls
- **New System**: 3 LLM API calls (@ 10-second intervals)
- **Savings**: 90% fewer API calls

## Error Handling

### Failed Refinement
If LLM refinement fails:
1. Questions are re-queued for retry
2. `batch_refinement_failed` event emitted to teacher
3. Questions display with original content as fallback
4. Retry happens automatically at next interval

### Queue Cleanup
When session ends:
- `clearQueue(sessionId)` removes all pending questions
- Timers are cleared
- No orphaned data

## Future Enhancements

1. **Configurable Batch Interval**: Allow teachers to set custom intervals
2. **Selective Refinement**: Let teachers choose which questions to refine
3. **Refinement History**: Track all refinements with timestamps
4. **Custom Prompts**: Different refinement strategies (conciseness, detail level)
5. **Webhook Support**: Send refined questions to external systems
6. **Analytics**: Track refinement impact on engagement

## Troubleshooting

### Questions not being refined
- Check if GEMINI_API_KEY is set in `.env`
- Verify "Generative Language API" is enabled in Google Cloud
- Check server logs for batch processing errors
- Ensure session is active (not ended)

### Refinement takes too long
- Increase `MAX_BATCH_SIZE` to process sooner when batch fills up
- Decrease `BATCH_INTERVAL` for faster processing
- Check network latency to LLM API

### Duplicate questions in UI
- Socket listeners have deduplication checks
- If still occurring, check socket connection stability

## Code Quality Notes

✅ **Good practices implemented:**
- Proper error handling with fallbacks
- Memory leak prevention with listener cleanup
- Input validation and sanitization
- Async/await for non-blocking operations
- Logging for debugging
- Type safety with TypeScript

## Integration with Existing Features

The system integrates seamlessly with:
- ✅ Teacher responses (can respond to refined questions)
- ✅ Question pinning (pins work on refined questions)
- ✅ AI analysis (separate from refinement)
- ✅ Upvoting system (unchanged)
- ✅ Question deletion (clears from queue if pending)
