const express = require("express");
const router = express.Router();

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

module.exports = router;
