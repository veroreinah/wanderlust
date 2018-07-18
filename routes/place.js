require("dotenv").config();

const express = require("express");
const router = express.Router();
const { ensureLoggedIn } = require("connect-ensure-login");
const Country = require("../models/Country");
const City = require("../models/City");

router.get("/:query", ensureLoggedIn(), (req, res, next) => {
  const { query } = req.params;
  const regEx = new RegExp(`.*${query}.*`, 'i');

  const promises = [
    Country.find({ name: regEx }),
    City.find({ name: regEx }).populate("countryId")
  ];

  Promise.all(promises)
    .then(data => {
      let countries = data[0];
      let cities = data[1];
      let results = [];

      countries.forEach(e => {
        results.push({
          id: e.sygicId + "-" + e.name,
          text: e.name
        });
      });
      cities.forEach(e => {
        results.push({
          id: e.sygicId + "-" + e.name,
          text: `${e.name} (${e.countryId.name})`
        });
      });

      res.json({ results });
    })
    .catch(err => {
      return [];
    });
});

module.exports = router;
