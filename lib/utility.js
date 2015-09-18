var request = require('request');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Promise = require('bluebird');
Promise.promisify(bcrypt.hash);

exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      console.log('Error reading url heading: ', err);
      return cb(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
};

exports.isLoggedIn = function(req, res) {
  // console.log('req.session is ' + JSON.stringify(req.session));
  return req.session ? !!req.session.user : false;
};

exports.checkUser = function(req, res, next) {
  // console.log('req.session is ' + JSON.stringify(req.session));
  if (!exports.isLoggedIn(req)) {
    res.redirect('/login');
  } else {
    next();
  }
};

exports.createSession = function(req, res, newUser) {
  // console.log('newUser is ' + JSON.stringify(newUser));
  return req.session.regenerate(function() {
      req.session.user = newUser;
      // console.log('req.session.user is ' + JSON.stringify(req.session.user));
      res.redirect('/');
    });
};


exports.comparePassword = function(attemptedPassword, hash, callback) {
  bcrypt.compare(attemptedPassword, hash, function(err, isMatch) {
    callback(isMatch);
  });
};


// exports.hashPassword = function(){
//   var cipher = Promise.promisify(bcrypt.hash);
//   return cipher(this.get('password'), null, null).bind(this)
//     .then(function(hash) {
//       this.set('password', hash);
//     });
// });

exports.hashPassword = function(password, callback) {
  bcrypt.hash(password, null, null, function(err, hash) {
    if (err) {
      console.error(err);
    } else {
      callback(hash);
    }
  });
};

  // initialize: function(){
  //   this.on('creating', function(model, attrs, options){
  //     var shasum = crypto.createHash('sha1');
  //     shasum.update(model.get('url'));
  //     model.set('code', shasum.digest('hex').slice(0, 5));
  //   });
  // }

exports.codeUrl = function(url) {
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  var code = shasum.digest('hex').slice(0, 5);
  return code;
};