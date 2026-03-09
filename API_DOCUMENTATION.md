# DevPath AI - API Documentation

Complete API reference for the DevPath AI backend server.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

---

## Tutorial Modules

### 1. Analyze YouTube Video

Analyzes a YouTube video and extracts learning content using AI.

**Endpoint:** `POST /tutorial-modules/analyze-video`

**Request Body:**
```json
{
  "videoUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response:** `200 OK`
```json
{
  "summary": "# Video Title\n\n## Key Concepts\n...",
  "moduleData": {
    "id": "uuid-here",
    "title": "Video Title",
    "source_video_id": "dQw4w9WgXcQ",
    "source_url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "category": "JavaScript",
    "content": {
      "raw_markdown": "...",
      "quiz": {
        "title": "Quiz Title",
        "difficulty": "intermediate",
        "timeLimit": 600,
        "questions": [...]
      },
      "concept_graph": {
        "nodes": [...],
        "edges": [...]
      }
    },
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid videoUrl
- `500 Internal Server Error`: AI processing failed

**Processing Time:** 10-30 seconds depending on video length

---

### 2. Get All Modules

Retrieves all analyzed tutorial modules.

**Endpoint:** `GET /tutorial-modules`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid-1",
    "title": "JavaScript Basics",
    "source_video_id": "abc123",
    "source_url": "https://youtube.com/watch?v=abc123",
    "category": "JavaScript",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "title": "React Hooks Tutorial",
    "source_video_id": "def456",
    "source_url": "https://youtube.com/watch?v=def456",
    "category": "React",
    "created_at": "2024-01-02T00:00:00.000Z"
  }
]
```

---

### 3. Get Module by ID

Retrieves a specific module with full content.

**Endpoint:** `GET /tutorial-modules/:id`

**Parameters:**
- `id` (string, required): Module UUID

**Response:** `200 OK`
```json
{
  "id": "uuid-here",
  "title": "JavaScript Basics",
  "source_video_id": "abc123",
  "source_url": "https://youtube.com/watch?v=abc123",
  "category": "JavaScript",
  "content": {
    "raw_markdown": "# JavaScript Basics\n\n## Variables\n...",
    "quiz": {...},
    "concept_graph": {...}
  },
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Module does not exist

---

### 4. Delete Module

Deletes a tutorial module and all associated data.

**Endpoint:** `DELETE /tutorial-modules/:id`

**Parameters:**
- `id` (string, required): Module UUID

**Response:** `200 OK`
```json
{
  "message": "Module deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: Module does not exist

---

## Quizzes

### 5. Get Quiz for Module

Retrieves the AI-generated quiz for a specific module.

**Endpoint:** `GET /tutorial-modules/:id/quiz`

**Parameters:**
- `id` (string, required): Module UUID

**Response:** `200 OK`
```json
{
  "title": "JavaScript Basics Quiz",
  "difficulty": "intermediate",
  "timeLimit": 600,
  "questions": [
    {
      "id": "q1",
      "question": "What is a closure in JavaScript?",
      "type": "multiple_choice",
      "options": [
        "A function inside another function",
        "A way to close the browser",
        "A type of loop",
        "A CSS property"
      ],
      "correctAnswer": 0,
      "explanation": "A closure is a function that has access to variables in its outer scope..."
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: Module or quiz does not exist
- `500 Internal Server Error`: Quiz data is malformed

---

### 6. Submit Quiz Attempt

Records a quiz attempt with score and pass/fail status.

**Endpoint:** `POST /tutorial-modules/:id/quiz/attempt`

**Parameters:**
- `id` (string, required): Module UUID

**Request Body:**
```json
{
  "score": 8,
  "totalQuestions": 10,
  "passed": true
}
```

**Response:** `200 OK`
```json
{
  "message": "Quiz attempt saved successfully",
  "attempt": {
    "id": "attempt-uuid",
    "moduleId": "module-uuid",
    "score": 8,
    "totalQuestions": 10,
    "passed": true,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `404 Not Found`: Module does not exist

---

### 7. Get All Quiz Attempts

Retrieves all quiz attempts across all modules.

**Endpoint:** `GET /tutorial-modules/quiz/attempts`

**Response:** `200 OK`
```json
[
  {
    "id": "attempt-1",
    "moduleId": "module-uuid-1",
    "score": 8,
    "totalQuestions": 10,
    "passed": true,
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "attempt-2",
    "moduleId": "module-uuid-2",
    "score": 6,
    "totalQuestions": 10,
    "passed": false,
    "timestamp": "2024-01-02T00:00:00.000Z"
  }
]
```

---

## Concept Graphs

### 8. Get Concept Graph

Retrieves the visual learning roadmap for a module.

**Endpoint:** `GET /tutorial-modules/:id/graph`

**Parameters:**
- `id` (string, required): Module UUID

**Response:** `200 OK`
```json
{
  "nodes": [
    {
      "id": "1",
      "type": "start",
      "position": { "x": 300, "y": 50 },
      "data": {
        "label": "Start: JavaScript Basics",
        "description": "Begin your journey into JavaScript programming"
      }
    },
    {
      "id": "2",
      "type": "concept",
      "position": { "x": 300, "y": 150 },
      "data": {
        "label": "Variables & Data Types",
        "description": "Learn about var, let, const and primitive types"
      }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2",
      "label": "First Step",
      "type": "smoothstep",
      "animated": true
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: Module or graph does not exist

---

## AI Chat

### 9. Ask Question About Video

Ask questions about video content using AI with conversation context.

**Endpoint:** `POST /tutorial-modules/ask-video-question`

**Request Body:**
```json
{
  "videoUrl": "https://youtube.com/watch?v=abc123",
  "question": "What is the main concept explained in this video?",
  "chatHistory": [
    {
      "role": "user",
      "content": "Previous question"
    },
    {
      "role": "ai",
      "content": "Previous answer"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "answer": "The main concept explained in this video is closures in JavaScript. A closure is a function that has access to variables in its outer scope, even after the outer function has returned..."
}
```

**Error Responses:**
- `400 Bad Request`: Missing videoUrl or question
- `500 Internal Server Error`: AI processing failed

**Processing Time:** 2-5 seconds

---

## Data Models

### Module
```typescript
interface Module {
  id: string;                    // UUID
  title: string;                 // Video title
  source_video_id: string;       // YouTube video ID
  source_url: string;            // Full YouTube URL
  category: string;              // Auto-detected category
  content: {
    raw_markdown: string;        // AI-generated summary
    quiz: Quiz;                  // Quiz object
    concept_graph: ConceptGraph; // Graph object
  };
  created_at: string;            // ISO 8601 timestamp
}
```

### Quiz
```typescript
interface Quiz {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number;             // Seconds
  questions: Question[];
}

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice';
  options: string[];             // 4 options
  correctAnswer: number;         // Index (0-3)
  explanation: string;
}
```

### Quiz Attempt
```typescript
interface QuizAttempt {
  id: string;                    // UUID
  moduleId: string;              // Reference to module
  score: number;                 // Correct answers
  totalQuestions: number;
  passed: boolean;               // >= 70% to pass
  timestamp: string;             // ISO 8601 timestamp
}
```

### Concept Graph
```typescript
interface ConceptGraph {
  nodes: Node[];
  edges: Edge[];
}

interface Node {
  id: string;
  type: 'start' | 'concept' | 'decision' | 'end';
  position: { x: number; y: number };
  data: {
    label: string;
    description: string;
  };
}

interface Edge {
  id: string;
  source: string;                // Source node ID
  target: string;                // Target node ID
  label: string;
  type: 'smoothstep' | 'straight';
  animated: boolean;
}
```

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Error message description",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Rate Limiting

Currently, there are no rate limits. However, OpenAI API has its own rate limits:
- GPT-4o-mini: 500 requests per minute
- Consider implementing caching for frequently accessed content

---

## Data Storage

### In-Memory Storage
- All data is stored in memory during runtime
- Fast access and no database setup required

### JSON Persistence
- Data is saved to JSON files during runtime:
  - `backend/data/modules.json`
  - `backend/data/quiz_attempts.json`

### Fresh Start Policy
- Data is cleared on server restart
- Ensures clean state for each session
- No persistent storage between sessions

---

## Best Practices

### 1. Video URL Validation
Always validate YouTube URLs before sending to the API:
```javascript
const isValidYouTubeUrl = (url) => {
  const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
  return regex.test(url);
};
```

### 2. Error Handling
Always handle errors gracefully:
```javascript
try {
  const response = await fetch('/api/tutorial-modules/analyze-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoUrl })
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze video');
  }
  
  const data = await response.json();
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly error message
}
```

### 3. Loading States
Show loading indicators for long-running operations:
- Video analysis: 10-30 seconds
- Quiz generation: Included in video analysis
- AI chat: 2-5 seconds

### 4. Caching
Consider caching frequently accessed data:
- Module lists
- Quiz data
- Concept graphs

---

## Example Usage

### Complete Flow: Analyze Video → Take Quiz → View Results

```javascript
// 1. Analyze video
const analyzeVideo = async (videoUrl) => {
  const response = await fetch('/api/tutorial-modules/analyze-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoUrl })
  });
  return response.json();
};

// 2. Get quiz
const getQuiz = async (moduleId) => {
  const response = await fetch(`/api/tutorial-modules/${moduleId}/quiz`);
  return response.json();
};

// 3. Submit quiz attempt
const submitQuiz = async (moduleId, score, totalQuestions, passed) => {
  const response = await fetch(`/api/tutorial-modules/${moduleId}/quiz/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score, totalQuestions, passed })
  });
  return response.json();
};

// Usage
const videoUrl = 'https://youtube.com/watch?v=abc123';
const { moduleData } = await analyzeVideo(videoUrl);
const quiz = await getQuiz(moduleData.id);
// User takes quiz...
await submitQuiz(moduleData.id, 8, 10, true);
```

---

## Support

For API issues or questions:
- Open an issue on GitHub
- Check the main README.md for general documentation
- Review FEATURE_STATUS.md for implementation details

---

Last Updated: 2024
Version: 1.0.0
