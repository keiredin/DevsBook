const express = require("express");
const { model, Mongoose } = require("mongoose");
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const keys = require('../../config/keys');

// load input validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

// Load User model
const User = require('../../models/Users');



// @route POST api/users/register
// @desc Register User
// @ access public
router.post('/register', (req,res) => {
    const {errors, isValid} = validateRegisterInput(req.body);

    // check validation
    if(!isValid){
        return res.status(400).json(errors )
    }

    User.findOne({email: req.body.email})
    .then(user => {
        if(user){
            errors.email = 'Email already exists'
            return res.status(400).json(errors);
        } else {
            const avatar = gravatar.url(req.body.email, {
                s: '200', // size
                r: 'pg',  // rating
                d: 'mm' // default
            });
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar: avatar,
                password: req.body.password
            });

            bcrypt.genSalt(10, (error, salt) => {
                bcrypt.hash(newUser.password, salt, (error, hash) => {
                    if (error) throw error
                    newUser.password = hash;
                    newUser.save()
                        .then(user => res.json(user))
                        .catch(console.log(error));
                }) 
            })
        }
    });
});



// @route POST  api/users/login
// @desc login User / Returning JWT token
// @ access public
router.post('/login', (req, res) => {
    const {errors, isValid} = validateLoginInput(req.body);

    // check validation
    if(!isValid){
        return res.status(400).json(errors )
    }
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email})
        .then(user => {
            if(!user){
                errors.email = "User not found";
                return res.status(404).json(errors);
            }
            // check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch){
                        // user matched 
                        const payload = {id: user.id, name: user.name, avatar: user.avatar}

                        // sign token - payload is what we want to include in the token
                        jwt.sign(
                            payload, 
                            keys.secretKey, 
                            {expiresIn: '1h'}, 
                            (error, token) => {
                                res.json({ 
                                    success: true,
                                    token: "Bearer " + token
                                });
                            }    
                        ); 
                        
                    }else{
                        errors.password = 'Password incorrect';
                        return res.status(400).json(errors);
                    }
                });
        });
})


// @route POST api/users/current
// @desc return current User
// @ access private

router.get(
    '/current', 
    passport.authenticate('jwt', { session: false}),
    (req,res) => {
        // now we can access the user form req
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        });
        // res.json({msg: "Success"})
    }
);

module.exports = router;