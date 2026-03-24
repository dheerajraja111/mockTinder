const express = require('express');
const authRouter = express.Router();
const { validateSignUpData } = require('../utils/validation');
const User = require('../models/user');
const bcrypt = require('bcrypt');


authRouter.post('/signup', async (req, res) => {
    // Validate the incoming data
    try {
        validateSignUpData(req);

        const { firstName, lastName, emailId, password } = req.body;

        // Encrypt the password
        const passwordHash = await bcrypt.hashSync(password, 10);

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash
        });
    
        await user.save();
        res.send('User created successfully');
    } catch(err) {
        res.status(400).send('Error saving the user:' + err.message)
    }
});

authRouter.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId: emailId });

        if (!user) {
            throw new Error('Email Id is not present in the database');
        }

        const isPasswordValid = await user.validatePassword(password);
        if (isPasswordValid) {
            // Create a JWT token
            const token = await user.getJWT();

            // Add the token to cookie and send the response back to the user
            res.cookie('token', token);
            
            res.send('Login successful');
        } else {
            throw new Error('Invalid password');
        }
    } catch (err) {
        res.status(400).send('Error logging in:' + err.message);
    }
    
});

authRouter.post('/logout', async (req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
    }).send('Logged out successfully');
});

module.exports = authRouter;