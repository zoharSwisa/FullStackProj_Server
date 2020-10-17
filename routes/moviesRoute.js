const express = require('express');
const router = express.Router();
const moviesDal = require('../dal/moviesDal');
const subscriptionsDal = require('../dal/subscriptionsDal');
const membersDal = require('../dal/membersDal');

router.route('/').get(async function(req,resp)
{
    try
    {
        let moviesRes = await moviesDal.getAllMovies();
        let subscriptionsRes = await subscriptionsDal.getAllSubscriptions();

        let movies =  await Promise.all(moviesRes.data.movies.map(async (m) => {
            let movie = {
                "id":m._id,
                "name":m.Name,
                "genres" : m.Genres,
                "image": m.Image,
                "premiered": m.Premiered,
                "subscriptionsWatch": subscriptionsRes.data.res.filter(s => s.Movies.map(mo => mo.movieId)
                    .includes(m._id))
            }

            movie.subscriptionsWatch = await Promise.all(movie.subscriptionsWatch.map(async (s) => {
                let memberRes = await membersDal.getMemberById(s.MemberId);
                let member = {
                    "id":memberRes.data.res._id,
                    "name": memberRes.data.res.Name,
                    "watchedDate": s.Movies.filter(m => m.movieId == movie.id)[0].date
                };

                return member;
            }));

            return movie;
        }));

        return resp.json({"movies":movies});
    }
    catch(err)
    {
        return resp.json({
            "isSuccessful" : false,
            "err" :  err
        });
    }
});

router.route('/').post(async function(req,resp)
{
    try
    {
        let movie = {
            "name" : req.body.name,
            "genres" : req.body.genres,
            "image" : req.body.image,
            "premiered" : req.body.premiered
        }
        
        let res = await moviesDal.addMovie(movie);
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

router.route('/:id').put(async function(req,resp)
{
    try
    {
        let movie = {
            "name" : req.body.name,
            "genres" : req.body.genres,
            "image" : req.body.image,
            "premiered" : req.body.premiered
        }
        
        let res = await moviesDal.updateMovie(req.params.id, movie);
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

router.route('/:id').delete(async function(req,resp)
{
    try
    {
        let res = await moviesDal.deleteMovie(req.params.id);
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