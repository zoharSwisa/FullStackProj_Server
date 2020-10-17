const axios = require('axios');

const url = 'http://localhost:8000/api/members/';

exports.getAllMembers = function()
{
    return axios.get(url);
}

exports.getMemberById = function(id)
{
    return axios.get(url + id);
}

exports.addMember = function(newMovie)
{
    return axios.post(url, newMovie);
}

exports.updateMember = function(id, movie)
{
    return axios.put(url + id, movie);
}

exports.deleteMember = function(id)
{
    return axios.delete(url + id);
}