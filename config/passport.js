const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose'); // since we the search the user that comes with payload
const User = mongoose.model('users');
const keys = require('../config/keys');


// options - is an object literal containing options to control how the token is extracted from the request or verified.
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretKey;

// just an arrow function - we passed parameter 'passport' in server.js
module.exports = (passport) => {
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        // console.log(jwt_payload.id);
        User.findById(jwt_payload.id)
                .then(user => {
                    if(user){
                        return done(null, user)
                    }
                    return done(null, false)
                })
                .catch(error => {
                    console.log(error);
                });
        })
    );
};
