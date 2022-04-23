const functions = require("firebase-functions")
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 8080;
const { initializeApp } = require('firebase-admin/app');
const UserService = require('./app/user-service');

// add gameboard-serviceAccountKey.json into gitignore
// Uncomment this next line after you've created
// gameboard-serviceAccountKey.json
const serviceAccount = require("../config/gameboard-serviceAccountKey.json");
const userFeed = require("./app/user-feed");
const authMiddleware = require("./app/auth-middleware");

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

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

app.use("/public", express.static("public/"));

// use res.render to load up an ejs view file
// index page
app.get("/", function (req, res) {
  //HTTP only = no sensitive data in cookies!
  //Google amazon set up cookies and follow you around in other website
  // window.cookieStore.getAll(), http-only not visible in this case
  //res.cookie('my-cookie','123', {httpOnly = True})

  //const sessionCookie = req.cookies.session || "";
  const sessionCookie = req.cookies["__session"] || "";
  if (sessionCookie === "") {
    res.render("pages/index",{ user: null})
  }
  else{
    admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(userData => {
      // console.log("Logged in:", userData.email);
      //console.log(userData)
      req.user = userData;
      res.render("pages/index",{ user: req.user});
    })
    .catch(error => {
      res.render("pages/index",{user: null})
    });
  }
});

app.get("/sign-in", function (req, res) {
  //const sessionCookie = req.cookies.session || "";
  const sessionCookie = req.cookies["__session"] || "";
  if (sessionCookie === "") {
    res.render("pages/sign-in",{user: null})
  }
  else{
    admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(userData => {
      console.log("Logged in:", userData.email);
      req.user = userData;
      res.render("pages/sign-in",{ user: req.user});
    })
    .catch(error => {
      res.render("pages/sign-in",{user: null})
    });
  }
});

app.get("/sign-up", function (req, res) {
  //const sessionCookie = req.cookies.session || "";
  const sessionCookie = req.cookies["__session"] || "";
  if (sessionCookie === "") {
    res.render("pages/sign-up",{user: null, type:'player'})
  }
  else{
    admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(userData => {
      console.log("Logged in:", userData.email);
      req.user = userData;
      res.render("pages/sign-up",{ user: req.user, type:'player'});
    })
    .catch(error => {
      res.render("pages/sign-up",{user: null, type:'player'})
    });
  }
});

app.get("/player-sign-up", function (req, res) {
  //const sessionCookie = req.cookies.session || "";
  const sessionCookie = req.cookies["__session"] || "";
  if (sessionCookie === "") {
    res.render("pages/sign-up",{user: null, type:'player'})
    // res.render("pages/sign-up",{type: 'provider'})
    // <%= type %>
    // <input type="hidden" name = "role" value = "<%= type %>">
  }
  else{
    admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(userData => {
      req.user = userData;
      res.render("pages/sign-up",{ user: req.user, type:'player'});
    })
    .catch(error => {
      res.render("pages/sign-up",{user: null, type:'player'})
    });
  }
});


app.get("/admin-sign-up", function (req, res) {
  //const sessionCookie = req.cookies.session || "";
  const sessionCookie = req.cookies["__session"] || "";
  if (sessionCookie === "") {
    res.render("pages/sign-up",{user: null, type:'admin'})
    // res.render("pages/sign-up",{type: 'provider'})
    // <%= type %>
    // <input type="hidden" name = "role" value = "<%= type %>">
  }
  else{
    admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(userData => {
      req.user = userData;
      res.render("pages/sign-up",{ user: req.user, type:'admin'});
    })
    .catch(error => {
      res.render("pages/sign-up",{user: null, type:'admin'})
    });
  }
});

/*
app.get("/dashboard", authMiddleware, async function (req, res) {
  const feed = await userFeed.get();
  res.render("pages/dashboard", { user: req.user, feed });
});
*/
app.get("/dashboard", authMiddleware, async function (req, res) {
  res.render("pages/dashboard", { user: req.user});
});

/* add authMiddleware*/
app.post("/sessionLogin", async (req, res) => {
  // Get the ID token from the request body
  // Create a session cookie using the Firebase Admin SDK
  // Set that cookie with the name 'session'
  // And then return a 200 status code instead of a 501
  
  const idToken = req.body.idToken;
  const role = req.body.role;
  const signInType = req.body.signInType

  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  admin.auth().createSessionCookie(idToken,{expiresIn}).then(
    sessionCookie => {
      const options = {maxAge: expiresIn, httpOnly: true};
      //res.cookie("session", sessionCookie, options);
      res.cookie("__session", sessionCookie, options);
      admin
        .auth()
        .verifySessionCookie(sessionCookie, true)
        .then(userData => {
          //console.log("Logged in:", userData.email);
          req.user = userData;
          // take the user id, email, role, saved in firebase
          const id = userData.sub;
          const email = userData.email;
         //console.log('signInType:',signInType)
          if (signInType === 'register') {
            // save to firebase
            console.log('start UserService');
            UserService.createUser(id, email, role).then(() =>{
              res.status(200).send(JSON.stringify({status:"success"}));
            }).catch(error => {
              console.log('createUser error')
              res.redirect("/sign-in");
            });
          }
          else{
            console.log('Login succeed');
            res.status(200).send(JSON.stringify({status:"success"}));
          }
        })
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
  
  /*
  const sessionCookie = req.cookies.session || '';
  res.clearCookie('session');
  */

  
  const sessionCookie = req.cookies["__session"] || "";
  res.clearCookie("__session");
  
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
  // Get the message that was submitted from the request body
  // Get the user object from the request body
  // Add the message to the userFeed so its associated with the user
  
  message = req.body.message
  user = req.user

  await userFeed.add(user,message)
  const feed = await userFeed.get();
  res.render("pages/dashboard", { user: req.user, feed }); 
});

/*
exports.helloWorld = functions.https.onRequest((request,response) => {
  functions.logger.info("Hello logs",{structuredData:true});
  response.send('Hello from Firebase');
});
*/

exports.app = functions.https.onRequest(app);
// functions.logger.log(error);

// app.listen(port);
//console.log("Server started at http://localhost:" + port);
