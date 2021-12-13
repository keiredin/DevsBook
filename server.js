const express = require('express')
const mongoose = require('mongoose')
const usersRoute = require('./routes/users')
const postsRoute = require('./routes/post')
const profileRoute = require('./routes/profile')

const app = express()

// DB config
const db = require('./config/keys').mongoURI

// connect to Mongodb
mongoose
    .connect(db)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));




// Use Routes
app.use('/api/users', usersRoute);
app.use('/api/profile', profileRoute);
app.use('/api/posts', postsRoute);


const port = process.env.PORT || 5000;

app.listen(port , () => console.log(`Listening to port ${port}`))