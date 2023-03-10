'use-strict';
const userControllers = require("../controllers/users.js");
const movieControllers = require("../controllers/movies.js");
const watchlistsControllers = require("../controllers/watchlists.js");

//This function will initialize API routes for users
module.exports = async(app)=>{

  app.post('/watchlists/create', async(req, res)=>{
    if(req.body.userId==undefined || req.body.name==undefined){
      res.status(400).json({
        "route": "/watchlists/create",
        "args": {
          "userId": "A String representing the ID of the user",
          "name": "The name for this watchlist"
        },
        "return": "An object representing the watchlist"
      });
      return;
    }

    if(! await userControllers.findUserById(req.body.userId+'')){
      res.status(400).json({
        "error": "This user don't exists !"
      });
      return;

    }


    if(await watchlistsControllers.findWatchlistWithUserAndName(req.body.userId+'', req.body.name)){
      res.status(400).json({
        "error": "Watchlist already registered !"
      });
      return;
    }

    const watchlist = await watchlistsControllers.createWatchlist(req.body.userId+'', req.body.name);

    //Seems valid
    return res.json(watchlist);
  });

  app.post('/watchlists/delete', async(req, res)=>{
    if(req.body.watchlistId==undefined){
      res.status(400).json({
        "route": "/watchlists/delete",
        "args": {
          "watchlistId": "A String representing the ID of the watchlist to delete"
        },
        "return": "Nothing"
      });
      return;
    }

    if(!await watchlistsControllers.findWatchlistWithID(req.body.watchlistId)){
      res.status(400).json({
        "error": "Watchlist don't exists !"
      });
      return;
    }

    await watchlistsControllers.deleteWatchlist(req.body.watchlistId);

    //Seems valid
    return res.json({});
  });

  app.post('/watchlists/get', async(req, res)=>{
    if(req.body.userId==undefined || req.body.name==undefined){
      res.status(400).json({
        "route": "/watchlists/get",
        "args": {
          "userId": "A String representing the ID of the user",
          "name": "The name for this watchlist"
        },
        "return": "An object representing the watchlist"
      });
      return;
    }

    if(! await userControllers.findUserById(req.body.userId+'')){
      res.status(400).json({
        "error": "This user don't exists !"
      });
      return;

    }

    let watchlist = await watchlistsControllers.findWatchlistWithUserAndName(req.body.userId+'', req.body.name)
    if(!watchlist){
      res.status(400).json({
        "error": "Watchlist don't exists !"
      });
      return;
    }

    //Seems valid
    return res.json(watchlist);
  });

  app.post('/watchlists/getalluser', async(req, res)=>{
    if(req.body.userId==undefined){
      res.status(400).json({
        "route": "/watchlists/getalluser",
        "args": {
          "userId": "A String representing the ID of the user"
        },
        "return": "An object representing the watchlists"
      });
      return;
    }

    if(! await userControllers.findUserById(req.body.userId+'')){
      res.status(400).json({
        "error": "This user don't exists !"
      });
      return;

    }

    let watchlists = await watchlistsControllers.getUsersWhatchlists(req.body.userId+'');

    //Seems valid
    return res.json(watchlists);
  });

  app.post('/watchlists/addmovie', async(req, res)=>{
    if(req.body.watchlistId==undefined || req.body.movieId==undefined){
      res.status(400).json({
        "route": "/watchlists/addmovie",
        "args": {
          "watchlistId": "A String representing the ID of the watchlist",
          "movieId": "The ID of the film to add to this watchlist"
        },
        "return": "The edited waitchlist object"
      });
      return;
    }

    let watchlist = await watchlistsControllers.findWatchlistWithID(req.body.watchlistId)
    if(! watchlist){
      res.status(400).json({
        "error": "Watchlist don't exists !"
      });
      return;
    }

    if(! await movieControllers.findMovieWithId(req.body.movieId)){
      res.status(400).json({
        "error": "Movie don't exists !"
      });
      return;
    }

    watchlist.movies.push({"id":req.body.movieId, "state":"Watch later"});

    watchlistsControllers.setMovies(watchlist)
    .then(()=>{
      return res.json(watchlist);
    });

  });

  app.post('/watchlists/setmoviestate', async(req, res)=>{
    if(req.body.watchlistId==undefined || req.body.movieId==undefined || req.body.movieState==undefined){
      res.status(400).json({
        "route": "/watchlists/setmoviestate",
        "args": {
          "watchlistId": "A String representing the ID of the watchlist",
          "movieId": "The ID of the film to add to this watchlist",
          "movieState": "\"Watch later\", \"Watching\", \"Finished\" or \"Canceled\"."
        },
        "return": "The edited waitchlist object"
      });
      return;
    }

    let watchlist = await watchlistsControllers.findWatchlistWithID(req.body.watchlistId)
    if(! watchlist){
      res.status(400).json({
        "error": "Watchlist don't exists !"
      });
      return;
    }

    if(! ["Watch later", "Watching", "Finished", "Canceled"].includes(req.body.movieState)){
      res.status(400).json({
        "error": "Invalid movie state !"
      });
      return;
    }

    somethingEdited = false;//Will allow us to detect movies that don't belong to this watchlist
    for(let i=0; i<watchlist.movies.length; i++){//We will find the movie that must be edited
        if(watchlist.movies[i].id==req.body.movieId){
          //This is the movie that musy be edited
          watchlist.movies[i].state = req.body.movieState;
          somethingEdited = true;
          break;
        }
    }

    if(!somethingEdited){
      res.status(400).json({
        "error": "Movie don't exists !"
      });
      return;
    }


    watchlistsControllers.setMovies(watchlist)
    .then(()=>{
      return res.json(watchlist);
    });

  });

  app.post('/watchlists/removemovie', async(req, res)=>{
    if(req.body.watchlistId==undefined || req.body.movieId==undefined){
      res.status(400).json({
        "route": "/watchlists/removemovie",
        "args": {
          "watchlistId": "A String representing the ID of the watchlist",
          "movieId": "The ID of the film to remove from this watchlist",
        },
        "return": "The edited watchlist object"
      });
      return;
    }

    let watchlist = await watchlistsControllers.findWatchlistWithID(req.body.watchlistId)
    if(! watchlist){
      res.status(400).json({
        "error": "Watchlist don't exists !"
      });
      return;
    }

    somethingEdited = false;//Will allow us to detect movies that don't belong to this watchlist
    for(let i=0; i<watchlist.movies.length; i++){//We will find the movie that must be edited
        if(watchlist.movies[i].id==req.body.movieId){
          //This is the movie that musy be edited
          watchlist.movies.splice(i,1);
          somethingEdited = true;
          break;
        }
    }

    if(!somethingEdited){
      res.status(400).json({
        "error": "Movie don't exists !"
      });
      return;
    }


    watchlistsControllers.setMovies(watchlist)
    .then(()=>{
      return res.json(watchlist);
    });

  });

  app.post('/watchlists/addfriend', async(req, res)=>{
    if(req.body.watchlistId==undefined || req.body.userId==undefined){
      res.status(400).json({
        "route": "/watchlists/addfriend",
        "args": {
          "watchlistId": "A String representing the ID of the watchlist",
          "userId": "The ID of the user that will have access to this watchlist",
        },
        "return": "The edited watchlist object"
      });
      return;
    }

    let watchlist = await watchlistsControllers.findWatchlistWithID(req.body.watchlistId)
    if(! watchlist){
      res.status(400).json({
        "error": "Watchlist don't exists !"
      });
      return;
    }

    if(! await userControllers.findUserById(req.body.userId)){
      res.status(400).json({
        "error": "This user don't exists !"
      });
      return;
    }

    watchlist.friends.push(req.body.userId);

    watchlistsControllers.setFriends(watchlist)
    .then(()=>{
      return res.json(watchlist);
    });

  });

  app.post('/watchlists/setnote', async(req, res)=>{
    if(req.body.watchlistId==undefined || req.body.note==undefined){
      res.status(400).json({
        "route": "/watchlists/setnote",
        "args": {
          "watchlistId": "A String representing the ID of the watchlist",
          "note": "The description that will be added to this watchlist",
        },
        "return": "The edited watchlist object"
      });
      return;
    }

    let watchlist = await watchlistsControllers.findWatchlistWithID(req.body.watchlistId)
    if(! watchlist){
      res.status(400).json({
        "error": "Watchlist don't exists !"
      });
      return;
    }

    watchlist.note = req.body.note;

    watchlistsControllers.setNote(watchlist)
    .then(()=>{
      return res.json(watchlist);
    });

  });

}
