const express = require("express");
const router = express.Router();
var _ = require('lodash');
const axios = require("axios");
const axiosOptions = {
  baseURL: process.env.SYGIC_URL,
  headers: { "x-api-key": process.env.SYGIC_API_KEY }
};

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index", {
    images: [
      { class: "current", img: "/images/bg/bg1.jpg" },
      { class: "", img: "/images/bg/bg2.jpg" },
      { class: "", img: "/images/bg/bg3.jpg" },
      { class: "", img: "/images/bg/bg4.jpg" },
      { class: "", img: "/images/bg/bg5.jpg" },
      { class: "overlay", img: "/images/bg/bg6.jpg" }
    ],
    homeActive: " active"
  });
});

router.get("/credits", (req, res, next) => {
  res.render("credits");
});

router.get("/inspiration", (req, res, next) => {
  axios.get(`/places/list?limit=50&levels=poi`, axiosOptions)
    .then(result => {
      const places = result.data.data.places;
      const shuffledPlaces = _.slice(_.shuffle(places), 0, 10);
      const apiPromises = [];

      shuffledPlaces.forEach(element => {
        apiPromises.push(axios.get(`/places/${element.id}`, axiosOptions));
      });

      return Promise.all(apiPromises);
    })
    .then(result => {
      const resultPlaces = [];
      result.forEach(e => {
        resultPlaces.push(e.data.data.place);
      });

      const places1 = _.slice(resultPlaces, 0, 5);
      const places2 = _.slice(resultPlaces, 5, 10);

      res.render("inspiration", {
        places1,
        places2,
        inspiActive: " active"
      });
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
