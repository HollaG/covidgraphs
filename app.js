var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');

var mainRouter = require('./routes/main.js')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use('/', mainRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

var curDate = new Date('24-Jan-20')
console.log(curDate)
var daysToAdd = 200

var newDates = []
function formatDates(date) {   
  var t = date.split(" ")
  var a = t[2].split("")
  var b = a[0] == 0 ? a[1] : a.join("")
  var c = `${t[3].split("")[2]}${t[3].split("")[3]}`
  return `${b}-${t[1]}-${c}`
}
for (var i = 1; i <= daysToAdd; i++) { 
  newDates.push(formatDates(new Date(curDate.setDate(curDate.getDate()+1)).toDateString()))  
}
console.log(newDates)



module.exports = app;
