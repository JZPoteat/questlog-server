const path = require('path');
const express = require('express');
const GamesService = require('./games-service');
const { requireAuth } = require('../middleware/jwt-auth');
const gamesRouter = express.Router();
const jsonParser = express.json();



gamesRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        GamesService.getAllGames(req.app.get('db'))
            .then(games => {
                res.json(GamesService.serializeGames(games));
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const { title, est_time, importance, loc, notes, user_id } = req.body;
        const newGame = { title, est_time, importance, loc, notes, user_id };
        for (const [key, value] of Object.entries(newGame)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                });
            }
        }
        GamesService.insertGame(req.app.get('db'), newGame)
            .then(game => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${game.id}`))
                    .json(game);
            });
    });

gamesRouter
    .route('/:id')
    .all(requireAuth)
    .all(CheckIfGameExists)
    .get((req, res, next) => {
        console.log(req.params);
        GamesService.getById(req.app.get('db'), req.params.id)
            .then(game => {
                res.json(GamesService.serializeGame(game));
            });
    })
    .delete((req, res, next) => {
        GamesService.deleteGame(
            req.app.get('db'),
            req.params.id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { title, est_time, importance, loc, notes } = req.body;
        const gameToUpdate = { title, est_time, importance, loc, notes };

        const numberOfValues = Object.values(gameToUpdate).filter(Boolean).length;
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: 'Request body must contain title, est_time, importance, loc, and notes'
                }
            })
        }
        GamesService.updateGame(
            req.app.get('db'),
            req.params.id,
            gameToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

    async function CheckIfGameExists(req, res, next) {
        //async returns the result of the function as a promise.
        //await pauses the execution of the function until the function resolves to a value.
        //so putting these two together, we can share resolved values between multiple steps in the promise chain.  
        try {
          const game = await GamesService.getById(
            req.app.get('db'),
            req.params.id
          )
      
          if (!game)
            
            return res.status(404).json({
              error: {message: `Game does not exist`}
            })
      
          res.game = game
          next()
        } catch (error) {
          next(error)
        }
      }
module.exports = gamesRouter;