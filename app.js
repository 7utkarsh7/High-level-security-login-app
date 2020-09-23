//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require('path');
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();


app.use(express.static(path.join(__dirname,"public")));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: "my secret",
  resave: false,
  saveUninitialize: false
  cookie: { secure: true}
}));

app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb+srv://admin-user:7utkarsh7@cluster0.r5ked.mongodb.net/userDB", {useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);




const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/secret/:userAccount", function(req,res){
  const username = req.params.userAccount;
  if(req.isAuthenticated()){

  res.render("user", {name:username});
  }else {
    res.redirect("/login");
  }

});







app.get("/logout", function(req,res){
req.logout();
res.redirect("/login");

});




app.post("/register", function(req, res){

User.register({username: req.body.username},req.body.password, function(err, user){
  if(err){
    console.log(err);
   res.redirect("/login");
  }
  else{
    passport.authenticate("local")(req , res ,function(){
      res.redirect("/secret/"+req.body.username);
    });
  }

});
});

app.post("/login", function(req, res){

const user = new User({
  username: req.body.username
  , password:req.body.password
});
req.login(user, function(err){
if(err){
  console.log(err);
}
  else {
    passport.authenticate("local")(req , res ,function(){
      res.redirect("/secret/"+ user.username);
  });
}


});
});





app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

let port =process.env.PORT;
if(port=== null || port === ""){
  port = 3000;
}

app.listen(port , function(){
  console.log("Server started successfully!");
});
