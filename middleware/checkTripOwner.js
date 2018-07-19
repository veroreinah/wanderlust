const Trip = require("../models/Trip");

const ensureIsOwner = (redirectTo, tripIdField, isReqBodyParam = false) => {
  return (req, res, next) => {
    let tripId;
    if (isReqBodyParam) {
      tripId = req.body[tripIdField];
    } else {
      tripId = req.params[tripIdField];
    }

    Trip.findById(tripId)
      .then(trip => {
        if (trip.userId.toString() === req.user._id.toString()) {
          next();
        } else {
          res.redirect(redirectTo);
        }
      })
      .catch(err => {
        res.redirect(redirectTo);
      });
  };
};

module.exports = {
  ensureIsOwner
};