const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
const fetch = require('node-fetch');

const app = express();

// Configure session middleware
app.use(session({ secret: 'your-session-secret', resave: false, saveUninitialized: true }));

// Initialize Passport and restore authentication state from the session
app.use(passport.initialize());
app.use(passport.session());

// Facebook strategy configuration
passport.use(new FacebookStrategy({
    clientID: '1759962398142188',
    clientSecret: '2eb474653bd7c12474d5e61b88871f94',
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['psyclonenine88', 'Sarinya Kr ', 'sarinya.mind.k@hotmail.com']
  },
  async (accessToken, refreshToken, profile, done) => {
    // Save user profile and token as needed
    console.log('Access Token:', accessToken);
    console.log('Profile:', profile);

    // Example: Fetch long-term token
    const longTermTokenResponse = await fetch(`https://graph.facebook.com/v12.0/oauth/access_token?grant_type=fb_exchange_token&client_id=1759962398142188&client_secret=2eb474653bd7c12474d5e61b88871f94&fb_exchange_token=${accessToken}`);
    const longTermTokenData = await longTermTokenResponse.json();
    console.log('Long-Term Token:', longTermTokenData.access_token);

    // Save long-term token if needed

    return done(null, profile);
  }
));

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Routes
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
