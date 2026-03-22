const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');

app.use(express.json());

app.post('/signup', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        res.send('User created successfully');
    } catch(err) {
        res.status(400).send('Error saving the user:' + err.message)
    }
})

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
        console.log(user);
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