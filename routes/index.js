var express = require('express');
var router = express.Router();
var app = require('../app')
var knexConfig = require('../knexfile');
var knex = require('knex')(knexConfig);
var redis = require('redis');
var cache= redis.createClient();



function delete_cookie( name ) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


/*
This is a request handler for loading the main page. It will check to see if
a user is logged in, and render the index page either way.
*/


router.get('/', function(request, response, next) {
  var tweets=request.cookies.username;
  cache.lrange(tweets,0,-1, function(err, results){
    if(results.length<1){
      console.log("if")
      var username;
      var idz=request.cookies.id;
      /*
      Check to see if a user is logged in. If they have a cookie called
      "username," assume it contains their username
      */
      if (request.cookies.username) {
        username = request.cookies.username;
        knex.select('*').from('messages').join('followers', 'followers.followers_id', '=', 'messages.user_id').where('use_id',idz).then(function(result){
         // knex.column('body','person','post_at').select().from(result).where('followers_id',2)
         //        .then(function(result){
                     
              result.reverse()
              response.render('main', {mess: result})
            
              for(i=0;i<result.length;i++){
              cache.lpush(tweets,JSON.stringify(result[i]))
              }
          
          
            });
                    // response.render('main', { mess: result, name: result});
                // });
              // });
        } else {
          username = null;
          console.log("here")
          response.render('index', { title: 'Authorize Me!', username: username });
        }
      }else{
        console.log("else")
          var username;
      var idz=request.cookies.id;
        if (request.cookies.username) {
        username = request.cookies.username;
        // knex.select('*').from('messages').join('followers', 'followers.followers_id', '=', 'messages.user_id').where('use_id',idz).then(function(result){
         // knex.column('body','person','post_at').select().from(result).where('followers_id',2)
         //        .then(function(result){
                     
              var cResults= results.map(function(item){
                return JSON.parse(item)
              })
              response.render('main', { mess: cResults})
              // console.log(results)
              // console.log(cResults)
            // });
                    
               
              // });
        } else {
          username = null;
          console.log("here")
          response.render('index', { title: 'Authorize Me!', username: username });
        }
      }
})
})
  /*
  render the index page. The username variable will be either null
  or a string indicating the username.
  */

  

/*
This is the request handler for receiving a registration request. It will
check to see if the password and confirmation match, and then create a new
user with the given username.

It has some bugs:

* if someone tries to register a username that's already in use, this handler
  will blithely let that happen.
* If someone enters an empty username and/or password, it'll accept them
  without complaint.
*/
router.post('/register', function(request, response) {
  /*
  request.body is an object containing the data submitted from the form.
  Since we're in a POST handler, we use request.body. A GET handler would use
  request.params. The parameter names correspond to the "name" attributes of
  the form fields.

  app.get('database') returns the knex object that was set up in app.js. app.get
  is not the same as router.get; it's more like object attributes. You could
  think of it like it's saying app.database, but express apps use .get and .set
  instead of attributes to avoid conflicts with the attributes that express apps
  already have.
  */
  var username = request.body.username,
      password = request.body.password,
      password_confirm = request.body.password_confirm,
      database = app.get('database');


  // knex('users').select('username')
  // {
  //   for(i=0;i<result.length;i++){
  //     if(result[i].username===username){
  //           response.render('index', {
  //     title: 'Authorize Me!',
  //     user: null,
  //     error: "Username already used"
  //   });

  //     }
  //   }
   
  

 knex('users').where('username', username)
    .then(function(result){
     
    
      

       // console.log(list)
  //     if((knex.select('username').from('users')
  //       .whereIn('username',username)===username)){
  //       console.log("this")
  //    response.render('index', {
  //     title: 'Authorize Me!',
  //     user: null,
  //     error: "Username already used"
  //   });

  // }
  if(result.length>0){
    response.render('index', {
      title: 'Authorize Me!',
      user: null,
      error: "Username already used"
    });
  }

  else if (password === password_confirm) {
    

    /*
    This will insert a new record into the users table. The insert
    function takes an object whose keys are column names and whose values
    are the contents of the record.

    This uses a "promise" interface. It's similar to the callbacks we've
    worked with before. insert({}).then(function() {...}) is very similar
    to insert({}, function() {...});
    */
   


    database('users').insert({
      username: username,
      password: password,
    }).then(function() {
      /*
      Here we set a "username" cookie on the response. This is the cookie
      that the GET handler above will look at to determine if the user is
      logged in.

      Then we redirect the user to the root path, which will cause their
      browser to send another request that hits that GET handler.
      */
      response.cookie('username', username)
      response.redirect('/');
    });
  } else {
    /*
    The user mistyped either their password or the confirmation, or both.
    Render the index page again, with an error message telling them what's
    wrong.
    */
    response.render('index', {
      title: 'Authorize Me!',
      user: null,
      error: "Password didn't match confirmation"
    });
  }
  });
});

/*
This is the request handler for logging in as an existing user. It will check
to see if there is a user by the given name, then check to see if the given
password matches theirs.

Given the bug in registration where multiple people can register the same
username, this ought to be able to handle the case where it looks for a user
by name and gets back multiple matches. It doesn't, though; it just looks at
the first user it finds.
*/
router.post('/login', function(request, response) {
  /*
  Fetch the values the user has sent with their login request. Again, we're
  using request.body because it's a POST handler.

  Again, app.get('database') returns the knex object set up in app.js.
  */
  var username = request.body.username,
      password = request.body.password,
      database = app.get('database');


  /*
  This is where we try to find the user for logging them in. We look them up
  by the supplied username, and when we receive the response we compare it to
  the supplied password.
  */
  database('users').where({'username': username}).then(function(records) {
   
    /*
    We didn't find anything in the database by that username. Render the index
    page again, with an error message telling the user what's going on.
    */
    if (records.length === 0) {
        response.render('index', {
          title: 'Authorize Me!',
          user: null,
          error: "No such user"
        });
    } else {
      var user = records[0];
      if (user.password === password) {
        /*
        Hey, we found a user and the password matches! We'll give the user a
        cookie indicating they're logged in, and redirect them to the root path,
        where the GET request handler above will look at their cookie and
        acknowledge that they're logged in.
        */
        response.cookie('username', username);
        response.cookie('id',records[0].id)
        response.redirect('/');
      } else {
        /*
        There's a user by that name, but the password was wrong. Re-render the
        index page, with an error telling the user what happened.
        */
        response.render('index', {
          title: 'Authorize Me!',
          user: null,
          error: "Password incorrect"
        });
      }
    }
  });
});

router.post('/', function(request, response){
  var username = request.cookies.username;
      var message= request.body.type;
      knex('followers').where({'followers_id': username}).select('use_id').then(function(result){
      for(i=0;i<result.length;i++){
        var seeValue = result[i].use_id;
        console.log(seeValue)
        cache.del(seeValue)
      }
    })
      
          database = app.get('database');
           database('messages').insert({
                user_id:request.cookies.username,
                person: username,
                body: message,
      }) .then(function() {
       
            knex.column('body').select().from('messages')
            .then(function(result){
              
                response.redirect('/'); 
              });
  })
})

router.post('/logout', function(request,response){
  
  var username = request.cookies.username;
  response.clearCookie("username")
  response.redirect('/'); 

})

router.post('/follow', function(request,response){
  var username = request.cookies.username;
  var following= request.body.follow;
  cache.del(username)
  database = app.get('database'); 
  knex.column('following').select().from('users')
  .then(function(){
  knex('followers')
  .insert({
      use_id: request.cookies.id,
      followers_id: following,
  }).then(function(result){
    knex.select('*').from('messages').join('followers', {'followers_id': 'messages.user_id'}).then(function(result){
     
    })
     response.redirect('/');
  })
 
})
})

module.exports = router;
