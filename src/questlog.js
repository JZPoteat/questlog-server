require('dotenv').config();
const knex = require('knex');
const ArticlesService = require('./games/games-service');

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
});

console.log(ArticlesService.getAllGames());