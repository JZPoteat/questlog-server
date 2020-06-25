BEGIN;

TRUNCATE
    users,
    games
    RESTART IDENTITY CASCADE;


INSERT INTO users (user_name, full_name, password)
VALUES 
('Geralt', 'Geralt of Rivia', 'roach'),
('your.father', 'Darth Vader', 'padme'),
('mehoy_minoy','Doodle Bob', 'password');

INSERT INTO games (title, est_time, importance, loc, notes, user_id)
VALUES
('Metro 2033 Redux', 20, 2, 'Epic', 'FPS', 3),
('Mass Effect', 50, 3, 'Origin', 'RPG FPS', 2),
('The Witcher 3', 300, 4, 'GOG', 'RPG', 1);

COMMIT;