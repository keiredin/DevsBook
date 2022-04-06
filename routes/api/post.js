const express = require("express");
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

// load input validation
const validatePostInput = require('../../validation/post');


// load Post and User model
const Post = require('../../models/Post');
const User = require('../../models/Users');

router.get('/test',(req,res) => res.json({msg:"Post working"}));

module.exports = router;