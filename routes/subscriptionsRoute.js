const express = require('express');
const router = express.Router();
const moviesDal = require('../dal/moviesDal');
const subscriptionsDal = require('../dal/subscriptionsDal');
const membersDal = require('../dal/membersDal');

router.route('/').get(async function(req,resp)
{
    try
    {
        let membersRes = await membersDal.getAllMembers();
        let subscriptionsRes = await subscriptionsDal.getAllSubscriptions();

        let members =  await Promise.all(membersRes.data.res.map(async (m) => {
            let subscription = subscriptionsRes.data.res.filter(s => s.MemberId == m._id);
            let movies = [];
            if (subscription && subscription.length > 0)
            {
                movies = await Promise.all(subscription[0].Movies.map(async (mo) => {
                    let movieRes = await moviesDal.getMovieById(mo.movieId);
                    let movie = {
                        "id":mo.movieId,
                        "name":movieRes.data.movie.Name,
                        "date":mo.date
                    };
                    return movie;
                }));
            }

            let member = {
                "id":m._id,
                "name":m.Name,
                "email" : m.Email,
                "city": m.City,
                "movies": movies
            };

            return member;
        }));

        return resp.json(members);
    }
    catch(err)
    {
        return resp.json({
            "isSuccessful" : false,
            "err" :  err
        });
    }
});

router.route('/AddMember').post(async function(req,resp)
{
    try
    {
        let member = {
            "name" : req.body.name,
            "email" : req.body.email,
            "city" : req.body.city
        }
        
        let res = await membersDal.addMember(member)
        return resp.json(res.data);
    }
    catch(err)
    {
        return resp.json({
            "isSuccessful" : false,
            "err" :  err
        });
    }
});

router.route('/AddSubscription').post(async function(req,resp)
{
    try
    {
        let subscriptionsRes = await subscriptionsDal.getAllSubscriptions();
        let subscription = subscriptionsRes.data.res.filter(s => s.MemberId == req.body.memberId);
        if (subscription && subscription.length > 0)
        {
            let movies = subscription[0].Movies;
            movies.push(req.body.movie);

            let sub = {
                "memberId":req.body.memberId,
                "movies" : movies
            }

            let res = await subscriptionsDal.updateSubscription(subscription[0]._id, sub)
            return resp.json(res.data);
        }
        else
        {
            let movies =[];
            movies.push(req.body.movie);

            let sub = {
                "memberId":req.body.memberId,
                "movies" : movies
            }

            let res = await subscriptionsDal.addSubscription(sub)
            return resp.json(res.data);
        }
    }
    catch(err)
    {
        return resp.json({
            "isSuccessful" : false,
            "err" :  err
        });
    }
});

router.route('/EditMember/:id').put(async function(req,resp)
{
    try
    {
        let member = {
            "name" : req.body.name,
            "email" : req.body.email,
            "city" : req.body.city
        }
        
        let res = await membersDal.updateMember(req.params.id, member);
        console.log("res: " + JSON.stringify(res.data))
        return resp.json(res.data);
    }
    catch(err)
    {
        return resp.json({
            "isSuccessful" : false,
            "err" :  err
        });
    }
});

router.route('/DeleteMember/:id').delete(async function(req,resp)
{
    try
    {
        let res = await membersDal.deleteMember(req.params.id);

        return resp.json(res.data);
    }
    catch(err)
    {
        return resp.json({
            "isSuccessful" : false,
            "err" :  err
        });
    }
});

module.exports = router; 