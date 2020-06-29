BEGIN;

TRUNCATE
    users,
    games
    RESTART IDENTITY CASCADE;


INSERT INTO users (user_name, full_name, password)
VALUES 
('Geralt', 'Geralt of Rivia', '$2a$12$8bOyCG3CkH2hIIjfN6D/KOacTk3C14cBJhr5HdYKhsYiR23ybXuhG'),
('your.father', 'Darth Vader', '$2a$12$IgskO6M0YeTxJKt4JNcPPecYT5LThDj0aY.//jTAeiIFx0HEOq3vu'),
('mehoy_minoy','Doodle Bob', '$2a$12$kIk5I1yvE06Q//yHA1ULUuJ7w5gasKio9F7p6KjuacS.Q.BYdoJky');

INSERT INTO games (title, est_time, importance, loc, notes, user_id)
VALUES
('Metro 2033 Redux', 20, 2, 'Epic', 'FPS', 3),
('Mass Effect', 50, 3, 'Origin', 'RPG FPS', 2),
('The Witcher 3', 300, 4, 'GOG', 'RPG', 1);

COMMIT;