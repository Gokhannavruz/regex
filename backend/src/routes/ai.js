const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { authenticate } = require('../middleware/auth');
const { aiRateLimit } = require('../middleware/rateLimiter');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-key'
});

// Generate regex from description
router.post('/generate', authenticate, aiRateLimit, async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-key') {
            return res.status(400).json({ 
                error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
            });
        }
        
        const { description, language } = req.body;

        const prompt = `Generate a ${language || 'JavaScript'} regular expression for: "${description}"

Rules:
1. Return ONLY the regex pattern (no delimiters like / /)
2. If flags are needed, specify them separately
3. Provide a brief explanation
4. Give 2-3 example test strings that should match

Format your response as JSON:
{
  "pattern": "the regex pattern",
  "flags": "flags like g, i, m",
  "explanation": "what this regex does",
  "examples": ["example1", "example2"]
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a regex expert. Generate accurate regex patterns." },
                { role: "user", content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        const response = JSON.parse(completion.choices[0].message.content);
        res.json(response);
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ 
            error: 'Failed to generate regex',
            message: error.message 
        });
    }
});

// Improve existing regex
router.post('/improve', authenticate, aiRateLimit, async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-key') {
            return res.status(400).json({ 
                error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
            });
        }
        
        const { pattern, issue } = req.body;

        const prompt = `Improve this regex pattern: "${pattern}"
Issue: ${issue}

Suggest improvements and return:
{
  "improved_pattern": "better regex",
  "changes": "what was changed and why",
  "performance": "any performance improvements"
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a regex optimization expert." },
                { role: "user", content: prompt }
            ],
            temperature: 0.3
        });

        const response = JSON.parse(completion.choices[0].message.content);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to improve regex' });
    }
});

module.exports = router;
