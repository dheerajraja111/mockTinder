const express = require('express');
const User = require('../models/user');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {userAuth} = require('../middlewares/auth');
const { validateEditProfileData } = require('../utils/validation');

const profileRouter = express.Router();

profileRouter.get('/profile/view', userAuth, async (req, res) => {

    try {
        const cookies = req.cookies;

        const { token } = cookies;

        if (!token) {
            throw new Error('Invalid token');
        }

        // Validate my token
        const decodedMessage = await jwt.verify(token, 'Mock@Tinder123');
        
        const { _id } = decodedMessage;
        
        const user = await User.findById(_id);
        if (!user) {
            throw new Error('User not found');
        }

        res.send(user);
    } catch (err) {
        res.status(400).send('Error fetching profile:' + err.message);
    }
});

profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            throw new Error('Invalid edit fields');
        };
        const loggedInUser = req.user;

        Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName}, Your profile updated successfully`,
            data: loggedInUser
        });
    } catch (err) {
        return res.status(400).send('Error validating the data:' + err.message);
    }
});

module.exports = profileRouter;