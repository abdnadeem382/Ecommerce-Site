const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

const errorMiddleware = require('./middlewares/errors');


app.use(express.json());
app.use(cookieParser());

//import routes
const products = require('./routes/product');
const auth = require('./routes/auth'); 
const order = require('./routes/order');


//use routes
app.use('/api/v1',products);
app.use('/api/v1/', auth);
app.use('/api/v1/',order);

//middleware for error handling
app.use(errorMiddleware);


module.exports = app;