# DevPath AI - YouTube Tutorial Learning Platform

![DevPath AI](https://img.shields.io/badge/DevPath-AI-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)

DevPath AI transforms YouTube programming tutorials into interactive, structured learning experiences powered by OpenAI GPT-4o-mini. Extract concepts, generate summaries, take AI-powered quizzes, and visualize learning paths—all from a single YouTube link.

## 🌟 Features

### 📚 Tutorial Modules
- **YouTube Video Analysis**: Paste any YouTube programming tutorial link
- **AI-Powered Summaries**: Automatic extraction of key concepts and learning points
- **Interactive Chat**: Ask questions about the video content with AI mentor
- **Markdown Support**: Rich formatted summaries with code blocks and syntax highlighting

### 🧠 AI-Powered Quizzes
- **Dynamic Quiz Generation**: AI creates multiple-choice questions from video content
- **Adaptive Length**: Choose between Quick (3Q), Standard (5Q), Deep Dive (10Q), or Full Quiz
- **Real-time Feedback**: Instant explanations for correct and incorrect answers
- **Progress Tracking**: Dashboard with analytics, average scores, and progress charts
- **Quiz History**: Track all attempts with pass/fail status

### 🗺️ Concept Graphs
- **Visual Learning Roadmaps**: Interactive flowcharts with 15-20 nodes
- **Comprehensive Coverage**: Prerequisites, fundamentals, practical applications, best practices
- **Decision Points**: Branching paths for different learning approaches
- **Export Options**: Download graphs as PNG or SVG

### 📊 Dashboard & Analytics
- **Structured Lessons**: Organized view of all analyzed tutorials
- **Category Management**: Auto-categorization of tutorials by topic
- **Performance Metrics**: Track quizzes taken, average scores, and pass rates
- **Progress Visualization**: Line charts showing improvement over time

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful, modern interface with blur effects
- **Dark Mode**: Eye-friendly dark theme throughout
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Accessibility**: WCAG compliant with proper ARIA labels

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **Styling**: Tailwind CSS 3.4.17 with custom animations
- **UI Components**: Radix UI primitives + shadcn/ui
- **Animations**: Framer Motion 12.35.0
- **Charts**: Recharts 2.15.4
- **Routing**: React Router DOM 6.30.1
- **Markdown**: React Markdown with remark-gfm
- **Flow Diagrams**: XYFlow React 12.10.1

### Backend
- **Runtime**: Node.js with Express 5.2.1
- **AI**: OpenAI API (GPT-4o-mini)
- **Transcript Extraction**: youtube-transcript 1.2.1
- **Database**: In-memory storage with JSON persistence
- **CORS**: Enabled for cross-origin requests

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API Key

### Clone Repository
```bash
git clone https://github.com/shashank-tandan21/AI.git
cd AI/YTB
```

### Backend Setup
```bash
cd backend
npm install

# Create .env file
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# Start backend server
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:8080`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
OPENAI_API_KEY=sk-your-openai-api-key
PORT=5000
```

### OpenAI API Key
1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys section
3. Create a new API key
4. Add it to your `.env` file

## 📖 Usage Guide

### 1. Analyze a YouTube Tutorial
1. Open the application at `http://localhost:8080`
2. Navigate to "Tutorial Modules"
3. Paste a YouTube programming tutorial URL
4. Click "Analyze with AI"
5. Wait for AI to process the video (10-30 seconds)

### 2. Take a Quiz
1. Select a lesson from the sidebar
2. Click "Quizzes" in the secondary menu
3. Choose quiz length (Quick, Standard, Deep Dive, or Full)
4. Answer questions with instant feedback
5. Review explanations and track your score

### 3. View Concept Graph
1. Select a lesson from the sidebar
2. Click "Concept Graph" in the secondary menu
3. Explore the interactive learning roadmap
4. Download as PNG or SVG for offline reference

### 4. Chat with AI Mentor
1. Select a lesson from the sidebar
2. Click "Ask Question" in the AI Mentor section
3. Type your question about the video content
4. Get instant AI-powered answers with context

## 🏗️ Project Structure

```
YTB/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── data/
│   │   ├── modules.json         # Tutorial modules storage
│   │   └── quiz_attempts.json   # Quiz history storage
│   ├── models/
│   │   └── Module.js            # Module data model
│   ├── routes/
│   │   └── tutorialModules.js   # API routes
│   ├── .env                     # Environment variables
│   ├── server.js                # Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── TutorialModules.tsx
│   │   │   │   ├── QuizView.tsx
│   │   │   │   ├── ProjectFlowchart.tsx
│   │   │   │   ├── StructuredLessonsDashboard.tsx
│   │   │   │   └── GuidedCodingView.tsx
│   │   │   ├── landing/         # Landing page components
│   │   │   └── ui/              # Reusable UI components
│   │   ├── pages/
│   │   │   ├── Home.tsx         # Main dashboard
│   │   │   ├── Index.tsx        # Landing page
│   │   │   └── Auth.tsx         # Authentication
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   └── package.json
│
├── FEATURE_STATUS.md            # Feature implementation status
└── README.md                    # This file
```

## 🔌 API Endpoints

### Tutorial Modules

#### Analyze Video
```http
POST /api/tutorial-modules/analyze-video
Content-Type: application/json

{
  "videoUrl": "https://youtube.com/watch?v=..."
}
```

#### Get All Modules
```http
GET /api/tutorial-modules
```

#### Get Module by ID
```http
GET /api/tutorial-modules/:id
```

#### Delete Module
```http
DELETE /api/tutorial-modules/:id
```

### Quizzes

#### Get Quiz for Module
```http
GET /api/tutorial-modules/:id/quiz
```

#### Submit Quiz Attempt
```http
POST /api/tutorial-modules/:id/quiz/attempt
Content-Type: application/json

{
  "score": 8,
  "totalQuestions": 10,
  "passed": true
}
```

#### Get All Quiz Attempts
```http
GET /api/tutorial-modules/quiz/attempts
```

### Concept Graph

#### Get Concept Graph
```http
GET /api/tutorial-modules/:id/graph
```

### AI Chat

#### Ask Question
```http
POST /api/tutorial-modules/ask-video-question
Content-Type: application/json

{
  "videoUrl": "https://youtube.com/watch?v=...",
  "question": "What is the main concept?",
  "chatHistory": []
}
```

## 🎨 UI Components

### Custom Components
- **TutorialModules**: Video analysis and AI chat interface
- **QuizView**: Interactive quiz with real-time feedback
- **ProjectFlowchart**: Visual concept graph with React Flow
- **StructuredLessonsDashboard**: Organized lesson overview
- **GuidedCodingView**: Code practice interface

### UI Library (shadcn/ui)
- Accordion, Alert Dialog, Avatar, Badge
- Button, Card, Checkbox, Dialog
- Dropdown Menu, Form, Input, Label
- Progress, Radio Group, Select, Slider
- Tabs, Toast, Tooltip, and more

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🏗️ Build for Production

### Frontend
```bash
cd frontend
npm run build
```

Build output will be in `frontend/dist/`

### Backend
The backend runs directly with Node.js:
```bash
cd backend
npm start
```

## 🐛 Known Issues & Fixes

### Issue: Quizzes Not Loading
**Solution**: Backend was looking for `mod.quiz` instead of `mod.content.quiz`. Fixed in latest version.

### Issue: Sidebar Menu Not Working
**Solution**: Added `e.stopPropagation()` to prevent event bubbling. Fixed in latest version.

### Issue: Data Persisting Between Sessions
**Solution**: Implemented fresh start data management - data clears on server restart.

## 🔄 Recent Updates

### v1.0.0 (Latest)
- ✅ Fixed 27 diagnostic issues (accessibility, code quality)
- ✅ Added `type="button"` to all buttons
- ✅ Converted 25+ inline styles to Tailwind classes
- ✅ Fixed quiz endpoint bug (`mod.content.quiz`)
- ✅ Enhanced concept graphs (15-20 nodes)
- ✅ Implemented fresh start data management
- ✅ Added comprehensive quiz dashboard with analytics
- ✅ Fixed sidebar menu click issues

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Shashank Tandan**
- GitHub: [@shashank-tandan21](https://github.com/shashank-tandan21)

## 🙏 Acknowledgments

- OpenAI for GPT-4o-mini API
- shadcn/ui for beautiful UI components
- Radix UI for accessible primitives
- React Flow for interactive diagrams
- Tailwind CSS for styling utilities

## 📧 Support

For support, email or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] User authentication and profiles
- [ ] Cloud storage integration
- [ ] Collaborative learning features
- [ ] Mobile app (React Native)
- [ ] Video bookmarking and notes
- [ ] Spaced repetition system
- [ ] Community-shared learning paths
- [ ] Integration with more video platforms

---

Made with ❤️ by Shashank Tandan
