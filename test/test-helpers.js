const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeGamesArray() {
    return [
        {
            id: 1,
            title: 'Metro 2033 Redux', 
            est_time: 20,
            importance: 2,
            loc: 'Epic',
            notes: 'FPS',
            user_id: 1
        },
        {
            id: 2,
            title: 'Mass Effect', 
            est_time: 50, 
            importance: 3,
            loc: 'Origin',
            notes: 'RPG FPS',
            user_id: 2
        },
        {
            id: 3,
            title: 'The Witcher 3', 
            est_time: 300, 
            importance: 4,
            loc: 'GOG',
            notes: 'RPG',
            user_id: 3
        }
    ];
}
function makeNewGame() {
    const newGame = {
        title: 'New game',
        est_time: 15,
        importance: 2,
        loc: 'Steam',
        notes: 'New game with new notes',
        user_id: 1
    };
    return newGame;
}

function makeUsersArray() {
    return [
        {   
            id: 1,
            user_name: 'Geralt', 
            full_name: 'Geralt of Rivia', 
            password: '$2a$12$CLk4zKAgi4D7OaTTB9gGnercmdBgXkviFOgqHdaDegzdrcsJO6qNe'
        },
        {
            id: 2,
            user_name: 'your.father', 
            full_name: 'Darth Vader', 
            password: '$2a$12$KiAsyzp7qFj87Nef9eZIBuTHI9XGz3Kek/0BX6TGXXD.MqXAG7qHe'
        },
        {
            id: 3,
            user_name: 'mehoy_minoy',
            full_name: 'Doodle Bob',
            password: '$2a$12$Z/4ShMD8959NU2e8PTe9ZOAgzRQm/0T8aUqdv/5paW4IbjjUAOZT.'
        },
    ];
}
function makeMaliciousGame() {
    const maliciousGame = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        est_time: 1,
        importance: 2,
        loc: 'Steam',
        notes: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        user_id: 1
    };
    return maliciousGame;
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('users').insert(preppedUsers)
      .then(() =>
        // update the auto sequence to stay in sync
        db.raw(
          `SELECT setval('users_id_seq', ?)`,
          [users[users.length - 1].id],
        )
      )
}


function seedQLTables(db, users, games) {
    return db.transaction(async trx => {
        await seedUsers(trx, users)
        await trx.into('games').insert(games)
        await trx.raw(
            `SELECT setval('games_id_seq', ?)`,
            [games[games.length - 1].id],
        )
    });
}


function makeGamesFixtures() {
    const testGames = makeGamesArray();
    const newGame = makeNewGame();
    const maliciousGame = makeMaliciousGame();
    const testUsers = makeUsersArray();
    return { testGames, newGame, maliciousGame, testUsers };
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.user_name,
        algorithm: 'HS256',
    })
    return `bearer ${token}`
}

function seedMaliciousGame(db, user, game) {
    return seedUsers(db, [user])
      .then(() =>
        db
          .into('games')
          .insert([game])
      )
  }

  function cleanTables(db) {
    return db.transaction(trx =>
      trx.raw(
        `TRUNCATE
            users,
            games
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE games_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
        ])
      )
    )
  }

module.exports = {
    makeGamesFixtures,
    seedQLTables,
    seedUsers,
    makeAuthHeader,
    makeUsersArray,
    seedMaliciousGame,
    cleanTables,
};