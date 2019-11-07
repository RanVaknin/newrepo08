# Project Name

**Author**: City Explorer
**Version**: 1.6.0 (increment the patch/fix version number if you make more commits past your first submission)

## Overview
We created a back end server that pulls data from two JSON files. one accounts for location data. (location name and coordinates. ) the other one is for weather data.

## Getting Started   & ## Architecture

- Create a basic server with ENV, CORS and Express icluded in their dependencies.
- Create two constructor functions one to account for the data withing the Geo.JSON and one to account for the data for DarkSky.JSON.
- Based on the user stories we populate the constructor with the right parameters and variables.
- We use the .get function to go through the JSON file,  and respond with the res verb for each instance of the constructor function.
- We compare the specific query for city against the array of cities to check if it exists. if it doesnt we return a 500 error.





## Change Log
Date:   Tue Nov 5 13:22:30 2019 -0800
- added error handling


Date:   Tue Nov 5 13:22:30 2019 -0800
- added error handling


Date:   Tue Nov 5 12:05:32 2019 -0800
- finished weather


Date:   Tue Nov 5 09:27:46 2019 -0800
- first commit
-->

Number and name of feature: ________________________________

Estimate of time needed to complete: _____

Start time: _____

Finish time: _____

Actual time needed to complete: _____