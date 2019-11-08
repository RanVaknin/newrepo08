'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg')

//database setup
const client = new pg.Client(process.env.DATABASE_URL);
client.on('err', err => { throw err; });

// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

let locations = {};

// Route Definitions
app.get('/coordinates', coordHandler)
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/yelp', yelpHandler);
app.get('/trails', trailHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);

function coordHandler(req, res) {
  let SQL = 'SELECT * FROM rantyler';
  client.query(SQL)
    .then(results => {
      res.status(200).json(results.rows);
    })
    .catch(err => console.err(err));
}

//handlers
function locationHandler(request, response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;

  if (locations[url]) {
    response.send(locations[url]);
  } else {
    const value = [request.query.data];
    const SQL = `
    SELECT formatted_query, latitude, longitude FROM location_table
    WHERE search_query LIKE $1;`
    client.query(SQL, value).then(result => {
      if(result.rows.length > 0){
        response.status(200).json(result.rows[0]);
        locations[url] = {
          search_query : request.query.data,
          formatted_query : result.rows[0].formatted_query,
          latitude : result.rows[0].latitude,
          longitude : result.rows[0].longitude
        };
        return;
      }
      superagent.get(url)
        .then(data => {
          const geoData = data.body;
          const location = new Location(request.query.data, geoData);
          locations[url] = location;
          const search_query = request.query.data;
          const formatted_address = geoData.results[0].formatted_address;
          const latitude = geoData.results[0].geometry.location.lat;
          const longitude = geoData.results[0].geometry.location.lng;
          const safeValues = [search_query, formatted_address, latitude, longitude];

          console.log('SAFE VAUES', safeValues);
          const SQL = 'INSERT INTO location_table (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *;';
          client.query(SQL, safeValues).then(result => {
            const row = result.rows[0];
            response.status(200).json(row);
          }).catch((e) => {
            errorHandler('So sorry, something went wrong.', e, request, response);
          });
        });
    });
  }
}
function yelpHandler(request, response) {
  const url = `https://api.yelp.com/v3/businesses/search?latitude=${request.query.data.latitude}&longitude=${request.query.data.longitude}`

  if (locations[url]) {
    response.send(locations[url]);
    console.log('if statment')
  }
  else {
    superagent.get(url)
      .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
      .then(data => {
        const restaurant = data.body.businesses.map(business => {
          return new Yelp(business)
        })
        response.status(200).json(restaurant)
      })
      .catch(() => {
        errorHandler('So sorry, something went wrong.', request, response);
        console.log('else after catch statment')
      });
  }
}

function weatherHandler(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  superagent.get(url)
    .then(data => {
      const weatherSummaries = data.body.daily.data.map(day => {
        return new Weather(day);
      });
      response.status(200).json(weatherSummaries);
    })
    .catch(() => {
      errorHandler('So sorry, something went wrong.', request, response);
    });
}

function trailHandler(request, response) {
  const url = `https://www.hikingproject.com/data/get-trails?lat=${request.query.data.latitude}&lon=${request.query.data.longitude}&maxDistance=10&key=${process.env.HIKING_API}`
  if (locations[url]) {
    response.send(locations[url]);
  }
  else {
    superagent.get(url)
      .then(data => {
        const allTrails = data.body.trails.map(trail => {
          return new Trails(trail)
        })
        response.status(200).json(allTrails)
      })
      .catch(() => {
        errorHandler('So sorry, something went wrong.', request, response);
      });
  }
}

function notFoundHandler(request, response) {
  response.status(404).send('huh?');
}

function errorHandler(error, request, response) {
  console.error(error);
  response.status(500).send(error);
}

//constructors for API
function Location(query, geoData) {
  this.search_query = query;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}

function Yelp(place) {
  this.name = place.name;
  this.image_url = place.image_url;
  this.price = place.price;
  this.rating = place.rating;
  this.url = place.url;
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

function Trails(trail) {
  this.name = trail.name;
  this.location = trail.location;
  this.length = trail.length;
  this.stars = trail.stars;
  this.star_votes = trail.star_votes;
  this.summary = trail.summary;
  this.trail_url = trail.trail_url;
  this.conditions = trail.conditions;
  this.condition_date = trail.condition_date;
  this.condition_time = trail.condition_time;
}

// Make sure the server is listening for requests
client.connect();
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
