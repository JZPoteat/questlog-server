const xss = require('xss');
const GamesService = {
    getAllGames(knex, user) {
        return knex.from('games')
            .select('*')
            .join('users', 'games.user_id', '=', 'users.id')
            .where('users.user_name', user);
    },

    getById(knex, id) {
        return knex
            .from('games')
            .select('*')
            .where('id', id)
            .first();
    },

    insertGame(knex, newGame) {
        return knex
            .into('games')
            .insert(newGame)
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },
    deleteGame(knex, id) {
        return knex('games')
            .where({id})
            .delete();
    },
    updateGame(knex, id, newData) {
        return knex('games')
            .where({ id })
            .update(newData);
    },
    serializeGames(games) {
        return games.map(this.serializeGame);
    },
    serializeGame(game) {
        return {
            id: game.id,
            title: xss(game.title),
            est_time: game.est_time,
            importance: game.importance,
            loc: xss(game.loc),
            notes: xss(game.notes),
            user_id: game.user_id
        };
    },
    
};

module.exports = GamesService;