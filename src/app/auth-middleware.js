const admin = require("firebase-admin");
const UserService = require('./user-service');

module.exports = (req, res, next) => {
  //const sessionCookie = req.cookies.session || "";
  const sessionCookie = req.cookies["__session"] || "";

  if (sessionCookie === "") {
    res.redirect("/sign-in");
  } else {
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then(userData => {
        // console.log("Logged in:", userData.email);
        req.user = userData;
        //userData.email
        UserService.getUserByEmail(userData.email).then(res => {
          req.role = res.role
          next();
        }).catch(error => {
          console.log('not found')
          res.redirect("/sign-in");
        });
      })
      .catch(error => {
        res.redirect("/sign-in");
      });
  }
};
