CREATE TABLE IF NOT EXISTS leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(16) NOT NULL,
    score INT NOT NULL,
    time INT NOT NULL,
    finished BOOLEAN NOT NULL DEFAULT TRUE,
    settings_key VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_settings_score (settings_key, score DESC, time ASC),
    INDEX idx_settings_time (settings_key, finished DESC, time ASC, score DESC)
);
