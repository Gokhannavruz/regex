const rateLimit = require('express-rate-limit');

const regexRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later'
});

const aiRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 AI requests per hour
    message: 'AI rate limit exceeded'
});

module.exports = {
    regexRateLimit,
    aiRateLimit
};
