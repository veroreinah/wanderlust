require("dotenv").config();

const express = require("express");
const router = express.Router();
const { ensureLoggedIn } = require("connect-ensure-login");
const Trip = require("../models/Trip");

router.get("/", ensureLoggedIn(), (req, res, next) => {
  Trip.find({})
    .then(trips => {
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
