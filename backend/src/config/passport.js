import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { pool } from "./db.js";
import { env } from "./env.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: `${env.apiUrl}/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const fullName = profile.displayName;
        const googleId = profile.id;

        // Check if user exists
        let result = await pool.query(
          `SELECT id, full_name, email, username, role, is_active, created_at
           FROM users
           WHERE email = LOWER($1) OR google_id = $2`,
          [email, googleId]
        );

        let user;
        if (result.rowCount > 0) {
          user = result.rows[0];
          
          // Update google_id if not set
          if (!user.google_id) {
            await pool.query(
              `UPDATE users SET google_id = $1 WHERE id = $2`,
              [googleId, user.id]
            );
          }
        } else {
          // Create new user
          const username = email.split('@')[0].toLowerCase();
          result = await pool.query(
            `INSERT INTO users (full_name, email, username, google_id, role, password_hash)
             VALUES ($1, LOWER($2), LOWER($3), $4, $5, $6)
             RETURNING id, full_name, email, username, role, is_active, created_at`,
            [fullName, email, username, googleId, "cashier", ""]
          );
          user = result.rows[0];
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, username, role, is_active, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
