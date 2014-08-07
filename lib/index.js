
'use strict';

// Modules
var basic_auth        = require('basic-auth');
var ErrorUnauthorized = require('otto-errors').ErrorUnauthorized;

// fn returns true/false to callback
function custom (fn) {
  return function (req, res, next) {
    fn(req, function (result) {
      if (result === true) { return next(); }
      next(new ErrorUnauthorized('Authentication Failed'));
    });
  };
}

// Also allow multiple users / methods
function http_basic (username, password) {
  return function (req, res, next) {
    var credentials = basic_auth(req);
    if (credentials !== undefined) {
      if (credentials.name && credentials.name === username) {
        if (credentials.pass && credentials.pass === password) {
          return next();
        }
      }
    }
    res.set('WWW-Authenticate', 'Basic');
    next(new ErrorUnauthorized('Authentication Failed'));
  };
}

// Exports
module.exports = {
  custom     : custom,
  http_basic : http_basic
};
