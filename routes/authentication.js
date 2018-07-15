const express = require("express");
const passport = require("passport");
const router = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");
const User = require("../models/User");
const bcryptSalt = 10;
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer({ dest: "uploads/users/" });
const base64Img = require("base64-img");

router.get("/login", ensureLoggedOut(), (req, res) => {
  res.render("authentication/login", {
    message: req.flash("error"),
    loginActive: " active"
  });
});

router.post(
  "/login",
  ensureLoggedOut(),
  passport.authenticate("local-login", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

router.get("/signup", ensureLoggedOut(), (req, res) => {
  res.render("authentication/signup", {
    message: req.flash("error"),
    successMessage: req.flash("success"),
    signupActive: " active",
    useCroppie: true
  });
});

router.post("/signup", ensureLoggedOut(), upload.none(), (req, res) => {
  const { username, email, password, profilePic } = req.body;

  const checkFields = new Promise((resolve, reject) => {
    if (!username || !email || !passport || !profilePic) {
      reject(new Error("You must fill all the fields and choose a profile picture."));
    } else if (!validateEmail(email)) {
      reject(new Error("You should write a valid email"));
    } else {
      resolve();
    }
  });

  checkFields.then(() => {
    base64Img.img(profilePic, "uploads/users/", username, (err, filepath) => {
      if (err) {
        throw new Error(err.message);
      } else {
        return User.findOne({ username });
      }
    });
  })
  .then(user => {
    if (user) {
      throw new Error("Username already exists.");
    }
    
    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashPass,
      profilePicPath: "/users",
      profilePicName: username
    });

    return newUser.save();
  })
  .then(user => {
    req.flash("success", "Sign up complete! Check your email to validate your account.");
    res.redirect("/signup");
  })
  .catch(err => {
    req.flash("error", err.message);
    res.redirect("/signup");
  });
});

router.get("/profile", ensureLoggedIn("/login"), (req, res) => {
  res.render("authentication/profile");
});

router.get("/logout", ensureLoggedIn("/login"), (req, res) => {
  req.logout();
  res.redirect("/");
});

const validateEmail = email => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

module.exports = router;
