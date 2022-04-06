const express = require("express");
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

// load input validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

// load Profile and User model
const Profile = require('../../models/Profile');
const User = require('../../models/Users');

// @route GET api/profile
// @descr Get current user's profile
// @ access private
router.get('/', passport.authenticate('jwt', { session: false}), (req,res) => {
    errors = {};
    const currUser = req.user;
    Profile.findOne({user: currUser.id})
    .populate('user', ['name', 'avatar'])
        .then((profile) => {
            if(!profile){
                errors.noProfile = 'There iis no profile for this user'
                return res.status(404).json(errors);
            }
            res.status(200).json(profile);
        })
        .catch(err => res.status(404).json(err));
});



// @route GET api/profile/handle/:handle - this is backend route (/profile/handle-for FE)
// @descr Get profile by handle
// @ access public

router.get('/handle/:handle', (req, res) => {
    const errors = {}

    Profile.findOne({ handle : req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile){
                errors.noprofile = 'There is no Profile for this user'
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});


// @route GET api/profile/:user_id 
// @descr Get profile by user_id
// @ access public

router.get('/user/:user_id', (req, res) => {
    const errors = {}

    Profile.findOne({ user : req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile){
                errors.noprofile = 'There is no Profile for this user'
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json({profile: 'There is no profile'}));
});


// @route GET api/profile/all
// @descr Get all profile
// @ access public

router.get('/all', (req,res) => {
    const errors = {}
    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if(!profiles){
                errors.noprofiles = 'There are no Profiles'
                res.status(404).json(errors);
            }
            res.json(profiles);
        })
        .catch(err => 
            res.status(404).json({profile: 'There are no profiles'})
        );
})







// @route POST api/profile
// @descr create user profile
// @ access private
router.post('/', passport.authenticate('jwt', { session: false}), (req,res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // check validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    // Get fields
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
                        return res.status(400).json(errors);
                    }

                    // else - save profile
                    new Profile(profileFields).save().then(profile => res.json(profile))
                });
            }
        });

    
});


// @route POST api/profile/experience
// @descr Add experience to profile
// @ access private

router.post('/experience', passport.authenticate('jwt', { session: false}) ,(req,res) => {

    const { errors, isValid } = validateExperienceInput(req.body);
    // check validation
    if (!isValid){
        return res.status(400).json(errors)
    }


    const loggedInUser = req.user;
    Profile.findOne({ user: loggedInUser.id })
        .then(profile => {
            const newExperience = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // Add to experience array
            profile.experience.unshift(newExperience);

            profile.save().then(profile => res.json(profile));
        })

});


// @route POST api/profile/education
// @descr Add education to profile
// @ access private

router.post('/education', passport.authenticate('jwt', { session: false}) ,(req,res) => {

    const { errors, isValid } = validateEducationInput(req.body);
    // check validation
    if (!isValid){
        return res.status(400).json(errors)
    }


    const loggedInUser = req.user;
    Profile.findOne({ user: loggedInUser.id })
        .then(profile => {
            const newEducation = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // Add to education array
            profile.education.unshift(newEducation);

            profile.save().then(profile => res.json(profile));
        })

});


// @route DELETE api/profile/experience/:exp_id
// @descr delete experience from profile
// @ access private

router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false}) ,(req,res) => {

    const loggedInUser = req.user;
    Profile.findOne({ user: loggedInUser.id })
        .then(profile => {
            // get  index to be removed
            const removeIndex = profile.experience
                .map(item = item.id)
                .indexOf(req.params.exp_id);

            // splice out of array
            profile.experience.splice(removeIndex, 1);

            //save
            profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status.apply(404).json(err))

});



// @route DELETE api/profile/education/:edu_id
// @descr delete education from profile
// @ access private

router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false}) ,(req,res) => {

    const loggedInUser = req.user;
    Profile.findOne({ user: loggedInUser.id })
        .then(profile => {
            // get  index to be removed
            const removeIndex = profile.education
                .map(item = item.id)
                .indexOf(req.params.edu_id);

            // splice out of array
            profile.education.splice(removeIndex, 1);

            //save
            profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status.apply(404).json(err))

});


// @route DELETE api/profile/education/:edu_id
// @descr delete education from profile
// @ access private

router.delete('/', passport.authenticate('jwt', { session: false}) ,(req,res) => {

    const loggedInUser = req.user;
    Profile.findOneAndRemove({ user: loggedInUser.id})
        .then(() => {
            // if we want to delete the user as well once the profile deleted
            User.findOneAndRemove({ _id : loggedInUser.id})
                .then(() => res.json({ success: true}));

        })

});




module.exports = router;