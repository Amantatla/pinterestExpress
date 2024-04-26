var express = require('express');
var router = express.Router();
const userModel = require('./users')
const postModel = require('./post')
const passport = require('passport');
const localStrategy = require("passport-local");
const users = require('./users');
passport.use(new localStrategy(userModel.authenticate()))
const uploads = require('./multer')


// Home page route
router.get('/', function (req, res) {
  res.render('index', { title: "Pintrest" })
});

// login page route
router.get('/login', function (req, res) {
  res.render('login', { title: "Pintrest", error: req.flash('error') })
});

// login page route
router.get('/forgotpassword', function (req, res) {
  res.render('changepassword', { title: "Pintrest" })
});

// profile route
router.get('/profile', isLoggedIn, async function (req, res, next) {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user
    });
    res.render('profile', { title: "Pinterest", user: user });
  } catch (error) {
    next(error);
  }
});

// feed route
router.get('/profile', isLoggedIn, function (req, res, next) {
  res.render('feed', { title: "Pintrest" })
});

// authentication Code

// register
router.post('/register', async (req, res) => {
  const { username, email, fullname, password } = req.body;

  try {
    const newUser = new userModel({ username, email, fullname });
    await userModel.register(newUser, password);
    passport.authenticate("local")(req, res, () => {
      res.redirect('/profile');
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering user');
  }
});


// login
router.post('/login', passport.authenticate("local", {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => { })

// logout
router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

// isloggedin midleware 
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/')
}

// Change password
router.post('/changepassword', function (req, res) {
  User.findByUsername(req.body.username, (err, user) => {
    if (err) {
      res.send(err);
    } else {
      user.changePassword(req.body.oldpassword,
        req.body.newpassword, function (err) {
          if (err) {
            res.send(err);
          } else {
            res.send('successfully change password')
          }
        });
    }
  });
});


module.exports = router;
