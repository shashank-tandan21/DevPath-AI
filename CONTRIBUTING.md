# Contributing to DevPath AI

Thank you for your interest in contributing to DevPath AI! This document provides guidelines and instructions for contributing to the project.

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- OpenAI API Key
- Basic knowledge of React, TypeScript, and Express.js

### Setting Up Development Environment

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub
   # Then clone your fork
   git clone https://github.com/YOUR_USERNAME/AI.git
   cd AI/YTB
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Create .env file in backend directory
   cd backend
   echo "OPENAI_API_KEY=your_key_here" > .env
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## 📝 How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

**Bug Report Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node.js version: [e.g., 18.0.0]

**Additional context**
Any other relevant information.
```

### Suggesting Features

Feature suggestions are welcome! Please provide:
- Clear description of the feature
- Use cases and benefits
- Potential implementation approach
- Any relevant examples or mockups

### Pull Request Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   # Run tests
   npm test
   
   # Check for linting errors
   npm run lint
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   
   **Commit Message Format:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Adding or updating tests
   - `chore:` Maintenance tasks

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Wait for review

## 🎨 Code Style Guidelines

### TypeScript/JavaScript

```typescript
// ✅ Good
const analyzeVideo = async (videoUrl: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ videoUrl })
    });
    return await response.json();
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
};

// ❌ Bad
const analyzeVideo = async (videoUrl) => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ videoUrl })
  });
  return await response.json();
};
```

### React Components

```typescript
// ✅ Good - Functional component with TypeScript
interface QuizProps {
  moduleId: string;
  onComplete: (score: number) => void;
}

export const Quiz: React.FC<QuizProps> = ({ moduleId, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  return (
    <div className="quiz-container">
      {/* Component content */}
    </div>
  );
};

// ❌ Bad - Missing types
export const Quiz = ({ moduleId, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  return <div>{/* content */}</div>;
};
```

### CSS/Tailwind

```tsx
// ✅ Good - Use Tailwind classes
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
  Click Me
</button>

// ❌ Bad - Inline styles (except for dynamic values)
<button style={{ padding: '8px 16px', backgroundColor: 'blue' }}>
  Click Me
</button>
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `QuizView.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Constants: `UPPER_SNAKE_CASE.ts` (e.g., `API_ENDPOINTS.ts`)

## 🧪 Testing Guidelines

### Writing Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Quiz } from './Quiz';

describe('Quiz Component', () => {
  it('should render quiz questions', () => {
    render(<Quiz moduleId="test-id" onComplete={jest.fn()} />);
    expect(screen.getByText(/question/i)).toBeInTheDocument();
  });
  
  it('should handle answer selection', () => {
    const onComplete = jest.fn();
    render(<Quiz moduleId="test-id" onComplete={onComplete} />);
    
    const option = screen.getByText('Option A');
    fireEvent.click(option);
    
    expect(option).toHaveClass('selected');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 Documentation

### Code Comments

```typescript
/**
 * Analyzes a YouTube video and extracts learning content
 * @param videoUrl - Full YouTube video URL
 * @returns Promise with analysis results including summary and quiz
 * @throws Error if video URL is invalid or API fails
 */
async function analyzeVideo(videoUrl: string): Promise<AnalysisResult> {
  // Implementation
}
```

### README Updates

When adding new features, update:
- Main README.md with feature description
- API_DOCUMENTATION.md if adding/changing endpoints
- FEATURE_STATUS.md with implementation status

## 🔍 Code Review Process

### What Reviewers Look For

1. **Functionality**
   - Does the code work as intended?
   - Are edge cases handled?
   - Is error handling appropriate?

2. **Code Quality**
   - Is the code readable and maintainable?
   - Are there any code smells?
   - Is it following best practices?

3. **Testing**
   - Are there adequate tests?
   - Do tests cover edge cases?
   - Are tests meaningful?

4. **Documentation**
   - Is the code well-commented?
   - Is documentation updated?
   - Are breaking changes noted?

### Responding to Feedback

- Be open to suggestions
- Ask questions if unclear
- Make requested changes promptly
- Thank reviewers for their time

## 🎯 Priority Areas for Contribution

### High Priority
- [ ] User authentication system
- [ ] Cloud storage integration
- [ ] Mobile responsiveness improvements
- [ ] Performance optimizations
- [ ] Accessibility enhancements

### Medium Priority
- [ ] Additional quiz types (true/false, fill-in-blank)
- [ ] Video bookmarking feature
- [ ] Export learning notes
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts

### Low Priority
- [ ] Social sharing features
- [ ] Gamification elements
- [ ] Custom themes
- [ ] Browser extensions

## 🐛 Common Issues and Solutions

### Issue: OpenAI API Rate Limits
**Solution:** Implement request queuing and caching

### Issue: Large Video Processing
**Solution:** Add progress indicators and chunked processing

### Issue: Memory Leaks
**Solution:** Proper cleanup in useEffect hooks

## 📞 Getting Help

- **Questions:** Open a GitHub Discussion
- **Bugs:** Create an Issue with bug template
- **Features:** Create an Issue with feature template
- **Chat:** Join our community (if available)

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the ISC License.

## 🙏 Thank You!

Every contribution, no matter how small, is valuable and appreciated. Thank you for helping make DevPath AI better!

---

**Questions?** Feel free to reach out by opening an issue or discussion on GitHub.
