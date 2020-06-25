CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    est_time INTEGER NOT NULL,
    importance INTEGER NOT NULL,
    loc TEXT NOT NULL,
    notes TEXT
);