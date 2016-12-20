var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks')
var index = require('./routes/index');
var users = require('./routes/users');
/*var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userScheMa = new Schema({
  userid:String,
  password:String
})
var user = mongoose.model('users',userScheMa);*/
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/hello';
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log('Connected correctly to server.');
  db.close();
});
var app = express();
// mongoose.connect('mongodb://localhost/hello')
// view engine setup
var view = nunjucks.configure('views', {
  autoescape: true,
  express: app
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
// 设定port变量，意为访问端口
app.set('port', process.env.PORT || 9000)
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/a',  function(req, res, next) {
   res.render('layout', { title: 'Express' });
});
app.get('/login', function (req, res) {
  res.render('login', { title: 'Express' });
});
app.get('/find', function (req, res){
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    findRestaurants(db, function() {
      db.close();
    });
  });
  res.json({b:2})
});
app.get('/get', function (req, res) {
  var query_doc = {userid: req.query.name, password: req.query.location};
  MongoClient.connect(url,function(err, db) {
    assert.equal(null, err);
    insertDocument(db,query_doc, function() {
      db.close();
    });
    res.json({a:2});
  });
 /* (function(){
   user.count(query_doc, function(err, doc){
   if(doc == 1){
   console.log(query_doc.userid + ": login success in " + new Date());
   res.json({a:1});
   }else{
   console.log(query_doc.userid + ": login failed in " + new Date());
   res.json({a:2});
   }
   });
   })(query_doc);*/
});
var insertDocument = function(db,date, callback) {
  db.collection('users').insertOne( {
    userid : date.userid,
    password : date.password
  }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the restaurants collection.");
    callback();
  });
};
var findRestaurants = function(db, callback) {
  var cursor =db.collection('users').find();
   cursor.each(function(err, doc) {
    assert.equal(err, null);
    if (doc !== null) {
      console.dir(doc);
    } else {
      callback();
    }
  });
};
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(app.set('port'));
module.exports = app;
