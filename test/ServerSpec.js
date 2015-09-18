var request = require('supertest');
var express = require('express');
var expect = require('chai').expect;
var app = require('../server.js');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var util = require('../lib/utility');
var bcrypt = require('bcrypt-nodejs');

/////////////////////////////////////////////////////
// NOTE: these tests are designed for mongo!
/////////////////////////////////////////////////////

//console.log("app is: "+app);

describe('', function() {

  beforeEach(function(done) {
    // Log out currently signed in user
    request(app)
      .get('/logout')
      .end(function(err, res) {

        // Delete objects from db so they can be created later for the test
        Link.remove({url : 'http://www.roflzoo.com/'}).exec();
        User.remove({username : 'Savannah'}).exec();
        User.remove({username : 'Phillip'}).exec();

        done();
      });
  });

  describe('Link creation: ', function() {
//Test 1
    it('Only shortens valid urls, returning a 404 - Not found for invalid urls', function(done) {
      request(app)
        .post('/links')
        .send({
          'url': 'definitely not a valid url'})
        .expect(404)
        .end(done);
    });

    describe('Shortening links:', function() {
//Test 2
      it('Responds with the short code', function(done) {
        request(app)
          .post('/links')
          .send({
            'url': 'http://www.roflzoo.com/'})
          .expect(200)
          .expect(function(res) {
            expect(res.body.url).to.equal('http://www.roflzoo.com/');
            expect(res.body.code).to.be.ok;
          })
          .end(done);
      });
//Test 3
      it('New links create a database entry', function(done) {
        request(app)
          .post('/links')
          .send({
            'url': 'http://www.roflzoo.com/'})
          .expect(200)
          .expect(function(res) {
            Link.findOne({'url' : 'http://www.roflzoo.com/'})
              .exec(function(err,link){
                if(err) console.log(err);
                expect(link.url).to.equal('http://www.roflzoo.com/');
              });
          })
          .end(done);
      });
//Test 4
      it('Fetches the link url title', function(done) {
        request(app)
          .post('/links')
          .send({
            'url': 'http://www.roflzoo.com/'})
          .expect(200)
          .expect(function(res) {
            Link.findOne({'url' : 'http://www.roflzoo.com/'})
              .exec(function(err,link){
                if(err) console.log(err);
                expect(link.title).to.equal('Funny pictures of animals, funny dog pictures');
              });
          })
          .end(done);
      });

    }); // 'Shortening Links'

    describe('With previously saved urls: ', function() {

      beforeEach(function(done) {
        link = new Link({
          url: 'http://www.roflzoo.com/',
          title: 'Rofl Zoo - Daily funny animal pictures',
          base_url: 'http://127.0.0.1:4568',
          visits: 0,
          code: util.codeUrl('http://www.roflzoo.com/')
        })

        link.save(function() {
          done();
        });
      });
//Test 5
      it('Returns the same shortened code if attempted to add the same URL twice', function(done) {
        var firstCode = link.code
        request(app)
          .post('/links')
          .send({
            'url': 'http://www.roflzoo.com/'})
          .expect(200)
          .expect(function(res) {
            var secondCode = res.body.code;
            expect(secondCode).to.equal(firstCode);
          })
          .end(done);
      });
//Test 6
      it('Shortcode redirects to correct url', function(done) {
        console.log('link is ' + JSON.stringify(link));
        var sha = link.code;
        console.log('sha is ' + sha);
        request(app)
          .get('/' + sha)
          .expect(302)
          .expect(function(res) {
            var redirect = res.headers.location;
            expect(redirect).to.equal('http://www.roflzoo.com/');
          })
          .end(done);
      });

    }); // 'With previously saved urls'

  }); // 'Link creation'

  describe('Priviledged Access:', function(){

    // /*  Authentication  */
    // // TODO: xit out authentication
//Test 7
    it('Redirects to login page if a user tries to access the main page and is not signed in', function(done) {
      request(app)
        .get('/')
        .expect(302)
        .expect(function(res) {
          expect(res.headers.location).to.equal('/login');
        })
        .end(done);
    });
//Test 8
    it('Redirects to login page if a user tries to create a link and is not signed in', function(done) {
      request(app)
        .get('/create')
        .expect(302)
        .expect(function(res) {
          expect(res.headers.location).to.equal('/login');
        })
        .end(done);
    });
//Test 9
    it('Redirects to login page if a user tries to see all of the links and is not signed in', function(done) {
      request(app)
        .get('/links')
        .expect(302)
        .expect(function(res) {
          expect(res.headers.location).to.equal('/login');
        })
        .end(done);
    });

  }); // 'Privileged Access'

  describe('Account Creation:', function(){
//Test 10
    it('Signup creates a new user', function(done) {
      request(app)
        .post('/signup')
        .send({
          'username': 'Svnh',
          'password': 'Svnh' })
        .expect(302)
        .expect(function() {
          User.findOne({'username': 'Svnh'})
            .exec(function(err,user) {
              expect(user.username).to.equal('Svnh');
            });
        })
        .end(done);
    });
//Test 11
    it('Successful signup logs in a new user', function(done) {
      request(app)
        .post('/signup')
        .send({
          'username': 'Phillip',
          'password': 'Phillip' })
        .expect(302)
        .expect(function(res) {
          expect(res.headers.location).to.equal('/');
          request(app)
            .get('/logout')
            .expect(200)
        })
        .end(done);
    });

  }); // 'Account Creation'

  describe('Account Login:', function(){

    beforeEach(function(done) {
      new User({
          'username': 'Phillip',
          'password': bcrypt.hashSync('Phillip', null, null)
      }).save(function(){
        done();
      });
    });
//Test 12
    it('Logs in existing users', function(done) {
      request(app)
        .post('/login')
        .send({
          'username': 'Phillip',
          'password': 'Phillip' })
        .expect(302)
        .expect(function(res) {
          expect(res.headers.location).to.equal('/');
        })
        .end(done);
    });
//Test 13
    it('Users that do not exist are kept on login page', function(done) {
      request(app)
        .post('/login')
        .send({
          'username': 'Fred',
          'password': 'Fred' })
        .expect(302)
        .expect(function(res) {
          expect(res.headers.location).to.equal('/login');
        })
        .end(done)
      });

  }); // Account Login

});
