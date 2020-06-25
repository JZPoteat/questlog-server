// const GamesService = require('../src/games/games-service');
// const knex = require('knex');
// const helpers = require('./test-helpers');
// const { expect } = require('chai');
// const { deleteGame } = require('../src/games/games-service');
// describe('Games service object', () => {
//     let db;
//     before(() => {
//         db = knex({
//             client: 'pg',
//             connection: process.env.TEST_DB_URL,
//         });
//     });

//     let { 
//         testGames,
//         newGame,
//         testUsers 
//     } = helpers.makeGamesFixtures();
//     before(() => helpers.cleanTables(db));
//     afterEach(() => helpers.cleanTables(db));
//     after(() => db.destroy());


//     describe.only('GetAllGames',() => {
//         context('Given no games', () => {
//             beforeEach('seed users', () => 
//             helpers.seedUsers(db, testUsers)
//         )
//             it('Resolves an empty array', () => {
//                 return GamesService.getAllGames(db)
//                     .then(actual => {
//                         expect(actual).to.eql([]);
//                     });
//             });
//         });
//         context('Given games in the database', () => {
//             beforeEach(() => {
//                 return db
//                     .into('games')
//                     .insert(testGames);
//             });
//             it('Resolves all games from "games"',() => {
//                 return GamesService.getAllGames(db)
//                     .then(actual => {
//                         expect(actual).to.eql(testGames);
//                     });
//             });
//         });
//     });
//     describe('GetById()', () => {
//         context('Given games in the database', () => {
//             beforeEach(() => {
//                 return db
//                     .into('games')
//                     .insert(testGames);
//             });
//             it('resolves a game by id from the "games" table', () => {
//                 const idToGet = 2;
//                 const secondItem = testGames[idToGet - 1];
//                 return GamesService.getById(db, idToGet)
//                     .then(actual => {
//                         expect(actual).to.eql({
//                             id: idToGet,
//                             title: secondItem.title,
//                             est_time: secondItem.est_time,
//                             importance: secondItem.importance,
//                             loc: secondItem.loc,
//                             notes: secondItem.notes
//                         });
//                     });
//             });
//         });
//     });
//     describe('InsertGame()', () => {
//         it('inserts a game into the database', () => {
//             const expectedGame = {
//                 id: 1,
//                 title: 'New game',
//                 est_time: 15,
//                 importance: 2,
//                 loc: 'Steam',
//                 notes: 'New game with new notes',
//             };
//             return GamesService.insertGame(db, newGame)
//                 .then(actual => {
//                     expect(actual).to.eql(expectedGame);
//                 });
//         });
//     });
//     describe('deleteGame()', () => {
//         context('Given games in the database', () => {
//             beforeEach(() => {
//                 return db
//                     .into('games')
//                     .insert(testGames);
//             });
//             it('deletes a game by id from the database', () => {
//                 const idToDelete = 1;
//                 const expected = testGames.filter(game => game.id !== idToDelete);
//                 return GamesService.deleteGame(db, idToDelete)
//                     .then(() => GamesService.getAllGames(db))
//                     .then(allGames => {
//                         expect(allGames).to.eql(expected);
//                     });
//             });
//         });
//     });
//     describe('updateGame()',() => {
//         context('Given games in the database', () => {
//             beforeEach(() => {
//                 return db
//                     .into('games')
//                     .insert(testGames);
//             });
//             it('updates a game by id in the database', () => {
//                 const idOfGameToUpate = 2;
//                 const newGameData = {
//                     title: 'Updated title',
//                     est_time: 90,
//                     importance: 1,
//                     loc: 'Xbox',
//                     notes: 'Updated notes'
//                 };
//                 return GamesService.updateGame(db, idOfGameToUpate, newGameData)
//                     .then(() => GamesService.getById(db, idOfGameToUpate))
//                     .then(game => {
//                         expect(game).to.eql({
//                             id: idOfGameToUpate,
//                             title: newGameData.title,
//                             est_time: newGameData.est_time,
//                             importance: newGameData.importance,
//                             loc: newGameData.loc,
//                             notes: newGameData.notes
//                         });
//                     });
//             });
//         });
//     });
// });