const express = require('express');
const router  = express.Router();
const { ensureLoggedIn } = require("connect-ensure-login");
const { ensureIsOwner } = require("../middleware/checkTripOwner");
const Trip = require("../models/Trip");
const Activity = require("../models/Activity");
const Poi = require("../models/Poi");
const moment = require("moment");
const axios = require("axios");
const axiosOptions = {
  baseURL: process.env.SYGIC_URL,
  headers: { "x-api-key": process.env.SYGIC_API_KEY }
};

router.post('/search/:tripId', ensureLoggedIn(), ensureIsOwner("/", "tripId"), (req, res, next) => {
  const { query, destination } = req.body;

  axios.get(`/places/list?query=${query}&parents=${destination}`, axiosOptions)
    .then(response => {
      const places = response.data.data.places;
      const promises = [];

      places.forEach(p => {
        p.tripId = req.params.tripId
        if (!p.thumbnail_url) {
          p.thumbnail_url = "/images/trip.jpg";
        }

        const { name, name_suffix, url, marker, categories, thumbnail_url } = p;
        const newPoi = new Poi({ name, name_suffix, url, marker, categories, thumbnail_url });
        newPoi.sygicId = p.id;
        newPoi.description = p.perex;

        if (p.location) {
          newPoi.location = {
            type: 'Point',
            coordinates: [p.location.lat, p.location.lng]
          }
        }

        let result = newPoi.save().catch(e => {
          if(e.name == "MongoError" && e.code==11000) { // Duplicate key
            console.log(`Duplicated POI already in Database ${p.id}`);
            return Poi.findOne({sygicId: p.id});
          }
          throw e;
        })
         
        promises.push(result);
      });

      return Promise.all(promises);
    })
    .then(data => {
      data.forEach(place => { 
        place.tripId = req.params.tripId
      });

      res.render("activity/search", { 
        places: data, 
        tripId: req.params.tripId 
      });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/create/:tripId/:poiId", ensureLoggedIn(), ensureIsOwner("/", "tripId"), (req, res, next) => {
  const promises = [
    Poi.findOne({ sygicId: req.params.poiId }),
    Trip.findById(req.params.tripId)
  ];

  Promise.all(promises)
    .then(data => {
      res.render("activity/create", {
        message: req.flash("error"),
        tripId: req.params.tripId,
        minDate: moment(data[1].dateStart).format("MM/DD/YYYY"),
        maxDate: moment(data[1].dateEnd).format("MM/DD/YYYY"),
        poiId: data[0]._id,
        name: data[0].name,
        useDateRange: true
      })
    })
    .catch(err => {
      next(err);
    });
});

router.get("/create/:tripId", ensureLoggedIn(), ensureIsOwner("/", "tripId"), (req, res, next) => {
  Trip.findById(req.params.tripId)
    .then(trip => {
      res.render("activity/create", {
        message: req.flash("error"),
        minDate: moment(trip.dateStart).format("MM/DD/YYYY"),
        maxDate: moment(trip.dateEnd).format("MM/DD/YYYY"),
        tripId: req.params.tripId,
        useDateRange: true
      })
    })
    .catch(err => {
      next(err);
    });
});

router.post("/create", ensureLoggedIn(), ensureIsOwner("/", "tripId", true), (req, res, next) => {
  const { tripId, poiId, name, description } = req.body;
  const color = `#${req.body.color}`;
  const date = new Date(req.body.date);
  
  const newActivity = new Activity({ name, description, date, color });
  if (poiId) {
    newActivity.placeId = poiId;
  }
  newActivity.save()
    .then(act => {
      return Trip.findByIdAndUpdate(tripId, { $push: { activities: act._id }});
    })
    .then(trip => {
      res.redirect(`/trips/${trip.id}`);
    })
    .catch(err => {
      req.flash("error", err.message);
      if (poiId) {
        res.redirect(`/activities/create/${tripId}/${poiId}`);
      } else {
        res.redirect(`/activities/create/${tripId}`);
      }
    })
});

router.get("/:id/:tripId/delete", ensureLoggedIn(), ensureIsOwner("/", "tripId"), (req, res, next) => {
  Activity.findByIdAndRemove(req.params.id)
    .then(() => {
      res.redirect(`/trips/${req.params.tripId}`);
    })
    .catch(err => {
      next();
    });
});

module.exports = router;
