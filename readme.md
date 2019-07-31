# About dept-movie-app

*dept-movie-app* is web application that allows users to search for movies. It exposes web API and web page that uses the API.

API provides aggregated information about movies by combining results from imdb and youtube search APIs. Search data is cached for 60 minutes for beter search performance.

Based on search term, entered by user, algorithm will fetch:
- movies with title, year of release and poster from imdb
- movies' plots based on movie title from first call
- best matching youtube movie trailers based on movie title and year of release 

## Get started
Requires imdb and youtube api keys to start the app.
```
npm install
API_KEY_OMDB={api_key_imdb} API_KEY_YT={api_key_youtube} npm start
```
## Run tests
```
npm run test
```