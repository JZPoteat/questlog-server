const { expect } = require('chai');
const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const supertest = require('supertest');
const helpers = require('./test-helpers');




describe('Reviews Endpoints', () => {
    let db;
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });
    after('disconnect from db', () => db.destroy());
    before('clean the table', () => helpers.cleanTables(db));
    afterEach('clean the table', () => helpers.cleanTables(db));
    let { 
        testReviews,
        maliciousReview,
        newReview,
        testUsers 
    } = helpers.makeGamesFixtures();
    describe('Protected Endpoints', () => {
        beforeEach('insert reviews', () => 
            helpers.seedQLReviews(
                db,
                testUsers,
                testReviews
            )
        )

        describe ('GET /api/reviews/:id', () => {
            it('responds with 401 missing bearer token when no bearer token', () => {
                return supertest(app)
                    .get('/api/reviews/234')
                    .expect(401, { error: 'Missing bearer token'});
            });
            it('Responds with 401 when no credentials supplied', () => {
                const userNoCreds = { user_name: '', password: ''};
                return supertest(app)
                    .get('/api/reviews/123')
                    .set('Authorization', helpers.makeAuthHeader(userNoCreds))
                    .expect(401, {error: 'Unauthorized request'});
            })
            it('Responds with 401 when invalid user_name', () => {
                const userInvalidCreds = { user_name: 'karen', password: 'manager'}
                return supertest(app)
                    .get('/api/reviews/1')
                    .set('Authorization', helpers.makeAuthHeader(userInvalidCreds))
                    .expect(401, {error: 'Unauthorized request'});
            })
        })
    })
    describe('GET /api/reviews', () => {
        context('Given no reviews', () => {
            beforeEach('seed users', () => 
                helpers.seedUsers(db, testUsers)
            )
            it('Responds with 200 and empty list', () => {
                return supertest(app)
                    .get('/api/reviews')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
        });
        context('Given reviews', () => {
            beforeEach('insert reviews', ()  => 
                helpers.seedQLReviews(
                    db,
                    testUsers,
                    testReviews
                )
            );
            it('responds with 200 and all reviews the user has stored in database', () => {
                const expectedReviews = testReviews.filter(review => review.user_id === testUsers[0].id);
                return supertest(app)
                    .get('/api/reviews')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedReviews);
            });
        });
    });
    describe('GET /api/reviews/:id', () => {
        context('given no reviews', () => {
            beforeEach(() => 
            helpers.seedUsers(db, testUsers)
            )

            it('responds with 404', () => {
                const reviewId = 23424;
                return supertest(app)
                    .get(`/api/reviews/${reviewId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: { message: 'Review does not exist'}});
            });
        });
        context('Given reviews', () => {
            beforeEach('insert reviews', ()  => 
                helpers.seedQLReviews(
                    db,
                    testUsers,
                    testReviews
                )
            );
            it('responds with 200 and the specified review by Id', () => {
                const reviewId = 1;
                const expectedReview = testReviews[reviewId - 1];
                return supertest(app)
                    .get(`/api/reviews/${reviewId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedReview);
            });
            it('responds with 401 when attempting to access an unauthorized review', () => {
                const reviewId = testUsers[0].id + 1;
                return supertest(app)
                .get(`/api/reviews/${reviewId}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(401, {error: 'Unauthorized request'})
            })
        });
        context('Given an XSS attack review', () => {
            const testUser = testUsers[0];
            beforeEach('insert malicious article', () => 
                helpers.seedMaliciousReview(
                  db,
                  testUser,
                  maliciousReview,
                )
            )
            it('Removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/reviews/${maliciousReview.id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect(res => {
                        expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;');
                        expect(res.body.review).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                    });
            });
        });
    });
    describe('POST /api/reviews', () => {
        beforeEach(() => 
        helpers.seedUsers(db, testUsers)
    )
        it('creates a review, responding with 201 and the review', () => {
            return supertest(app)
                .post('/api/reviews')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(newReview)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newReview.title);
                    expect(res.body.rating).to.eql(newReview.rating);
                    expect(res.body.time_played).to.eql(newReview.time_played);
                    expect(res.body.review).to.eql(newReview.review);
                    expect(res.headers.location).to.eql(`/api/reviews/${res.body.id}`)
                })
                 .then(postRes => {
                    return supertest(app)
                        .get(`/api/reviews/${postRes.body.id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(postRes.body);
                 });
        });
        
        const requiredFields = ['title', 'rating', 'time_played', 'review'];
        requiredFields.forEach(field => {
            const testNewReview = {
                title: 'New review',
                rating: 15,
                time_played: 2,
                review: 'New review with new notes',
            };
            it(`Responds with 400 and an error message when ${field} is missing`, () => {
                delete testNewReview[field];

                return supertest(app)
                    .post('/api/reviews')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(testNewReview)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    });
            });
        });
    });
    describe('DELETE /api/reviews/:id', () => {
        context('Given reviews ', () => {
            beforeEach('insert reviews', ()  => {
                helpers.seedQLReviews(
                    db,
                    testUsers,
                    testReviews
                );
            });
            it('responds with 204 and removes the review', () => {
                const idToRemove = 1;
                return supertest(app)
                    .delete(`/api/reviews/${idToRemove}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                            .get('/api/reviews')
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect([]);
                    });
            });
            it('responds with 401 when reviews.user_id and user.id does not match', () => {
                const idToRemove = 2;
                return supertest(app)
                .delete(`/api/reviews/${idToRemove}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(401, {error: 'Unauthorized request'})
            })
        });
    });
    describe('PATCH /api/reviews/:id', () => {

        context('Given no reviews', () => {
            beforeEach(() => 
            helpers.seedUsers(db, testUsers)
            )
            it('responds with a 404', () => {
                const reviewId = 123423;
                return supertest(app)
                    .patch(`/api/reviews/${reviewId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: {message: 'Review does not exist'}});
            });
        });
        context('Given reviews', () => {
            beforeEach('insert reviews', ()  => {
                return helpers.seedQLReviews(
                    db,
                    testUsers,
                    testReviews
                );
            });
            it('responds with 204 and updates the review', () => {
                const idToUpdate = 1;
                const updateReview = {
                    title: 'updated title',
                    rating: 23452,
                    time_played: 2,
                    review: 'updated review'
                };
                const expectedReview = {
                    ...testReviews[idToUpdate - 1],
                    ...updateReview
                };
                return supertest(app)
                    .patch(`/api/reviews/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(updateReview)
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                        .get(`/api/reviews/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(expectedReview)   
                    })
            });
            it('responds with 400 when no required fields supplied', () => {
                const idToUpdate = 1;
                
                return supertest(app)
                    .patch(`/api/reviews/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({irrelevantField: 'foo'})
                    .expect(400, {
                        error: {
                            message: 'Request body must contain title, rating, time_played, review'
                        }
                    });
            });
            it('responds with 204 when updating only a subset of data', () => {
                const idToUpdate = 1;
                const updateReview = {
                    title: 'updated title'
                }
                const expectedReview = {
                    ...testReviews[idToUpdate - 1],
                    ...updateReview,
                }
                return supertest(app)
                    .patch(`/api/reviews/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({
                        ...updateReview,
                        fieldToIgnore: 'Should not be in GET response',
                    })
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                            .get(`/api/reviews/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedReview)
                    })
            })
        });
    });
});
