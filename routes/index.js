var express = require('express');
var router = express.Router();

const userModel=require("./users");

const passport = require("passport");

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;


// Passport Local Strategy
passport.use(new LocalStrategy(
  (username, password, done) => {
    User.findOne({ username })
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'Incorrect username or password.' });
        }
        if (!user.verifyPassword(password)) {
          return done(null, false, { message: 'Incorrect username or password.' });
        }
        return done(null, user);
      })
      .catch(err => done(err));
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => done(err));
});

// Middleware
router.use(bodyParser.json());

// Authentication Middleware
const authenticate = passport.authenticate('local', { session: false });  // Disable session

// API Endpoints

// GET /users (optional: filtering/pagination)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();  // Adjust query for filtering/pagination
    res.json(users);
  } catch (err) {
    res.status(500).send('Error fetching users');
  }
});

// GET /users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (err) {
    res.status(500).send('Error fetching user');
  }
});

// POST /users (register a new user)
router.post('/users', async (req, res) => {
  try {
    const { username, email, fullName, password } = req.body;

    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(409).send('Username already exists');
    }

    const newUser = new User({ username, email, fullName, password });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).send('Error creating user');
  }
});
  