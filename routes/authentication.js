require("dotenv").config();

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
const { sendMail } = require("../mailing/sendMail");

router.get("/login", ensureLoggedOut(), (req, res) => {
  res.render("authentication/login", {
    message: req.flash("error"),
    successMessage: req.flash("success"),
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
      reject(new Error("You should write a valid email."));
    } else {
      resolve();
    }
  });

  checkFields.then(() => {
    base64Img.img(profilePic, "uploads/users/", username, (err, filepath) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  })
  .then(() => {
    return User.findOne({ username });
  })
  .then(user => {
    if (user) {
      throw new Error("Username already exists.");
    }
    
    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);
    const confirmationCode = encodeURIComponent(bcrypt.hashSync(username, salt));

    const newUser = new User({
      username,
      email,
      password: hashPass,
      profilePicPath: "/users",
      profilePicName: username,
      confirmationCode
    });

    return newUser.save();
  })
  .then(user => {
    req.flash("success", "Sign up complete! Check your email to validate your account.");
    res.redirect("/signup");

    const subject = "Wanderlust - Confirm your account";
    const data = {
      username: user.username,
      url: `${process.env.URL}confirm/${user.confirmationCode}`,
      logo: `${process.env.URL}/images/logo/logo-white-s.png`,
      bg1: `${process.env.URL}/images/mail/mail1.png`,
      bg2: `${process.env.URL}/images/mail/mail2.png`
    };

    sendMail(user.email, subject, data, "signup").then(() => {
      console.log("Email sended");
    });
  })
  .catch(err => {
    req.flash("error", err.message);
    res.redirect("/signup");
  });
});

router.get("/confirm/:confirmCode", ensureLoggedOut(), (req, res) => {
  const confirmationCode = encodeURIComponent(req.params.confirmCode);

  User.findOne({ confirmationCode })
    .then(user => {
      if (!user) {
        throw new Error("The confirmation code is incorrect.");
      }

      if (user.active) {
        throw new Error("Your account has already been activated.");
      }

      return User.findOneAndUpdate(user._id, { active: true });
    })
    .then(user => {
      req.flash("success", "Your account has been activated.");
      res.redirect("/login");
    })
    .catch(err => {
      req.flash("error", err.message);
      res.redirect("/signup");
    })
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
