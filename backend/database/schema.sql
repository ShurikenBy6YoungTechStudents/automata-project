CREATE TABLE IF NOT EXISTS automata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    states TEXT NOT NULL, -- JSON array of states
    symbols TEXT NOT NULL, -- JSON array of symbols
    start_state TEXT NOT NULL,
    end_states TEXT NOT NULL, -- JSON array of final states
    transitions TEXT NOT NULL, -- JSON object of transitions
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);