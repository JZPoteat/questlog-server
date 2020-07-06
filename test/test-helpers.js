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

function makeNewReview() {
    const newReview = {
        title: 'New review',
        rating: 30,
        time_played: 40,
        review: 'Test review',
        user_id: 1
    }
    return newReview;
}

function makeTestReviews() {
    return [
    
        {
            id: 1,
            title: 'Dark Souls', 
            rating: 10,
            time_played: 40, 
            review: 'Too easy... Maybe a better challenge next time.',
            date_created: '2016-06-23T02:10:25.000Z', 
            user_id: 1
        },
        {
            id: 2,
            title: 'Star Wars: Jedi Fallen Order',
            rating: 3,
            time_played: 30,
            review: 'Unrealistic.  He would never escape the dark side.',
            date_created: '2016-06-23T02:10:25.000Z', 
            user_id: 2
        },
        {
            id: 3,
            title: 'Call of Duty',
            rating: 40,
            time_played: 200,
            review: 'mehoooyy minoy minoyy mooy',
            date_created: '2016-06-23T02:10:25.000Z', 
            user_id: 3
        }   
    ];
}
function makeUsersArray() {
    return [
        {   
            id: 1,
            user_name: 'Geralt', 
            full_name: 'Geralt of Rivia', 
            password: 'roach'
        },
        {
            id: 2,
            user_name: 'your.father', 
            full_name: 'Darth Vader', 
            password: 'padme'
        },
        {
            id: 3,
            user_name: 'mehoy_minoy',
            full_name: 'Doodle Bob',
            password: 'password'
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

function makeMaliciousReview() {
    const maliciousReview = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        rating: 20,
        time_played: 15,
        review: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        user_id: 1
    };
    return maliciousReview;
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


function seedQLGames(db, users, games) {
    return db.transaction(async trx => {
        await seedUsers(trx, users)
        await trx.into('games').insert(games)
        await trx.raw(
            `SELECT setval('games_id_seq', ?)`,
            [games[games.length - 1].id],
        )
    });
}

function seedQLReviews(db, users, reviews) {
    return db.transaction(async trx => {
        await seedUsers(trx, users)
        await trx.into('reviews').insert(reviews)
        await trx.raw(
            `SELECT setval('reviews_id_seq', ?)`,
            [reviews[reviews.length - 1].id],
        )
    });
}



function makeGamesFixtures() {
    const testGames = makeGamesArray();
    const testUsers = makeUsersArray();
    const testReviews = makeTestReviews();
    const newGame = makeNewGame();
    const newReview = makeNewReview();
    const maliciousGame = makeMaliciousGame();
    const maliciousReview = makeMaliciousReview();
    return { testGames, testUsers, testReviews, newGame, newReview, maliciousGame, maliciousReview };
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


  function seedMaliciousReview(db, user, review) {
    return seedUsers(db, [user])
      .then(() =>
        db
          .into('reviews')
          .insert([review])
      )
  }

  function cleanTables(db) {
    return db.transaction(trx =>
      trx.raw(
        `TRUNCATE
            users,
            games,
            reviews
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE reviews_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE games_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
        ])
      )
    )
  }

module.exports = {
    makeGamesFixtures,
    seedQLGames,
    seedQLReviews,
    seedUsers,
    makeAuthHeader,
    makeUsersArray,
    seedMaliciousGame,
    seedMaliciousReview,
    cleanTables,
};