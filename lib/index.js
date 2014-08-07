
'use strict';

// Modules
var basic_auth        = require('basic-auth');
var ErrorUnauthorized = require('otto-errors').ErrorUnauthorized;

// TODO: Function that returns true/false

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
  http_basic : http_basic
};
