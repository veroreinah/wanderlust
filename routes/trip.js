require("dotenv").config();

const express = require("express");
const router = express.Router();
const { ensureLoggedIn } = require("connect-ensure-login");
const Trip = require("../models/Trip");
const Country = require("../models/Country");
const City = require("../models/City");
const moment = require("moment");
const multer = require("multer");
const upload = multer({ dest: "uploads/trips/" });
const axios = require("axios");
const axiosOptions = {
  baseURL: process.env.SYGIC_URL,
  headers: { "x-api-key": process.env.SYGIC_API_KEY }
};

router.get("/", ensureLoggedIn(), (req, res, next) => {
  Trip.find({ userId: req.user._id })
    .then(trips => {
      trips.forEach(t => {
        t.date_start = moment(t.dateStart).format("MM/DD/YYYY");
        t.date_end = moment(t.dateEnd).format("MM/DD/YYYY");
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

router.post("/create", upload.single("picture"), ensureLoggedIn(), (req, res, next) => {
  let { name, description, dates, destination } = req.body;

  let tripPicName;
  if (req.file) {
    tripPicName = req.file.path.replace("uploads", "");
  }

  const checkFile = new Promise((resolve, reject) => {
    if (!tripPicName) {
      reject(new Error("Choose a picture."));
    } else {
      resolve();
    }
  });

  checkFile
    .then(() => {
      let datesArr = dates.split(" - ");
      const dateStart = new Date(datesArr[0]);
      const dateEnd = new Date(datesArr[1]);
      const destinations = [];

      if (typeof destination === "string") {
        destination = [destination];
      }
      destination.forEach(e => {
        if (e.length > 0) {
          const eData = e.split("-");
          destinations.push({
            placeId: eData[0],
            name: eData[1]
          });
        }
      });

      const newTrip = new Trip({
        name,
        description,
        userId: req.user._id,
        dateStart,
        dateEnd,
        destinations,
        tripPicName
      });

      return newTrip.save();
    })
    .then(trip => {
      res.redirect(`/trips/${trip._id}`);
    })
    .catch(err => {
      req.flash("error", err.message);
      res.redirect("/trips/create");
    });
  }
);

router.get("/:id", ensureLoggedIn(), (req, res, next) => {
  let resultTrip;
  let pois = [];

  Trip.findById(req.params.id)
    .then(trip => {
      if (req.user._id.toString() !== trip.userId.toString()) {
        res.redirect("/");
        return;
      }

      resultTrip = trip;

      resultTrip.date_start = moment(trip.dateStart).format("MM/DD/YYYY");
      resultTrip.date_end = moment(trip.dateEnd).format("MM/DD/YYYY");

      const dbPromises = [];
      
      trip.destinations.forEach(e => {
        if (e.placeId.includes("city")) {
          dbPromises.push(City.findOne({ sygicId: e.placeId }));
        } else {
          dbPromises.push(Country.findOne({ sygicId: e.placeId }));
        }
      });

      return Promise.all(dbPromises);
    })
    .then(placesData => {
      const apiPromises = [];
      placesData.forEach(e => {
        if (e.pois.length > 0) {
          console.log("from database");
          pois = pois.concat(e.pois);
        } else {
          console.log("from api");
          apiPromises.push(
            axios.get(
              `/places/list?parents=${e.sygicId}&level=poi&limit=5`,
              axiosOptions
            )
          );
        }
      });

      return Promise.all(apiPromises);
    })
    .then(apiData => {
      let url;
      let sygicId;
      const dbPromises = [];

      apiData.forEach(e => {
        const placePois = e.data.data.places;
        pois = pois.concat(placePois);

        url = new URL(e.config.url);
        sygicId = url.searchParams.get("parents");

        if (sygicId.includes("city")) {
          dbPromises.push(
            City.findOneAndUpdate({ sygicId }, { pois: placePois })
          );
        } else {
          dbPromises.push(
            Country.findOneAndUpdate({ sygicId }, { pois: placePois })
          );
        }
      });

      return Promise.all(dbPromises);
    })
    .then(() => {
      resultTrip.destinationsString = resultTrip.destinations.reduce((acc, currentValue, currentIndex) => {
        let sep = ", ";
        if (currentIndex === 0) {
          sep = "";
        } else if (currentIndex === resultTrip.destinations.length - 1) {
          sep = " and ";
        }

        return acc + sep + currentValue.name;
      }, "");

      res.render("trip/show", { 
        trip: resultTrip, 
        pois,
        tripsActive: " active"
      });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/:id/delete", (req, res, next) => {
  Trip.findByIdAndRemove(req.params.id)
    .then(() => {
      res.redirect("/trips");
    })
    .catch(err => {
      next();
    });
});

router.get("/:id/edit", ensureLoggedIn(), (req, res, next) => {
  Trip.findById(req.params.id)
    .then(trip => {
      trip.dateRange = `${moment(trip.dateStart).format("MM/DD/YYYY")} - ${moment(trip.dateEnd).format("MM/DD/YYYY")}`;

      res.render("trip/edit", {
        message: req.flash("error"),
        successMessage: req.flash("success"),
        tripsActive: " active",
        useDateRange: true,
        trip,
        destinations: trip.destinations
      });
    })
    .catch(err => {
      next(err);
    });
});

router.post("/:id/edit", upload.single("picture"), ensureLoggedIn(), (req, res, next) => {
  let { name, description, dates, destination } = req.body;
  
  let datesArr = dates.split(" - ");
  const dateStart = new Date(datesArr[0]);
  const dateEnd = new Date(datesArr[1]);
  const destinations = [];

  if (typeof destination === "string") {
    destination = [destination];
  }
  destination.forEach(e => {
    if (e.length > 0) {
      const eData = e.split("-");
      destinations.push({ placeId: eData[0], name: eData[1] });
    }
  });

  Trip.findByIdAndUpdate(req.params.id, {
    name,
    description,
    dateStart,
    dateEnd,
    destinations
  })
    .then(trip => {
      if (req.file) {
        return Trip.findByIdAndUpdate(req.params.id, {
          tripPicName: req.file.path.replace("uploads", ""),
        });
      }
    })
    .then(trip => {
      res.redirect(`/trips/${req.params.id}`);
    })
    .catch(err => {
      req.flash("error", err.message);
      res.redirect(`/trips/${req.params.id}/edit`);
    });
});

module.exports = router;
