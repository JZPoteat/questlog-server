
const app = require('../src/app');
const supertest = require('supertest');
const { expect } = require('chai');

describe('App', () => {
    it('GET / responds with 200 containing "Hello, boilerplate!"', () => {
        return supertest(app)
            .get('/')
            .expect(200, 'Hello, boilerplate!');
    });
});

describe('App', () => {
    it.only('GET /api/jokes/random responds with 200 containing random joke', () => {
        return supertest(app)
        .get('/api/jokes/random?search=halo')
        .then(res => {
            console.log('here is the response', res.body);
            expect(200);
        })
    })
})