
'use strict';

// Modules
require('should');
var supertest = require('supertest');
var otto      = require('otto');

// Subject
var otto_authentication = require('../lib/index.js');

// New Otto/Express App
var app = otto.app({
  routes : [
    function (app) {

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

      // Protected Route custom
      app.get('/custom', [
        otto_authentication.custom(function (req, allow) {
          if (req.query.letmein && req.query.letmein === 'now') {
            return allow(true);
          }
          allow(false);
        }),
        function (req, res) {
          res.status(200).send({ custom_authentication : true });
        }
      ]);

    }
  ]
});

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

  describe('HTTP Basic Protected Route', function () {

    it('should deny a request without credentials', function (done) {
      request.get('/protected')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
          error : {
            type    : 'client',
            name    : 'ErrorUnauthorized',
            message : 'Authentication Failed'
          }
        })
        .end(done);
    });

    it('should deny a request with an incorrect username/password', function (done) {
      request.get('/protected')
        .set('Accept', 'application/json')
        .auth(incorrect_username, incorrect_password)
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
          error : {
            type    : 'client',
            name    : 'ErrorUnauthorized',
            message : 'Authentication Failed'
          }
        })
        .end(done);
    });

    it('should deny a request with an incorrect username', function (done) {
      request.get('/protected')
        .set('Accept', 'application/json')
        .auth(incorrect_username, correct_password)
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
          error : {
            type    : 'client',
            name    : 'ErrorUnauthorized',
            message : 'Authentication Failed'
          }
        })
        .end(done);
    });

    it('should deny a request with an incorrect password', function (done) {
      request.get('/protected')
        .set('Accept', 'application/json')
        .auth(correct_username, incorrect_password)
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
          error : {
            type    : 'client',
            name    : 'ErrorUnauthorized',
            message : 'Authentication Failed'
          }
        })
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

  describe('Custom Authentication', function () {

    it('should deny a request without query "letmein"', function (done) {
      request.get('/custom')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
          error : {
            type    : 'client',
            name    : 'ErrorUnauthorized',
            message : 'Authentication Failed'
          }
        })
        .end(done);
    });

    it('should allow a request when query "letmein" is set to "now"', function (done) {
      request.get('/custom?letmein=now')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ custom_authentication : true })
        .end(done);
    });

  });

});
