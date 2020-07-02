CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    rating INTEGER NOT NULL,
    time_played INTEGER NOT NULL,
    review TEXT NOT NULL,
    date_created TIMESTAMPTZ DEFAULT now(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL
);