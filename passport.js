const axios = require('axios');

const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3002;

// Configure express-session middleware
app.use(session({
  secret: 'your-session-secret',  // Replace with your own session secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to true if using HTTPS
}));

passport.use(new FacebookStrategy({
  clientID:  process.env.FB_APP_ID,
  clientSecret: process.env.FB_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/callback"
},
function(accessToken, refreshToken, profile, done) {
  return done(null, profile);
}));


app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Route to initiate the Facebook login process
app.get('/auth/facebook', passport.authenticate('facebook'));

// Callback route after Facebook login
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  async (req, res) => {
    const shortLivedToken = req.user.accessToken;  // Get short-lived token

    try {
      // Exchange the short-lived token for a long-term token
      const longTermToken = await exchangeForLongTermToken(shortLivedToken);
      console.log('Longterm Token:'.longTermToken);

      // Store long-term token in the session for future use
      req.session.longTermToken = longTermToken;
     console.log('Session Token ='.req.session.longTermToken);
      // Redirect to a page in your app (e.g., profile, dashboard)
      res.redirect('/profile');  // Replace with your desired page
    } catch (error) {
      console.error('Error exchanging token:', error);
      res.status(500).send('Failed to exchange for long-term token');
    }
  }
);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



// Function to exchange the short-lived token for a long-term token
async function exchangeForLongTermToken(shortLivedToken) {
  try {
    const response = await axios.get('https://graph.facebook.com/v17.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_APP_SECRET,
        fb_exchange_token: shortLivedToken,
      },
    });
    return response.data.access_token; // Return the long-term token
  } catch (error) {
    console.error('Error exchanging token:', error);
    throw new Error('Failed to generate long-term token');
  }
}

// Export the function to use in other files
module.exports = {
  exchangeForLongTermToken
};
