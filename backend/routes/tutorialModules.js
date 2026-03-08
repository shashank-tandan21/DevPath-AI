const express = require('express');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const { YoutubeTranscript } = require('youtube-transcript');

// Ensure unique debug ID to confirm the correct version is running
console.log("=== ROUTE BOOT: VERIFIED_ZERO_TRUST_PROMPT_V3 ===");

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MEMORY CLEAN SLATE
let modules = [];
let quizAttempts = [];

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

// GET: Fetch specific module
router.get('/:id', (req, res) => {
  const mod = modules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).json({ error: 'Module not found' });
  res.json(mod);
});

// POST: Analyze Video
router.post('/analyze-video', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) return res.status(400).json({ error: 'Missing videoUrl' });

    const videoId = extractVideoId(videoUrl);
    if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

    console.log(`Analyzing video ID: ${videoId}... (NO CACHE)`);

    let transcriptText = '';
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcript.map(t => t.text).join(' ');
    } catch (err) {
      console.warn("No transcript. Relying purely on AI knowledge of this ID.");
      transcriptText = "[TRANSCRIPT UNAVAILABLE]";
    }

    const systemMessage = "You are a dynamic and precise tutor. Every module you generate is freshly created based on the provided video's actual topic. You identify the topic by the Video ID and Transcript provided. Do not use any internal defaults if the video topic is clear.";
    const userMessage = `VITAL: Analyze video ID: ${videoId} at URL: ${videoUrl}.
      HERE IS THE TRANSCRIPT (USE THIS FIRST):
      ${transcriptText}
      
      INSTRUCTIONS:
      1. Carefully examine the transcript or use your internal knowledge of this specific video ID to determine the topic.
      2. If it's a CSS video, generate a CSS module. If it's Python, generate Python. If it's Machine Learning, generate ML.
      3. Do NOT hallucinate Web Development or HTML content if the video is domain-specific.
      4. Focus on the actual concepts taught in the video.
      5. Output VALID JSON match the format below.
      
      JSON FORMAT:
      {
        "title": "Precise Title of the Video topic",
        "description": "Engaging description",
        "category": "Topic Name (e.g. Machine Learning, React, CSS, etc.)",
        "difficulty": "Beginner/Intermediate/Advanced",
        "estimated_time_minutes": 30,
        "content": {
          "raw_markdown": "# Video Topic\n\nLesson content here...",
          "learning_objectives": ["Obj 1"],
          "key_concepts": ["Concept 1"],
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
          ]
        },
        "quiz": []
      }`;

    console.log(`Sending Analysis Prompt to OpenAI for: ${videoId}`);
    console.log("System Message:", systemMessage);
    console.log("User Message:", userMessage);

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

    res.json({
      summary: moduleData.content.raw_markdown,
      moduleData: moduleData
    });

  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: 'Analysis failed' });
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
      model: "gpt-3.5-turbo",
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
  res.json({ success: true });
});

module.exports = router;
