const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Ensure unique debug ID to confirm the correct version is running
console.log("=== SERVER BOOT: VERIFIED_CLEAN_SLATE_V2 ===");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import routers
const tutorialModulesRoute = require('./routes/tutorialModules.js');

// Routes
app.use('/api/tutorial-modules', tutorialModulesRoute);

app.post('/api/auth/google', (req, res) => {
  res.json({ message: "Google auth endpoint hit" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  console.log("Memory is fresh. SQLite and JSON storage are DISABLED.");
});
