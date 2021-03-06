var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var ObjectId = require('mongoose').Types.ObjectId;
// var Tune = require('../models/tune');
/* GET users listing. */


router.post('/register', function (req, res, next) {
  addToDB(req, res);
});

router.get('/', (req,res)=>{
  User.find((err,docs) => {
    if (!err) { res.send(docs); }
    else { console.log('Error in Retriving Users :' + JSON.stringify(err, undefined, 2)); }
  });
})
router.get('/users:id', (req, res) => {
  if (!ObjectId.isValid(req.params.id))
      return res.status(400).send(`No record with given id : ${req.params.id}`);

  User.findById(req.params.id, (err, doc) => {
      if (!err) { res.send(doc); }
      else { console.log('Error in Retriving Employee :' + JSON.stringify(err, undefined, 2)); }
  });
});
router.put('/users:id', (req, res) => {
  if (!ObjectId.isValid(req.params.id))
      return res.status(400).send(`No record with given id : ${req.params.id}`);

  var usr = {
      name: req.body.username,
      email: req.body.email,

  };
  User.findByIdAndUpdate(req.params.id, { $set: usr }, { new: true }, (err, doc) => {
      if (!err) { res.send(doc); }
      else { console.log('Error in User Update :' + JSON.stringify(err, undefined, 2)); }
  });
});
router.delete('/users:id', (req, res) => {
  if (!ObjectId.isValid(req.params.id))
      return res.status(400).send(`No record with given id : ${req.params.id}`);

  User.findByIdAndRemove(req.params.id, (err, doc) => {
      if (!err) { res.send(doc); }
      else { console.log('Error in User Deletion :' + JSON.stringify(err, undefined, 2)); }
  });
});

async function addToDB(req, res) {

  var user = new User({
    email: req.body.email,
    username: req.body.username,
    password: User.hashPassword(req.body.password),
    creation_dt: Date.now(),
  });


//await function to give the feel it is a synchronous call where as internally it is an asynchronous call.
  try {
    doc = await user.save();  //saves the user to mongoDB
    return res.status(201).json(doc);
  }
  catch (err) {
    return res.status(501).json(err);
  }
}

// async function saveTune(req,res) {
//   console.log(req.body.row);

//   var tune = new Tune({
//     row: req.body.row
//   })
//   try {
//     doc = await tune.save();  //saves the user to mongoDB
//     return res.status(201).json(doc);
//   }
//   catch (err) {
//     return res.status(501).json(err);
//   }
// }

router.post('/login',function(req,res,next){
  passport.authenticate('local', function(err, user, info) {
    if (err) { return res.status(501).json(err); }
    if (!user) { return res.status(501).json(info); }
    //logIn function is provoded by passport, if user exists check if any error, if not sign the user in
    req.logIn(user, function(err) {
      if (err) { return res.status(501).json(err); }
      return res.status(200).json({message:'Login Success'});
    });
  })(req, res, next);
});

router.post('/addToPlayList/:email', function (req, res, next) {
  console.log("AT route add ti play list")

  console.log(req.params.email)
  // var u = User.find({
  //   username: req.body.username
  // })
  // res.status(200).json(u);

  // console.log(u);

  User.update({
    email: req.params.email
  }, {
    $push: {
      row: req.body
    }
  },{
    upsert:true
  }, function(err){
    if(err){
      console.log("Error has occured. Life sucks.");

    }
  });
});

router.get('/retriveUserMusic/:email', function (req, res, next) {
  console.log("AT route retrive music")

  console.log(req.params.email)
  User.find({},(err,docs) => {
    if (!err) { res.send(docs); console.log(docs.row);
    console.log("reached here");}
    if(err)
    {
      console.log(err);
    }
    });
});

router.get('/Profile/editUser/:email',function (req, res, next) {
  console.log("AT route edit user")

  console.log(req.params.email)
  console.log(req.body)
  User.update({
    email: req.params.email
  }, {
    $set: {
      username: req.body,

    }
  },{
    upsert:true,

  }, function(err){
    if(err){
      console.log("error.");

    }
  });

});





// router.post('/addToPlayList', function (req,res){
//   saveTune(req,res);
// });

router.get('/user',isValidUser,function(req,res,next){
  return res.status(200).json(req.user);
});

router.get('/logout',isValidUser, function(req,res,next){
  req.logout();
  return res.status(200).json({message:'Logout Success'});
})

function isValidUser(req,res,next){
  if(req.isAuthenticated()) next();
  else return res.status(401).json({message:'Unauthorized Request'});
}
module.exports = router;
