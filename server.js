'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const handlers = require('./handlers.js');



// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());


// Route Definitions
app.get('/coordinates', handlers.coordHandler);
app.get('/movies', handlers.movieHandler)
app.get('/location', handlers.locationHandler);
app.get('/weather', handlers.weatherHandler);
app.get('/yelp', handlers.yelpHandler);
app.get('/trails', handlers.trailHandler);
app.use('*', handlers.notFoundHandler);
app.use(handlers.errorHandler);


// Make sure the server is listening for requests
handlers.client.connect();
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
