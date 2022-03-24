const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 8080;
const { initializeApp } = require('firebase-admin/app');

// CS5356 TODO #2
// add serviceAccountKey.json into gitignore
// Uncomment this next line after you've created
// serviceAccountKey.json
const serviceAccount = require("../config/serviceAccountKey.json");
const userFeed = require("./app/user-feed");
const authMiddleware = require("./app/auth-middleware");

// CS5356 TODO #2
// Uncomment this next block after you've created serviceAccountKey.json
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// use cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/static", express.static("static/"));

// use res.render to load up an ejs view file
// index page
app.get("/", function (req, res) {
  //HTTP only = no sensitive data in cookies!
  //Google amazon set up cookies and follow you around in other website
  // window.cookieStore.getAll(), http-only not visible in this case
  //res.cookie('my-cookie','123', {httpOnly = True})
  res.render("pages/index");
});

app.get("/sign-in", function (req, res) {
  res.render("pages/sign-in");
});

app.get("/sign-up", function (req, res) {
  res.render("pages/sign-up");
});

app.get("/dashboard", authMiddleware, async function (req, res) {
  const feed = await userFeed.get();
  res.render("pages/dashboard", { user: req.user, feed });
});

/* listens to POST requests,*/
app.post("/sessionLogin", async (req, res) => {
  // CS5356 TODO #4
  // Get the ID token from the request body
  // Create a session cookie using the Firebase Admin SDK
  // Set that cookie with the name 'session'
  // And then return a 200 status code instead of a 501
  
  const idToken = req.body.idToken;
  //console.log(idToken)
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  admin.auth().createSessionCookie(idToken,{expiresIn}).then(
    sessionCookie => {
      const options = {maxAge: expiresIn, httpOnly: true};
      res.cookie("session", sessionCookie, options);
      res.status(200).send(JSON.stringify({status:"success"}));
    },
    error => {
      console.log(error)
      res.status(401).send({
        success: false,
        error: JSON.stringify(error)
      });
      ///res.status(401).send('UNAUTHORIZED REQUEST!');
    }
  );
});
/*
await fetch('/sessionLogin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: .... // add the users ID token here
})  
*/

app.get("/sessionLogout", (req, res) => {
  /*
  res.clearCookie("session");
  res.redirect("/sign-in");*/
  const sessionCookie = req.cookies.session || '';
  res.clearCookie('session');
  admin.auth()
    .verifySessionCookie(sessionCookie)
    .then((decodedClaims) => {
      return getAuth().revokeRefreshTokens(decodedClaims.sub);
    })
    .then(() => {
      res.redirect('/sign-in');
    })
    .catch((error) => {
      res.redirect('/sign-in');
    });
});

app.post("/dog-messages", authMiddleware, async (req, res) => {
  // CS5356 TODO #5
  // Get the message that was submitted from the request body
  // Get the user object from the request body
  // Add the message to the userFeed so its associated with the user
  
  message = req.body.message
  user = req.user

  await userFeed.add(user,message)
  const feed = await userFeed.get();
  res.render("pages/dashboard", { user: req.user, feed }); 
});

app.listen(port);
console.log("Server started at http://localhost:" + port);
