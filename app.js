require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");

mongoose.Promise = Promise;
mongoose
  .connect(
    process.env.MONGODB_URI,
    { useMongoClient: true }
  )
  .then(() => {
    console.log("Connected to Mongo!");
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  session({
    secret: "basic-auth-secret",
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

require("./passport")(app);
app.use(flash());

// Express View engine setup

app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true
  })
);

hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));
// Lib
app.use("/lib/owlcarousel", express.static(path.join(__dirname, "node_modules/owl.carousel/dist")));
app.use("/lib/fontawesome", express.static(path.join(__dirname, "node_modules/@fortawesome/fontawesome-free")));

app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

app.use((req, res, next) => {
  res.locals.title = "Wanderlust";
  res.locals.user = req.user;

  next();
});

const indexRouter = require("./routes/index");
const authRouter = require("./routes/authentication");
const tripRouter = require("./routes/trip");
const placeRouter = require("./routes/place");

app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/trips", tripRouter);
app.use("/places", placeRouter);

module.exports = app;
