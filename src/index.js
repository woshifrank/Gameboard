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
const GroupService = require('./app/group-service');
const PostService = require('./app/post-service');

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
app.get("/create-group-page", authMiddleware, async (req, res) => {
  /*
  {group_name:'CSGO-Mods', 
  game_name: 'Counter-Strike: Global Offensive',
  game_type:'FPS', 
  slogan:'Welcome, MOD makers and users!',
  intro:'Here houses the discussion channels CSGO MOD making',
  admin_email: 'yy586@cornell.edu'
  }
  */
  res.render("pages/group-create", { user: req.user, 
    role:req.role
  });
});
app.post("/create-group", authMiddleware, async (req, res) => {
  /*
  {group_name:'CSGO-Mods', 
  game_name: 'Counter-Strike: Global Offensive',
  game_type:'FPS', 
  slogan:'Welcome, MOD makers and users!',
  intro:'Here houses the discussion channels CSGO MOD making',
  admin_email: 'yy586@cornell.edu'
  }
  */
  info = {
    group_name : req.body.group_name,
    game_name : req.body.game_name,
    game_type : req.body.game_type,
    slogan: req.body.slogan,
    intro: req.body.intro,
    admin_email: req.user.email
  }
  //console.log(info)
  GroupService.createGroup(info).then((success)=>{
    if(success === true){
      //console.log('yes')
      res.json({success:true});
    }
    else{
      //console.log('no')
      res.json({success:false});
    }
  })
});
app.get("/modify-group-page/:group_id", authMiddleware, async (req, res) => {
  let group = await GroupService.getGroupById(req.params.group_id)
  res.render("pages/group-edit", { user: req.user, 
    role:req.role,
    group_id:req.params.group_id,
    old_group_name:group.group_name
  });
});
app.patch("/edit-group", authMiddleware, async (req, res) => {
  info = {
    group_name : req.body.group_name,
    game_name : req.body.game_name,
    game_type : req.body.game_type,
    slogan: req.body.slogan,
    intro: req.body.intro,
    email: req.user.email,
    group_id: req.body.group_id
  }
  // need group_id, old_group_name
  // console.log(info)
  GroupService.changeGroup(info).then((success)=>{
    if(success === true){
      //console.log('yes')
      res.json({success:true});
    }
    else{
      //console.log('no')
      res.json({success:false});
    }
  })
})
app.get("/gameboard/:group_name", authMiddleware, async (req, res) => {
  info = {email:req.user.email}
  let group = await GroupService.getGroupByName(req.params.group_name)
  // console.log(group)
  let admin_group = {}
  let player_group = {}
  if (req.role == 'admin'){
    admin_group = await GroupService.getUserAdminGroup(info)
  }
  player_group = await GroupService.getUserPlayerGroup(info)
  let post_info = await PostService.getPostByGroupId(group.group_id)
  console.log(post_info)
  res.render("pages/group", { user: req.user,
    role:req.role, 
    group_id : group.group_id,
    group_name: req.params.group_name,
    group_intro: group.intro,
    group_slogan: group.slogan,
    admin_info:admin_group,
    player_info: player_group,
    post_info: post_info
  });
});
app.post("/create-post", authMiddleware, async (req, res) => {
 /*
    group_name
    title
    body
    author
    time
  */
  info = {
    group_name : req.body.group_name,
    title : req.body.title,
    post_body : req.body.post_body,
    author: req.user.email
  }
  //console.log(info)
  PostService.makePost(info).then((success)=>{
    if(success === true){
      //console.log('yes')
      res.json({success:true});
    }
    else{
      //console.log('no')
      res.json({success:false});
    }
  })
});
app.get("/dashboard", authMiddleware, async function (req, res) {
  //console.log(req.role)
  let admin_group = null
  let player_group = null
  info = {email:req.user.email}
  /*
  {
    group_name: [intro,id]
    'CSGO-Mods': 'Here houses the discussion channels CSGO MOD making'
  }*/
  if (req.role == 'admin'){
    admin_group = await GroupService.getUserAdminGroup(info)
  }
  player_group = await GroupService.getUserPlayerGroup(info)
  popular_groups = ['Elden Ring','Tom Clancy Rainbow Six Siege', 'Sifu']
  popular_status = {}
  for (const name of popular_groups) {
    if (name in player_group){
      // joined as player
      popular_status[name] = 0 
    }
    else if(admin_group && name in admin_group){
      // already an admin
      popular_status[name] = 1 
    }
    else{
      // not in the group, can join
      popular_status[name] = 2
    }
  }
  //console.log(popular_status)  
  res.render("pages/dashboard", { user: req.user, 
    role:req.role,
    admin_info:admin_group,
    player_info: player_group,
    popular_status: popular_status
  });
});

/* add authMiddleware*/
app.post("/sessionLogin", async (req, res) => {
  // Get the ID token from the request body
  // Create a session cookie using the Firebase Admin SDK
  // Set that cookie with the name 'session'
  // And then return a 200 status code instead of a 501
  
  const idToken = req.body.idToken;
  const role = req.body.user_role;
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
          //console.log(userData)
          // take the user id, email, role, saved in firebase
          const id = userData.sub;
          const email = userData.email;
         //console.log('signInType:',signInType)
          if (signInType === 'register') {
            // save to firebase
            UserService.createUser(id, email, role).then((user_role) => {
              //console.log(user_role)
              console.log('start UserService')
              res.status(200).send(JSON.stringify({
                status:"success",
                user_role: user_role
              }));
            })
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
    }
  );
});

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

app.post("/join-group", authMiddleware, async (req, res) => {
  info = {email:req.user.email,
          group_name:req.body.group}
  GroupService.joinGroup(info).then(()=>{
    res.status(200).send(JSON.stringify({status:"success"}));
  })
});
app.post("/leave-group", authMiddleware, async (req, res) => {
  info = {email:req.user.email,
    group_name:req.body.group}
  GroupService.leaveGroup(info).then(()=>{
    res.status(200).send(JSON.stringify({status:"success"}));
  })
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
