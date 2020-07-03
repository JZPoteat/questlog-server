const path = require('path');
const express = require('express');
const ReviewsService = require('./reviews-service');
const { requireAuth } = require('../middleware/jwt-auth');
const reviewsRouter = express.Router();
const jsonParser = express.json();



reviewsRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        const currentUser = req.user.user_name
        ReviewsService.getAllReviews(req.app.get('db'), currentUser)
            .then(reviews => {
                res.json(ReviewsService.serializeReviews(reviews));
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const { title, rating, time_played, review } = req.body;
        const user_id = req.user.id;
        const newReview = { title, rating, time_played, review, user_id };
        for (const [key, value] of Object.entries(newReview)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                });
            }
        }
        ReviewsService.insertReview(req.app.get('db'), newReview)
            .then(review => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${review.id}`))
                    .json(review);
            });
    });

reviewsRouter
    .route('/:id')
    .all(requireAuth)
    .all(CheckIfReviewExists)
    .get((req, res, next) => {
        ReviewsService.getById(req.app.get('db'), req.params.id)
            .then(review => {
                if(review.user_id !== req.user.id) {
                    return res.status(401).json({ error: 'Unauthorized request'})
                }
                res.json(ReviewsService.serializeReview(review));
            });
    })
    .delete((req, res, next) => {
        ReviewsService.getById(req.app.get('db'), req.params.id)
            .then(review => {
                if(review.user_id !== req.user.id) {
                    return res.status(401).json({ error: 'Unauthorized request'});
                }
            })
        ReviewsService.deleteReview(
            req.app.get('db'),
            req.params.id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { title, rating, time_played, review } = req.body;
        const reviewToUpdate = { title, rating, time_played, review };

        ReviewsService.getById(req.app.get('db'), req.params.id)
        .then(review => {
            if(review.user_id !== req.user.id) {
                return res.status(401).json({ error: 'Unauthorized request'});
            }
        })
        const numberOfValues = Object.values(reviewToUpdate).filter(Boolean).length;
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: 'Request body must contain title, rating, time_played, review'
                }
            })
        }
        ReviewsService.updateReview(
            req.app.get('db'),
            req.params.id,
            reviewToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

    async function CheckIfReviewExists(req, res, next) {
        //async returns the result of the function as a promise.
        //await pauses the execution of the function until the function resolves to a value.
        //so putting these two together, we can share resolved values between multiple steps in the promise chain.  
        try {
          const review = await ReviewsService.getById(
            req.app.get('db'),
            req.params.id
          )
      
          if (!review)
            
            return res.status(404).json({
              error: {message: `Review does not exist`}
            })
      
          res.review = review
          next()
        } catch (error) {
          next(error)
        }
      }
module.exports = reviewsRouter;