const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');
const { validateSignUpData } = require('./utils/validation');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {userAuth} = require('./middlewares/auth');

app.use(express.json());
app.use(cookieParser());

app.post('/signup', async (req, res) => {
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
})

app.post('/login', async (req, res) => {
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

app.get('/profile', userAuth, async (req, res) => {

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

app.post('/sendConnectionRequest', userAuth, async (req, res) => {
    try {
        const user = req.user;
        // Sending a connection request
        res.send(user.firstName + ' sent the connection request!!');
    } catch (err) {
        res.status(400).send('Error sending connection request:' + err.message);
    }
});

// Get user by email
app.get('/user', async (req, res) => {
    const userEmail = req.body.emailId;
    try {
        const user = await User.findOne({ emailId: userEmail });
        if (!user) {
            res.status(404).send('User not found');
        } else {
            res.send(user);
        }
    } catch (err) {
        res.status(400).send('Error fetching user:' + err.message);
    }
});

app.get('/feed', async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (err) {
        res.status(400).send('Error fetching users:' + err.message);
    }
});

// Delete user by ID
app.delete('/user', async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await User.findByIdAndDelete(userId);
    } catch (err) {
        res.status(400).send('Error deleting user:' + err.message);
    }
});

// Update data of the user
app.patch('/user/:userId', async (req, res) => {
    const userId = req.params?.userId;
    const data = req.body;

    try {
        
        const ALLOWED_UPDATES = ['photoUrl', 'about', 'gender', 'skills', 'age'];

        const isUpdateAllowed = Object.keys(data).every((k) => ALLOWED_UPDATES.includes(k));

        if (!isUpdateAllowed) {
            throw new Error('Update not allowed');
        }

        if (data?.skills.length > 10) {
            throw new Error('You can add maximum 10 skills');
        }

        const user = await User.findByIdAndUpdate({ _id: userId }, data, {
            returnDocument: 'after',
            runValidators: true
        });
        res.send('User updated successfully');
    } catch (err) {
        res.status(400).send('Error updating user:' + err.message);
    }
})

connectDB().then(() => {
    console.log('Database connection successful');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});


app.listen(7777, () => {
  console.log('Server is running on port 7777');
});