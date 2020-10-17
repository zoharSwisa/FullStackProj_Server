
var express = require('express');
var app = express();
var cors = require('cors');

app.use(cors())

const bodyParser = require('body-parser');

require('./configs/database');

app.use(bodyParser.urlencoded({ extended: true }))  
   .use(bodyParser.json());

app.use('/api/subscriptions', require('./routes/subscriptionsRoute'));
app.use('/api/users', require('./routes/usersRoute'));
app.use('/api/movies', require('./routes/moviesRoute'));


app.listen(8080);