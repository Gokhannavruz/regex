-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved Regex patterns
CREATE TABLE saved_regex (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    pattern TEXT NOT NULL,
    flags VARCHAR(10),
    description TEXT,
    test_string TEXT,
    language VARCHAR(50) DEFAULT 'javascript',
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Regex library (community shared)
CREATE TABLE regex_library (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    pattern TEXT NOT NULL,
    flags VARCHAR(10),
    description TEXT,
    category VARCHAR(50),
    tags TEXT[],
    upvotes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage analytics
CREATE TABLE regex_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    pattern TEXT NOT NULL,
    language VARCHAR(50),
    execution_time INTEGER,
    success BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_saved_regex_user ON saved_regex(user_id);
CREATE INDEX idx_regex_library_category ON regex_library(category);
CREATE INDEX idx_regex_library_upvotes ON regex_library(upvotes DESC);
