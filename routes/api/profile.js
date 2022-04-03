const express = require("express");
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

// load Profile and User model
const Profile = require('../../models/Profile');
const User = require('../../models/Users');

// @route GET api/profile
// @desc rGet current user's profile
// @ access private
router.get('/', passport.authenticate('jwt', { session: false}), (req,res) => {
    errors = {};
    const currUser = req.user;
    Profile.findOne({user: currUser.id})
        .then((profile) => {
            if(!profile){
                errors.noProfile = 'There iis no profile for this user'
                return res.status(404).json(errors);
            }
            res.status(200).json(profile);
        })
        .catch(err => res.status(404).json(err));
});


// @route POST api/profile
// @descr create user profile
// @ access private
router.post('/', passport.authenticate('jwt', { session: false}), (req,res) => {
    // Get fields
    const errors = {};
    const loggedInUser = req.user;
    const profileFields = {};
    profileFields.user = loggedInUser.id;

    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    // Skills - Split the string into array
    if (typeof req.body.skills !== 'undefined'){
        profileFields.skills = req.body.skills.split(',');
    } 

    // social media 
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({user: loggedInUser.id})
        .then(profile => {
            if(profile){
                // UPDATE
                // if the profile exist - it means an update not create
                Profile.findOneAndUpdate(
                        {user: loggedInUser.id}, 
                        { $set: profileFields }, 
                        {new: true}
                    ).then(profile => res.json(profile))
            }else {
                // CREATE

                // check if handle already exist
                Profile.findOne({ handle: profileFields.handle }).then(profile => {
                    if(profile) {
                        errors.handle = 'That handle already exists';
                        res.status(400).json(errors);
                    }

                    // else - save profile
                    new Profile(profileFields).save().then(profile => res.json(profile))
                });
            }
        });

    
});

module.exports = router;