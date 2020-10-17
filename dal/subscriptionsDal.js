const axios = require('axios');

const url = 'http://localhost:8000/api/subscriptions/';

exports.getAllSubscriptions = function()
{
    return axios.get(url);
}

exports.getSubscriptionById = function(id)
{
    return axios.get(url + id);
}

exports.addSubscription = function(newSubs)
{
    return axios.post(url, newSubs);
}

exports.updateSubscription = function(id, subs)
{
    return axios.put(url + id, subs);
}

exports.deleteSubscription = function(id)
{
    return axios.delete(url + id);
}