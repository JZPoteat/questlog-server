require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const {NODE_ENV} = require('./config');
const gamesRouter = require('./games/games-router');
const usersRouter = require('./users/users-router');
const reviewsRouter = require('./reviews/reviews-router');
const authRouter = require('./auth/auth-router');
const request = require('request');

const app = express();


const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption));
app.use(cors());

app.use(helmet());
app.use('/api/games', gamesRouter);
app.use('/api/users', usersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/auth', authRouter);

app.get('/api/search', (req, res) => {
    console.log('params', req.originalUrl.split('?')[1]);
    const params = req.originalUrl.split('?')[1];
    const originalUrl = 'https://api.rawg.io/api/games';
    const searchUrl = `${originalUrl}?${params}`;
    request(
      { url: searchUrl },
      (error, response, body) => {
        if (error || response.statusCode !== 200) {
          return res.status(500).json({ type: 'error', message: 'something went wrong' });
        }
        res.json(JSON.parse(body));
      }
    )
  });

app.get('/', (req, res) => {
    res.send('Hello, boilerplate!');
});

app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } };
    } else {
        console.error(error);
        response = { message: error.message, error };
    }
    res.status(500).json(response);
});

module.exports = app;
