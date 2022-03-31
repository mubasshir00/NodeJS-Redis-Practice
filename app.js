const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

const config = require('./config/config')

// Create Redis Client
let client = redis.createClient(config);

client.on('connect', function(){
  console.log('Connected to Redis...');
});

// Set Port
const port = 3000;

// Init app
const app = express();

// View Engine\
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// methodOverride
app.use(methodOverride('_method'));

// Search Page
app.get('/', function(req, res, next){
  res.render('searchusers');
});

client.set('framework','reactJS',function(err,reply){
  console.log(reply);
})

// Search processing
app.post('/user/search', function(req, res, next){
  let id = req.body.id;

  client.hgetall(id, function(err, obj){
    if(!obj){
      res.render('searchusers', {
        error: 'User does not exist'
      });
    } else {
      obj.id = id;
      res.render('details', {
        user: obj
      });
    }
  });
});

// Add User Page
app.get('/user/add', function(req, res, next){
  res.render('adduser');
});

// Process Add User Page
app.post('/user/add', function(req, res, next){
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phone = req.body.phone;

  client.hmset(id, [
    'first_name', first_name,
    'last_name', last_name,
    'email', email,
    'phone', phone
  ], function(err, reply){
    if(err){
      console.log(err);
    }
    console.log(reply);
    res.redirect('/');
  });
});

app.post('/user/fullname',function(req,res,next){
  let id = req.body.id;
  let full_name = req.body.full_name;
  client.hmset(id,[
    'full_name' , full_name
  ],function(err,reply){
    if(err){
      console.log(err);
    }
    console.log(reply);
    res.redirect('/')
  })
   
})

app.post('/add/todo',function(req,res,next){
  let key = req.body.key;
  let title = req.body.title;
  let body = req.body.body;
  let testJSON = {
    title:title,
    body:body
  }
  client.LPUSH(key,[
    title,
  ],function(err,reply){
    if(err){
      console.log(err);
    }
    console.log(reply);
    res.redirect('/')
  })
})

//JSON Object 
app.post('/add/json',function(req,res,next){
  let key = req.body.key;
  let full_name = req.body.full_name;
  let email = req.body.email;
  let jsonData = {
    full_name : full_name,
    email : email
  }
  client.JSON.SET(key,[
    jsonData
  ], function (err, reply) {
    if (err) {
      console.log(err);
    }
    console.log(reply);
    res.redirect('/')
  })
})

// Delete User
app.delete('/user/delete/:id', function(req, res, next){
  client.del(req.params.id);
  res.redirect('/');
});

app.get('/all/todo',function(req,res){
  let temp = client.LRANGE("ToDo",0,-1,function(err,reply){
    if(err){
      console.log(err);
    }
    console.log(reply);
  });
  
})

app.listen(port, function(){
  console.log('Server started on port '+port);
});
