const axios = require('axios');

const url = 'http://localhost:8000/api/movies/';

exports.getAllMovies = function()
{
    return axios.get(url);
}

exports.getMovieById = function(id)
{
    return axios.get(url + id);
}

exports.addMovie = function(newMovie)
{
    return axios.post(url, newMovie);
}

exports.updateMovie = function(id, movie)
{
    return axios.put(url + id, movie);
}

exports.deleteMovie = function(id)
{
    return axios.delete(url + id);
}