var db = require('../lib/db');
var bcrypt = require('bcrypt');
var shortid = require('shortid');

module.exports = function (app) {
    var passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy,
        FacebookStrategy = require('passport-facebook').Strategy;

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        console.log('serializeUser', user);
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        var user = db.get('users').find({id:id}).value();
        console.log('deserializeUser', id, user);
        done(null, user);
    });

    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'pwd'
        },
        function(email, password, done) {
            console.log('LocalStrategy', email, password);
            var user = db.get('users').find({
                email: email
            }).value();
            if (user) {
                bcrypt.compare(password, user.password, function(err, result) {
                    if(result) {
                        return done(null, user, {
                            message: 'Welcome.'
                        });
                    } else {
                        return done(null, false, {
                            message: 'Password is not correct.'
                        });
                    }
                });
            } else {
                return done(null, false, {
                    message: 'There is no email.'
                });
            }
        }
    ));

    var facebookCredentials = require('../config/facebook.json');
    facebookCredentials.profileFields = ['id', 'emails', 'name', 'displayName'];
    passport.use(new FacebookStrategy(facebookCredentials,
        function(accessToken, refreshToken, profile, done) {
            console.log('FacebookStrategy', accessToken, refreshToken, profile);
            var email = profile.emails[0].value;
            var user = db.get('users').find({email:email}).value();
            if(user) {

            } else {
                user = {
                    id:shortid.generate(),
                    email:email,
                    displayName:profile.displayName,
                    facebookId:profile.id
                }
                db.get('users').push(user).write();
            }
            done(null, user);
            // User.findOrCreate(..., function(err, user) {
            //   if (err) { return done(err); }
            //   done(null, user);
            // });
        }
    ));
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope:'email'
    }));
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/auth/login'
        }));

    return passport
}
