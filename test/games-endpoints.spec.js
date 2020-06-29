const { expect } = require('chai');
const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const supertest = require('supertest');
const helpers = require('./test-helpers');
const { post } = require('../src/app');



describe('Games Endpoints', () => {
    let db;
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
        app.set('db', db);
    });
    after('disconnect from db', () => db.destroy());
    before('clean the table', () => helpers.cleanTables(db));
    afterEach('clean the table', () => helpers.cleanTables(db));
    let { 
        testGames,
        newGame,
        maliciousGame,
        testUsers 
    } = helpers.makeGamesFixtures();
    describe('Protected Endpoints', () => {
        beforeEach('insert games', () => 
            helpers.seedQLTables(
                db,
                testUsers,
                testGames
            )
        )

        describe ('GET /api/games/:id', () => {
            it('responds with 401 missing bearer token when no bearer token', () => {
                return supertest(app)
                    .get('/api/games/234')
                    .expect(401, { error: 'Missing bearer token'});
            });
            it('Responds with 401 when no credentials supplied', () => {
                const userNoCreds = { user_name: '', password: ''};
                return supertest(app)
                    .get('/api/games/123')
                    .set('Authorization', helpers.makeAuthHeader(userNoCreds))
                    .expect(401, {error: 'Unauthorized request'});
            })
            it('Responds with 401 when invalid user_name', () => {
                const userInvalidCreds = { user_name: 'karen', password: 'manager'}
                return supertest(app)
                    .get('/api/games/1')
                    .set('Authorization', helpers.makeAuthHeader(userInvalidCreds))
                    .expect(401, {error: 'Unauthorized request'});
            })
        })
    })
    describe('GET /api/games', () => {
        context('Given no games', () => {
            beforeEach('seed users', () => 
                helpers.seedUsers(db, testUsers)
            )
            it('Responds with 200 and empty list', () => {
                return supertest(app)
                    .get('/api/games')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
        });
        context('Given games', () => {
            beforeEach('insert games', ()  => 
                helpers.seedQLTables(
                    db,
                    testUsers,
                    testGames
                )
            );
            it('responds with 200 and all games the user has stored in database', () => {
                const expectedGames = testGames.filter(game => game.user_id === testUsers[0].id);
                return supertest(app)
                    .get('/api/games')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedGames);
            });
        });
    });
    describe('GET /api/games/:id', () => {
        context('given no games', () => {
            beforeEach(() => 
            helpers.seedUsers(db, testUsers)
            )

            it('responds with 404', () => {
                const gameId = 23424;
                return supertest(app)
                    .get(`/api/games/${gameId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: { message: 'Game does not exist'}});
            });
        });
        context('Given games', () => {
            beforeEach('insert games', ()  => 
                helpers.seedQLTables(
                    db,
                    testUsers,
                    testGames
                )
            );
            it('responds with 200 and the specified game by Id', () => {
                const gameId = 1;
                const expectedGame = testGames[gameId - 1];
                return supertest(app)
                    .get(`/api/games/${gameId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedGame);
            });
            it('responds with 401 when attempting to access an unauthorized game', () => {
                const gameId = testUsers[0].id + 1;
                return supertest(app)
                .get(`/api/games/${gameId}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(401, {error: 'Unauthorized request'})
            })
        });
        context('Given an XSS attack game', () => {
            const testUser = testUsers[0];
            beforeEach('insert malicious article', () => 
                helpers.seedMaliciousGame(
                  db,
                  testUser,
                  maliciousGame,
                )
            )
            it('Removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/games/${maliciousGame.id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect(res => {
                        expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;');
                        expect(res.body.notes).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                    });
            });
        });
    });
    describe('POST /api/games', () => {
        beforeEach(() => 
        helpers.seedUsers(db, testUsers)
    )
        it('creates a game, responding with 201 and the game', () => {
            return supertest(app)
                .post('/api/games')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(newGame)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newGame.title);
                    expect(res.body.est_time).to.eql(newGame.est_time);
                    expect(res.body.importance).to.eql(newGame.importance);
                    expect(res.body.loc).to.eql(newGame.loc);
                    expect(res.body.notes).to.eql(newGame.notes);
                    expect(res.headers.location).to.eql(`/api/games/${res.body.id}`)
                })
                 .then(postRes => {
                    return supertest(app)
                        .get(`/api/games/${postRes.body.id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(postRes.body);
                 });
        });
        
        const requiredFields = ['title', 'est_time', 'importance', 'loc', 'notes'];
        requiredFields.forEach(field => {
            const testNewGame = {
                title: 'New game',
                est_time: 15,
                importance: 2,
                loc: 'Steam',
                notes: 'New game with new notes',
            };
            it(`Responds with 400 and an error message when ${field} is missing`, () => {
                delete testNewGame[field];

                return supertest(app)
                    .post('/api/games')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(testNewGame)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    });
            });
        });
    });
    describe('DELETE /api/games/:id', () => {
        context('Given games ', () => {
            beforeEach('insert games', ()  => {
                helpers.seedQLTables(
                    db,
                    testUsers,
                    testGames
                );
            });
            it('responds with 204 and removes the game', () => {
                const idToRemove = 1;
                return supertest(app)
                    .delete(`/api/games/${idToRemove}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                            .get('/api/games')
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect([]);
                    });
            });
            it('responds with 401 when game.user_id and user.id does not match', () => {
                const idToRemove = 2;
                return supertest(app)
                .delete(`/api/games/${idToRemove}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(401, {error: 'Unauthorized request'})
            })
        });
    });
    describe.only('PATCH /api/games/:id', () => {

        context('Given no games', () => {
            beforeEach(() => 
            helpers.seedUsers(db, testUsers)
            )
            it('responds with a 404', () => {
                const gameId = 123423;
                return supertest(app)
                    .patch(`/api/games/${gameId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: {message: 'Game does not exist'}});
            });
        });
        context('Given games', () => {
            beforeEach('insert games', ()  => {
                return helpers.seedQLTables(
                    db,
                    testUsers,
                    testGames
                );
            });
            it('responds with 204 and updates the game', () => {
                const idToUpdate = 1;
                const updateGame = {
                    title: 'updated title',
                    est_time: 23452,
                    importance: 2,
                    loc: 'Nintento',
                    notes: 'updated notes',
                };
                const expectedGame = {
                    ...testGames[idToUpdate - 1],
                    ...updateGame
                };
                return supertest(app)
                    .patch(`/api/games/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(updateGame)
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                        .get(`/api/games/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(expectedGame)   
                    })
            });
            it('responds with 400 when no required fields supplied', () => {
                const idToUpdate = 1;
                
                return supertest(app)
                    .patch(`/api/games/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({irrelevantField: 'foo'})
                    .expect(400, {
                        error: {
                            message: 'Request body must contain title, est_time, importance, loc, and notes'
                        }
                    });
            });
            it('responds with 204 when updating only a subset of data', () => {
                const idToUpdate = 1;
                const updateGame = {
                    title: 'updated title'
                }
                const expectedGame = {
                    ...testGames[idToUpdate - 1],
                    ...updateGame,
                }
                return supertest(app)
                    .patch(`/api/games/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({
                        ...updateGame,
                        fieldToIgnore: 'Should not be in GET response',
                    })
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                            .get(`/api/games/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedGame)
                    })
            })
        });
    });
});


//users
//games
//reviews


//Further down the road I want to incorporate a social media element to the app.
    //User can search for other user accounts
        //This is not a relationship issue, but a database permission issue.



//user:reviews and user:games => one to many

//Third party API that retrieves a database of all games in existence
    //user selects a game from the database, and adds the game to their log

