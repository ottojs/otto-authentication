
'use strict';

// Modules
require('should');
var supertest = require('supertest');
var express   = require('express');

// Subject
var otto_authentication = require('../lib/index.js');

// New Express App
var app = express();

// Public Route
app.get('/public', function (req, res) {
  res.status(200).send({ public_page : true });
});

// Protected Route (bob/bobisthebest)
app.get('/protected', [
  otto_authentication.http_basic('bob', 'bobisthebest'),
  function (req, res) {
    res.status(200).send({ protected_page : true });
  }
]);

// Bind SuperTest
var request = supertest(app);

describe('Authentication Module', function () {

  var correct_username   = 'bob';
  var correct_password   = 'bobisthebest';
  var incorrect_username = 'alice';
  var incorrect_password = 'aliceisthebest';

  describe('Public Route', function () {

    it('should allow a request without credentials', function (done) {
      request.get('/public')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ public_page : true })
        .end(done);
    });

    it('should allow a request with incorrect credentials', function (done) {
      request.get('/public')
        .set('Accept', 'application/json')
        .auth(incorrect_username, incorrect_password)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ public_page : true })
        .end(done);
    });

    it('should allow a request with correct credentials', function (done) {
      request.get('/public')
        .set('Accept', 'application/json')
        .auth(correct_username, correct_password)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ public_page : true })
        .end(done);
    });

  });

  describe('Protected Route', function () {

    

    it('should deny a request without credentials', function (done) {
      request.get('/protected')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({ error : { message : 'Authentication Failed' } })
        .end(done);
    });

    it('should deny a request with an incorrect username/password', function (done) {
      request.get('/protected')
        .set('Accept', 'application/json')
        .auth(incorrect_username, incorrect_password)
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({ error : { message : 'Authentication Failed' } })
        .end(done);
    });

    it('should deny a request with an incorrect username', function (done) {
      request.get('/protected')
        .set('Accept', 'application/json')
        .auth(incorrect_username, correct_password)
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({ error : { message : 'Authentication Failed' } })
        .end(done);
    });

    it('should deny a request with an incorrect password', function (done) {
      request.get('/protected')
        .set('Accept', 'application/json')
        .auth(correct_username, incorrect_password)
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({ error : { message : 'Authentication Failed' } })
        .end(done);
    });

    it('should allow a request with a correct username/password', function (done) {
      request.get('/protected')
        .set('Accept', 'application/json')
        .auth(correct_username, correct_password)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ protected_page : true })
        .end(done);
    });

  });

});
