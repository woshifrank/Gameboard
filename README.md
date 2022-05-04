# Milestone 2 Gameboard

## Usage

* Run  `npm install` to install all the project dependencies
* Run `npx firebase emulators:start` to start the emulator
* View Emulator UI at http://127.0.0.1:4000
* Please check gitignore for serviceAccountKey naming

## deployed version
* Please go to https://gameboard-75159.web.app/

## APIs for authentication
Get "/" : The landing page
Get "/sign-in" The login in page
Get "/admin-sign-up" The registration page for admin
Get "/player-sign-up" The registration page for normal player

POST "/sessionLogin", req.body = {idToken,role}, verify the email and password combination.
GET "/sessionLogout", log out a user by clearing the cookies

## APIS For Gameboard(group) logistics
1. Middleware called auth-middleware, it checks user cookies and store user's email and role(admin/player) into req. I use auth-middleware in the following APIS

GET "/dashboard" : Retrive the user dashboard for admin/player
GET "/create-group-page", open the create Gameboard form, only for admins
POST "/create-group", create a Gameboard.
POST "/join-group", join an exiting Gameboard, open to both admin and player
POST "/leave-group", leave an exiting Gameboard, open to both roles.

GET "/modify-group-page/:group_id", open the edit Gameboard form, only     available to admins

PATCH "/edit-group", submit the form and edit the Gameboard info(name, targeted video game, slogan, intro) 

GET "/gameboard/:group_name", visit the Gameboard page

POST "/create-post", create a post with title and body in a Gameboard page. Group name in request.body




