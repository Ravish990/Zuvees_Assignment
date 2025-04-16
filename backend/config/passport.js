const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const ApprovedEmail = require('../models/ApprovedEmail');

module.exports = function(passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/api/auth/google/callback',
                passReqToCallback: true
            },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    // Check if the email is approved
                    const approvedEmail = await ApprovedEmail.findOne({
                        email: profile.emails[0].value,
                        isActive: true,
                    });

                    if (!approvedEmail) {
                        return done(null, false, {
                            message: 'Email not approved for access',
                        });
                    }

                    // Check if user exists
                    let user = await User.findOne({
                        googleId: profile.id,
                    });

                    if (user) {
                        // Update user's role if it has changed in ApprovedEmail
                        user.role = approvedEmail.role;
                        await user.save();
                    } else {
                        // Create new user
                        user = new User({
                            googleId: profile.id,
                            displayName: profile.displayName,
                            email: profile.emails[0].value,
                            profilePicture: profile.photos[0].value,
                            role: approvedEmail.role, // Assign the role from ApprovedEmail
                        });
                        await user.save();
                    }

                    return done(null, user);
                } catch (error) {
                    console.error(error);
                    return done(error);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id)
            .then(user => {
                done(null, user);
            })
            .catch(err => {
                done(err, null);
            });
    });
};
