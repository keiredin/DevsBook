const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');  // is the main auth module there are submodules like googleauth,localauth....



const usersRoute = require('./routes/api/users')
const postsRoute = require('./routes/api/post')
const profileRoute = require('./routes/api/profile')

const app = express()


// Body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// DB config
const db = require('./config/keys').mongoURI

// connect to Mongodb
mongoose
    .connect(db)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));



// passport middleware
app.use(passport.initialize());

// //passport config
require('./config/passport')(passport);

// Use Routes
app.use('/api/users', usersRoute);
app.use('/api/profile', profileRoute);
app.use('/api/posts', postsRoute);


const port = process.env.PORT || 5000;

app.listen(port , () => console.log(`Listening to port ${port}`))