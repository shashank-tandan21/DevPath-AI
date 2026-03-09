const express = require('express');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const { YoutubeTranscript } = require('youtube-transcript');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');

// Ensure unique debug ID to confirm the correct version is running
console.log("=== ROUTE BOOT: VERIFIED_ZERO_TRUST_PROMPT_V3 ===");

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// START FRESH - Clear old data on startup
let modules = [];
let quizAttempts = [];

// Clear existing data files on startup
try {
  fs.writeFileSync(path.join(__dirname, '../data/modules.json'), JSON.stringify([], null, 2));
  console.log('🧹 Cleared modules.json - Starting fresh');
} catch (err) {
  console.log('⚠️  Could not clear modules.json');
}

try {
  fs.writeFileSync(path.join(__dirname, '../data/quiz_attempts.json'), JSON.stringify([], null, 2));
  console.log('🧹 Cleared quiz_attempts.json - Starting fresh');
} catch (err) {
  console.log('⚠️  Could not clear quiz_attempts.json');
}

console.log('✨ Server starting with clean slate - all data will be saved during runtime');

// Helper functions to save data to JSON files during runtime
const saveModules = () => {
  try {
    fs.writeFileSync(path.join(__dirname, '../data/modules.json'), JSON.stringify(modules, null, 2));
    console.log('💾 Modules saved to modules.json');
  } catch (err) {
    console.error('❌ Error saving modules:', err);
  }
};

const saveQuizAttempts = () => {
  try {
    fs.writeFileSync(path.join(__dirname, '../data/quiz_attempts.json'), JSON.stringify(quizAttempts, null, 2));
    console.log('💾 Quiz attempts saved to quiz_attempts.json');
  } catch (err) {
    console.error('❌ Error saving quiz attempts:', err);
  }
};

// Cleanup on server shutdown
process.on('SIGINT', () => {
  console.log('\n🧹 Server shutting down - clearing all data...');
  try {
    fs.writeFileSync(path.join(__dirname, '../data/modules.json'), JSON.stringify([], null, 2));
    fs.writeFileSync(path.join(__dirname, '../data/quiz_attempts.json'), JSON.stringify([], null, 2));
    console.log('✅ Data cleared successfully');
  } catch (err) {
    console.error('❌ Error clearing data:', err);
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🧹 Server shutting down - clearing all data...');
  try {
    fs.writeFileSync(path.join(__dirname, '../data/modules.json'), JSON.stringify([], null, 2));
    fs.writeFileSync(path.join(__dirname, '../data/quiz_attempts.json'), JSON.stringify([], null, 2));
    console.log('✅ Data cleared successfully');
  } catch (err) {
    console.error('❌ Error clearing data:', err);
  }
  process.exit(0);
});

const extractVideoId = (url) => {
  if (!url) return false;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : false;
};

// GET: Fetch all modules
router.get('/', (req, res) => {
  res.json(modules);
});

// GET: Fetch all quiz attempts (MUST come before /:id route)
router.get('/quiz/attempts', (req, res) => {
  res.json(quizAttempts);
});

// GET: Fetch specific module
router.get('/:id', (req, res) => {
  const mod = modules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).json({ error: 'Module not found' });
  res.json(mod);
});

// GET: Fetch quiz for a specific module
router.get('/:id/quiz', (req, res) => {
  const mod = modules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).json({ error: 'Module not found' });
  
  // Quiz is stored in mod.content.quiz, not mod.quiz
  const quizData = mod.content?.quiz || { questions: [] };
  
  // If quiz is an array (old format), convert to object format
  if (Array.isArray(quizData)) {
    res.json({
      title: `${mod.title} Quiz`,
      difficulty: mod.difficulty || 'intermediate',
      timeLimit: 300, // 5 minutes default
      questions: quizData
    });
  } else {
    // Already in object format
    res.json({
      title: quizData.title || `${mod.title} Quiz`,
      difficulty: quizData.difficulty || mod.difficulty || 'intermediate',
      timeLimit: quizData.timeLimit || 300,
      questions: quizData.questions || []
    });
  }
});

// POST: Save quiz attempt
router.post('/:id/quiz/attempt', (req, res) => {
  const { score, totalQuestions, passed } = req.body;
  const moduleId = req.params.id;
  
  const attempt = {
    id: `attempt_${Date.now()}`,
    moduleId,
    score,
    totalQuestions,
    passed,
    timestamp: new Date().toISOString()
  };
  
  quizAttempts.push(attempt);
  console.log(`Quiz attempt saved: ${score}/${totalQuestions} for module ${moduleId}`);
  
  // Save to JSON file
  saveQuizAttempts();
  
  res.json({ success: true, attempt });
});

// GET: Fetch concept graph for a specific module
router.get('/:id/graph', (req, res) => {
  const mod = modules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).json({ error: 'Module not found' });
  
  const graphData = mod.content?.concept_graph;
  
  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return res.status(404).json({ 
      error: 'No concept graph available for this module',
      nodes: [],
      edges: []
    });
  }
  
  res.json(graphData);
});

// POST: Analyze Video
router.post('/analyze-video', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) return res.status(400).json({ error: 'Missing videoUrl' });

    const videoId = extractVideoId(videoUrl);
    if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

    console.log(`Analyzing video ID: ${videoId}... (NO CACHE)`);

    // Fetch video metadata (Title & Description) as fallback or enrichment
    let videoTitle = "Unknown Title";
    let videoDescription = "No description available.";
    try {
      console.log(`Fetching metadata for video ${videoId}...`);
      const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
      const html = await pageRes.text();

      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      if (titleMatch && titleMatch[1]) {
        videoTitle = titleMatch[1].replace(" - YouTube", "").trim();
      }

      const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
      if (descMatch && descMatch[1]) {
        videoDescription = descMatch[1].trim();
      }
    } catch (err) {
      console.warn("Could not fetch video metadata:", err.message);
    }

    let transcriptText = '';
    let fallbackMethod = 'YouTube Transcript API';

    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      if (!transcript || transcript.length === 0) {
        throw new Error("Empty transcript returned");
      }
      transcriptText = transcript.map(t => t.text).join(' ');
      console.log(`[Method: ${fallbackMethod}] Transcript fetched successfully.`);
    } catch (err) {
      console.warn("[Method: YouTube Transcript API] Failed. Trying yt-dlp + whisper fallback...");

      fallbackMethod = 'Whisper Audio Transcription';
      let audioPath = null;
      try {
        audioPath = path.join(__dirname, `../temp_${videoId}.m4a`);
        // Download audio using yt-dlp
        console.log(`Downloading audio for video ${videoId} to ${audioPath}...`);
        await youtubedl(videoUrl, {
          f: 'bestaudio[ext=m4a]/bestaudio',
          output: audioPath
        });

        console.log(`Audio downloaded. Sending to OpenAI Whisper API...`);
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(audioPath),
          model: "whisper-1",
        });

        transcriptText = transcription.text;
        console.log(`[Method: ${fallbackMethod}] Transcription successful.`);
      } catch (audioErr) {
        console.error(`[Method: Whisper Audio Transcription] Failed:`, audioErr.message);
        fallbackMethod = 'Title/Description Metadata';
        console.warn(`[Method: ${fallbackMethod}] Relying on fetched title and description.`);
        transcriptText = "[TRANSCRIPT UNAVAILABLE]";
      } finally {
        if (audioPath && fs.existsSync(audioPath)) {
          console.log(`Cleaning up temporary audio file: ${audioPath}`);
          try { fs.unlinkSync(audioPath); } catch (e) { console.error("Failed to delete temp audio", e); }
        }
      }
    }

    const systemMessage = "You are a precise educational API. You MUST NOT hallucinate technical content. Generate a comprehensive tutorial module based on the provided YouTube Video Title, Description, and Transcript. If the transcript is unavailable, rely entirely on the Title and Description to infer the educational concepts and build a comprehensive module anyway.";
    const userMessage = `VITAL: Analyze video ID: ${videoId} at URL: ${videoUrl}.
      
      VIDEO TITLE: ${videoTitle}
      VIDEO DESCRIPTION: ${videoDescription}

      HERE IS THE ACTUAL TRANSCRIPT:
      ${transcriptText}
      
      INSTRUCTIONS:
      1. Carefully examine the Title, Description, and Transcript.
      2. If the Transcript is "[TRANSCRIPT UNAVAILABLE]", build a comprehensive module using purely the exact topics mentioned in the Title and Description.
      3. If the video appears entirely unrelated to technical education or learning and you cannot confidently build a basic module from the Title/Description, you MAY return the generic error JSON (Could Not Analyze Video). But you MUST try your best to build a module from the Title/Description if they contain valid technical or educational concepts.
      4. Always output VALID JSON matching the format below.
      
      JSON FORMAT FOR SUCCESSFUL ANALYSIS:
      {
        "title": "Precise Title of the Video topic",
        "description": "Engaging description",
        "category": "Topic Name (e.g. Machine Learning, React, CSS, etc.)",
        "difficulty": "Beginner/Intermediate/Advanced",
        "estimated_time_minutes": 30,
        "content": {
          "raw_markdown": "# Video Topic\n\nLesson content here...",
          "learning_objectives": ["Obj 1", "Obj 2"],
          "key_concepts": ["Concept 1", "Concept 2"],
          "primary_language": "Language used",
          "starter_code_language": "Slug",
          "practice_tasks": [
            {
              "title": "Task 1",
              "description": "Step-by-step instruction",
              "requirements": ["Req 1"],
              "starter_code": "Code Scaffold",
              "hints": ["Small Hint"]
            }
          ],
          "concept_graph": {
            "nodes": [
              {
                "id": "1",
                "label": "Start: Topic Overview",
                "type": "Start",
                "position": { "x": 300, "y": 50 }
              },
              {
                "id": "2",
                "label": "Prerequisites & Setup",
                "type": "Process",
                "position": { "x": 150, "y": 150 }
              },
              {
                "id": "3",
                "label": "Core Fundamentals",
                "type": "Process",
                "position": { "x": 450, "y": 150 }
              },
              {
                "id": "4",
                "label": "Key Concept 1",
                "type": "Process",
                "position": { "x": 100, "y": 250 }
              },
              {
                "id": "5",
                "label": "Key Concept 2",
                "type": "Process",
                "position": { "x": 300, "y": 250 }
              },
              {
                "id": "6",
                "label": "Key Concept 3",
                "type": "Process",
                "position": { "x": 500, "y": 250 }
              },
              {
                "id": "7",
                "label": "Practical Application",
                "type": "Display",
                "position": { "x": 200, "y": 350 }
              },
              {
                "id": "8",
                "label": "Advanced Techniques",
                "type": "Process",
                "position": { "x": 400, "y": 350 }
              },
              {
                "id": "9",
                "label": "Decision: Choose Path",
                "type": "Decision",
                "position": { "x": 300, "y": 450 }
              },
              {
                "id": "10",
                "label": "Path A: Deep Dive",
                "type": "Process",
                "position": { "x": 150, "y": 550 }
              },
              {
                "id": "11",
                "label": "Path B: Broad Overview",
                "type": "Process",
                "position": { "x": 450, "y": 550 }
              },
              {
                "id": "12",
                "label": "Best Practices",
                "type": "Display",
                "position": { "x": 100, "y": 650 }
              },
              {
                "id": "13",
                "label": "Common Pitfalls",
                "type": "Error",
                "position": { "x": 300, "y": 650 }
              },
              {
                "id": "14",
                "label": "Optimization Tips",
                "type": "Process",
                "position": { "x": 500, "y": 650 }
              },
              {
                "id": "15",
                "label": "Real-World Examples",
                "type": "Display",
                "position": { "x": 200, "y": 750 }
              },
              {
                "id": "16",
                "label": "Testing & Debugging",
                "type": "Process",
                "position": { "x": 400, "y": 750 }
              },
              {
                "id": "17",
                "label": "Integration & Deployment",
                "type": "Process",
                "position": { "x": 300, "y": 850 }
              },
              {
                "id": "18",
                "label": "Next Steps & Resources",
                "type": "End",
                "position": { "x": 300, "y": 950 }
              }
            ],
            "edges": [
              {
                "id": "e1-2",
                "source": "1",
                "target": "2",
                "label": "begin with"
              },
              {
                "id": "e1-3",
                "source": "1",
                "target": "3",
                "label": "understand"
              },
              {
                "id": "e2-4",
                "source": "2",
                "target": "4",
                "label": "leads to"
              },
              {
                "id": "e3-5",
                "source": "3",
                "target": "5",
                "label": "builds into"
              },
              {
                "id": "e3-6",
                "source": "3",
                "target": "6",
                "label": "expands to"
              },
              {
                "id": "e4-7",
                "source": "4",
                "target": "7",
                "label": "apply in"
              },
              {
                "id": "e5-7",
                "source": "5",
                "target": "7",
                "label": "use for"
              },
              {
                "id": "e6-8",
                "source": "6",
                "target": "8",
                "label": "advance to"
              },
              {
                "id": "e7-9",
                "source": "7",
                "target": "9",
                "label": "choose"
              },
              {
                "id": "e8-9",
                "source": "8",
                "target": "9",
                "label": "decide"
              },
              {
                "id": "e9-10",
                "source": "9",
                "target": "10",
                "label": "if specialized"
              },
              {
                "id": "e9-11",
                "source": "9",
                "target": "11",
                "label": "if general"
              },
              {
                "id": "e10-12",
                "source": "10",
                "target": "12",
                "label": "follow"
              },
              {
                "id": "e11-12",
                "source": "11",
                "target": "12",
                "label": "adopt"
              },
              {
                "id": "e12-13",
                "source": "12",
                "target": "13",
                "label": "avoid"
              },
              {
                "id": "e13-14",
                "source": "13",
                "target": "14",
                "label": "overcome with"
              },
              {
                "id": "e14-15",
                "source": "14",
                "target": "15",
                "label": "see in"
              },
              {
                "id": "e15-16",
                "source": "15",
                "target": "16",
                "label": "validate with"
              },
              {
                "id": "e16-17",
                "source": "16",
                "target": "17",
                "label": "prepare for"
              },
              {
                "id": "e17-18",
                "source": "17",
                "target": "18",
                "label": "complete with"
              }
            ]
          }
        },
        "quiz": {
          "title": "Module Quiz",
          "difficulty": "intermediate",
          "timeLimit": 300,
          "questions": [
            {
              "id": "q1",
              "type": "multiple_choice",
              "question": "Question text here?",
              "options": [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
              ],
              "correctAnswer": 0,
              "explanation": "Explanation of the correct answer"
            }
          ]
        }
      }
      
      CRITICAL REQUIREMENTS:
      - Generate AT LEAST 5-8 quiz questions based on the video content
      - Create a COMPREHENSIVE ROADMAP concept_graph with 15-20 nodes representing the complete learning journey
      - Node types can be: Start, End, Process, Decision, Display, Error
      - Make quiz questions challenging but fair, covering main topics from the video
      - Ensure concept graph is a COMPLETE STANDALONE ROADMAP - users should not need external resources
      
      CONCEPT GRAPH ROADMAP GUIDELINES (CRITICAL - MAKE IT COMPREHENSIVE):
      
      STRUCTURE (15-20 nodes minimum):
      1. Start node: "Start: [Topic] Overview" - Introduction and what will be learned
      2. Prerequisites: "Prerequisites & Setup" - What's needed before starting
      3. Fundamentals: "Core Fundamentals" - Basic building blocks
      4-6. Key Concepts: Break down into 3+ specific concepts (e.g., "Variables", "Functions", "Objects")
      7. Practical Application: "Practical Application" - How to use what was learned
      8. Advanced Techniques: "Advanced Techniques" - More sophisticated approaches
      9. Decision Point: "Decision: Choose Path" - Different learning paths or approaches
      10-11. Branching Paths: Two different directions (Deep Dive vs Broad Overview, or different use cases)
      12. Best Practices: "Best Practices" - Industry standards and recommendations
      13. Common Pitfalls: "Common Pitfalls" - Mistakes to avoid (Error type node)
      14. Optimization: "Optimization Tips" - Performance and efficiency improvements
      15. Real Examples: "Real-World Examples" - Concrete use cases and applications
      16. Testing: "Testing & Debugging" - How to verify and fix issues
      17. Integration: "Integration & Deployment" - Putting it all together
      18. Next Steps: "Next Steps & Resources" - Where to go from here
      
      POSITIONING RULES:
      - x coordinates: 50-550 (spread horizontally for parallel concepts)
      - y coordinates: 50-1000 (vertical progression shows learning flow)
      - Space nodes 100-150 pixels apart vertically
      - Parallel concepts should be at same y-level but different x positions
      
      EDGE LABELS (be descriptive):
      - Use action verbs: "builds upon", "requires", "leads to", "implements", "applies to"
      - Show relationships: "prerequisite for", "alternative to", "combines with"
      - Indicate flow: "then", "next", "after mastering", "before attempting"
      
      MAKE IT A COMPLETE ROADMAP:
      - Include ALL steps from beginner to advanced
      - Show multiple learning paths where applicable
      - Highlight critical decision points
      - Mark common mistakes clearly (Error nodes)
      - Include practical examples and real-world applications
      - Show testing and deployment steps
      - Provide clear next steps and resources
      - Make it so comprehensive that users don't need to visit other sites for the learning path`;

    console.log(`Sending Analysis Prompt to OpenAI for: ${videoId}`);
    console.log(`Using API Key starting with: ${process.env.OPENAI_API_KEY?.substring(0, 10)}...`);
    console.log("System Message Length:", systemMessage.length);
    console.log("User Message Length:", userMessage.length);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      temperature: 0.0,
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(response.choices[0].message.content);

    const moduleData = {
      id: uuidv4(),
      ...parsedData,
      source_video_id: videoId,
      source_url: videoUrl,
      created_at: new Date().toISOString()
    };

    // Save transcript to module content for Ask AI feature
    moduleData.content.transcript_text = transcriptText;

    // Track in memory
    modules.unshift(moduleData);

    // Save to JSON file
    saveModules();

    res.json({
      summary: moduleData.content.raw_markdown,
      moduleData: moduleData
    });

  } catch (error) {
    console.error("Analysis Error:", error?.message || error);
    console.error("Full Error:", JSON.stringify(error, null, 2));
    if (error?.response) {
      console.error("OpenAI Response Status:", error.response.status);
      console.error("OpenAI Response Data:", JSON.stringify(error.response.data || error.response.body, null, 2));
    }
    if (error?.status) {
      console.error("Error Status:", error.status);
    }
    res.status(500).json({ error: 'Analysis failed', details: error?.message || 'Unknown error' });
  }
});

// POST: Ask AI (Chat)
router.post('/ask-video-question', async (req, res) => {
  try {
    const { videoUrl, question, chatHistory = [] } = req.body;
    const videoId = extractVideoId(videoUrl);

    const mod = modules.find(m => m.source_url === videoUrl || m.source_video_id === videoId);

    let transcriptText = mod?.content?.transcript_text || '';
    let moduleTitle = mod?.title || 'Unknown Content';

    const messages = [
      {
        role: "system",
        content: `You are an AI mentor for the video: ${moduleTitle}. Context: ${transcriptText}. Answer concisely.`
      },
      ...chatHistory.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      })),
      { role: 'user', content: question }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    res.json({ answer: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Chat failed' });
  }
});

router.delete('/:id', (req, res) => {
  modules = modules.filter(m => m.id !== req.params.id);
  saveModules();
  res.json({ success: true });
});

module.exports = router;
