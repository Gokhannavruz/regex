const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { regexRateLimit } = require('../middleware/rateLimiter');
const { testRegex, explainRegex } = require('../utils/regexParser');
const db = require('../db');

// Test regex (public, rate-limited)
router.post('/test', regexRateLimit, async (req, res) => {
    try {
        const { pattern, flags, testString, language } = req.body;

        // Validate input
        if (!pattern || !testString) {
            return res.status(400).json({ error: 'Pattern and test string required' });
        }

        // Test regex in specified language
        const result = testRegex(pattern, flags, testString, language);

        // Track usage (anonymous)
        if (req.user) {
            await db.query(
                'INSERT INTO regex_usage (user_id, pattern, language, success) VALUES ($1, $2, $3, $4)',
                [req.user.id, pattern, language, result.success]
            );
        }

        res.json(result);
    } catch (error) {
        res.status(400).json({ 
            error: 'Invalid regex pattern',
            message: error.message 
        });
    }
});

// Explain regex
router.post('/explain', async (req, res) => {
    try {
        const { pattern } = req.body;
        const explanation = explainRegex(pattern);
        res.json({ explanation });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Save regex (authenticated)
router.post('/save', authenticate, async (req, res) => {
    try {
        const { title, pattern, flags, description, testString, language } = req.body;
        
        const result = await db.query(
            `INSERT INTO saved_regex 
            (user_id, title, pattern, flags, description, test_string, language) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [req.user.id, title, pattern, flags, description, testString, language]
        );

        res.json({ saved: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save regex' });
    }
});

// Get user's saved regex
router.get('/saved', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM saved_regex WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json({ patterns: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch saved patterns' });
    }
});

// Delete saved regex
router.delete('/saved/:id', authenticate, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM saved_regex WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete pattern' });
    }
});

// Community library
router.get('/library', async (req, res) => {
    try {
        const { category, search } = req.query;
        
        let query = 'SELECT * FROM regex_library WHERE 1=1';
        const params = [];
        
        if (category) {
            params.push(category);
            query += ` AND category = $${params.length}`;
        }
        
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
        }
        
        query += ' ORDER BY upvotes DESC LIMIT 50';
        
        const result = await db.query(query, params);
        res.json({ patterns: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch library' });
    }
});

module.exports = router;
