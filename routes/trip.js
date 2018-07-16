require("dotenv").config();

const express = require("express");
const router = express.Router();
const { ensureLoggedIn } = require("connect-ensure-login");
const Trip = require("../models/Trip");
const moment = require('moment');

router.get("/", ensureLoggedIn(), (req, res, next) => {
  Trip.find({ userId: req.user._id })
    .then(trips => {
      trips.forEach(t => {
        t.date_start = t.dateStart ? moment(t.dateStart).format('MM/DD/YYYY') : "";
        t.date_end = t.dateEnd ? moment(t.dateEnd).format('MM/DD/YYYY') : "";
      });

      res.render("trip/index", {
        trips,
        tripsActive: " active"
      });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/create", ensureLoggedIn(), (req, res, next) => {
  res.render("trip/create", {
    message: req.flash("error"),
    successMessage: req.flash("success"),
    tripsActive: " active",
    useDateRange: true
  });
});

module.exports = router;
