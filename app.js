const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('hbs');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');

require('./dbmongo');

const indexRouter = require('./routes/index');
const buddiesRouter = require('./routes/buddies');
const authRouter = require('./routes/auth');
const searchRouter = require('./routes/search');
const profileRouter = require('./routes/profile');
const apiRouter = require('./routes/api');

const app = express();

// view engine setup
hbs.registerPartials(path.join(__dirname, '/views/partials'));

hbs.registerHelper('bold', function (options) {
  return 'hola';
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  }),
  secret: 'ironhack',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use(flash());

app.use(function (req, res, next) {
  app.locals.currentUser = req.session.currentUser;
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/buddies', buddiesRouter);
app.use('/search', searchRouter);
app.use('/profile', profileRouter);
app.use('/api', apiRouter);
// error handler

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.render('404');
  //next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
