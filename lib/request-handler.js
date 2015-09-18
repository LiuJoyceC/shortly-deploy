var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Url = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');


exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  // Links.reset().fetch().then(function(links) {
  //   res.send(200, links.models);
  // })
  var username = req.body.username;

  Url.find({ username: username}, function(err, urls) {
    console.log('fetched urls are ' + JSON.stringify(urls));
    res.send(200, urls);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;
  var username = req.body.username;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Url.find({ url: uri, username: username }, function(err, urls) {
    if (urls.length > 0) {
      console.log('urls are ' + JSON.stringify(urls));
      res.send(200, urls[0]);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        new Url({
          username: username,
          url: uri,
          base_url: req.headers.origin,
          code: util.codeUrl(uri),
          title: title,
          visits: 0
        }).save(function(err, newUrl) {
          console.log('newURL is ' + JSON.stringify(newUrl));
          res.send(200, newUrl);
        });
      });
    }
  });

  // new Link({ url: uri }).fetch().then(function(found) {
  //   if (found) {
  //     res.send(200, found.attributes);
  //   } else {
  //     util.getUrlTitle(uri, function(err, title) {
  //       if (err) {
  //         console.log('Error reading URL heading: ', err);
  //         return res.send(404);
  //       }

  //       var link = new Link({
  //         url: uri,
  //         title: title,
  //         base_url: req.headers.origin
  //       });

  //       link.save().then(function(newLink) {
  //         Links.add(newLink);
  //         res.send(200, newLink);
  //       });
  //     });
  //   }
  // });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({ username: username }, function(err, users) {
    if (err) {
      console.error(err);
    } else {
      console.log('users are ' + JSON.stringify(users));
      if (users.length === 0) {
        res.redirect('/login');
      } else {
        user = users[0];
        util.comparePassword(password, user.password, function(isMatch) {
          if (isMatch) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
    }
  });
  // new User({ username: username })
  // .fetch()
  // .then(function(user) {
  //   if (!user) {
  //     res.redirect('/login');
  //   } else {
  //     user.comparePassword(password, function(match) {
  //       if (match) {
  //         util.createSession(req, res, user);
  //       } else {
  //         res.redirect('/login');
  //       }
  //     })
  //   }
  // });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });
  //       newUser.save()
  //         .then(function(newUser) {
  //           util.createSession(req, res, newUser);
  //           Users.add(newUser);
  //         });
  //     } else {
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   })

  User.find({ username: username }, function(err, users) {
    console.log('users are ' + JSON.stringify(users));
    if (users.length === 0) {
      console.log('user length was 0');
      util.hashPassword(password, function(hash) {
        console.log('hash is ' + hash);
        new User({
          username: username,
          password: hash
        }).save(function(err, newUser) {
          if (err) {
            console.error(err);
          } else {
            console.log('newUser is ' + JSON.stringify(newUser));
            util.createSession(req, res, newUser);
          }
        });
      });
    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {
  console.log('navToLink is running');
  Url.find({ code: req.params[0]}, function(err, urls) {
    if (err) {
      console.error(err);
    } else {
      console.log('urls is ' + JSON.stringify(urls));
      if (urls.length === 0) {
        res.redirect('/');
      } else {
        console.log('urls is ' + JSON.stringify(urls));
        url = urls[0];
        // Write code to increase visitor count
      }
    }
  });

  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.set({ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });
};