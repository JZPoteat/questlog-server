CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_name TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    password TEXT NOT NULL,
    date_created TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE games 
    ADD COLUMN 
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL;