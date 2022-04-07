const express = require("express");
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

// load input validation
const validatePostInput = require('../../validation/post');


// load Post and User model
const Post = require('../../models/Post');
const User = require('../../models/Users');
const Profile = require('../../models/Profile')



// @route    GET api/posts
// @desc     GET posts
// @access   public
router.get('/', (req,res) => {
    Post.find()
        .sort({ date: -1 })
        .then(posts => res.json(posts)) 
        .catch(err => res.status(404).json({nopostfound: 'No Post found'}));
});

// @route    GET api/posts/:id
// @desc     GET a post
// @access   public
router.get('/:id', (req,res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post)) 
        .catch(err => res.status(404).json({nopostfound: 'No Post found with that ID'}));
});



// @route    POST api/posts
// @desc     Create a post
// @access   Private

router.post('/', passport.authenticate('jwt', {session: false}), (req,res) => {

    const {errors, isValid} = validatePostInput(req.body);
    if(!isValid){
        return res.status(400).json(errors);
    }
    const loggedInUser = req.user;
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: loggedInUser.id
    })

    newPost.save().then( post => res.json(post));

})


// @route    DELETE api/posts/:id
// @desc     delete a post
// @access   Private
router.delete('/:id', passport.authenticate('jwt', {session : false}), (req,res) => {
    Profile.findOne({ user : req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    //check for post owner
                    if(post.user.toString() !== req.user.id) {
                        return res.status(401).json({notauthorized: 'User not authorized'});
                    }

                    // Delete 
                    post.remove().then(() => res.json({success: true}));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found'}))
        });
});



// @route    POST api/posts/like/:post_id
// @desc     like a post
// @access   Private
router.delete('/like/:post_', passport.authenticate('jwt', {session : false}), (req,res) => {
    Profile.findOne({ user : req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    // check if the user has already liked the post
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                        return res.status(400).json({ alreadyliked: 'User already liked this post' });
                    }

                    // add the the current user id to likes array in the post
                    post.likes.unshift({user: req.user.id});

                    // save
                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found'}))
        });
});


// @route    POST api/posts/unlike/:post_id
// @desc     unlike a post
// @access   Private
router.delete('/unlike/:post_', passport.authenticate('jwt', {session : false}), (req,res) => {
    Profile.findOne({ user : req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    // check if the user has already liked the post
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length == 0){
                        return res.status(400).json({ notliked: 'you have not yet liked this post' });
                    }

                    // get the remove index
                    const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id);
                
                    // Splice out of array
                    post.likes.splice(removeIndex, 1);

                    // save
                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found'}))
        });
});

module.exports = router;