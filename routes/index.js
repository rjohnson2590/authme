var express = require('express');
var router = express.Router();
var app = require('../app')

router.get('/', function(request, response, next) {
  var user;
  if (request.cookies.username) {
    user = request.cookies.username;
  } else {
    user = null;
  }
  response.render('index', { title: 'Authorize Me!', user: user });
});

router.post('/register', function(request, response) {
  var username = request.params['username'],
      password = request.params['password'],
      password_confirm = request.params['password_confirm'],
      database = app.get('database');

  if (password === password_confirm) {
    database('users').insert({
      username: username,
      password: password,
    }).then(function() {
      request.cookies.username = username;
      response.redirect('/');
    });
  } else {
    response.render('index', {
      title: 'Authorize Me!',
      user: null,
      error: "Password didn't match confirmation"
    });
  }
  // database('users').where({'username': username}).then(function(records) {
  //   // ### TODO
  // });
});

router.post('/login', function(request, response) {
  var username = request.param('username'),
      password = request.param('password'),
      database = app.get('database');

  // database('users').insert

});

module.exports = router;
