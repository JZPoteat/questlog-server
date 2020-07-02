const xss = require('xss');
const ReviewsService = {
    getAllReviews(knex, user) {
        return knex.from('reviews')
            .select('reviews.*', 'users.user_name')
            .join('users', 'reviews.user_id', '=', 'users.id')
            .where('users.user_name', user);
    },

    getById(knex, id) {
        return knex
            .from('reviews')
            .select('*')
            .where('id', id)
            .first();
    },

    insertReview(knex, newReview) {
        return knex
            .into('reviews')
            .insert(newReview)
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },
    deleteReview(knex, id) {
        return knex('reviews')
            .where({id})
            .delete();
    },
    updateReview(knex, id, newData) {
        return knex('reviews')
            .where({ id })
            .update(newData);
    },
    serializeReviews(reviews) {
        return reviews.map(this.serializeReview);
    },
    serializeReview(review) {
        return {
            id: review.id,
            title: xss(review.title),
            rating: review.rating,
            time_played: review.time_played,
            review: xss(review.review),
            date_created: review.date_created,
            user_id: review.user_id
        };
    },
    
};

module.exports = ReviewsService;