/**
 * config/passport.js — Google OAuth2 strategy.
 *
 * Stateless — no passport sessions. The callback handler issues
 * JWT tokens directly (same as the existing login flow).
 */

const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");

function configurePassport() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || "/api/v1/auth/google/callback";

  if (!clientID || !clientSecret) {
    console.warn("[passport] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth disabled.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope: ["profile", "email"],
      },
      // Verify callback — we don't use passport sessions so just pass the profile through.
      (_accessToken, _refreshToken, profile, done) => {
        done(null, profile);
      }
    )
  );
}

module.exports = { configurePassport, passport };
