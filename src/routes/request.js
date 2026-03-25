const express = require('express');
const {userAuth} = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

const requestRouter = express.Router();

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ['ignored', 'interested'];
        if (!allowedStatus.includes(status.toLowerCase())) {
            return res.status(400).json({
                message: 'Invalid status type: ' + status
            });
        }

        // Check if toUser is a valid user in the system
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({
                message: 'The user you are trying to connect with does not exist'
            });
        }

        console.log('toUser', toUser);

        // Check if a connection request already exists between the two users
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        console.log('existingConnectionRequest', existingConnectionRequest);

        if (existingConnectionRequest) {
            return res.status(400).json({
                message: 'A connection request already exists between these users'
            });
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });
        console.log('connectionRequest', connectionRequest);

        const data = await connectionRequest.save();
        console.log('Data', data);

        res.json({
            message: req.user.firstName + ' is ' + status + ' in ' + toUser.firstName,
            data
        })

    } catch (err) {
        res.status(400).send('Error sending connection request:' + err.message);
    }
});

requestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        // Validate allowed status
        const allowedStatus = ['accepted', 'rejected'];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: 'Status not allowed!'});
        }

        // Logged In user should be ToUserId
        // Status should be interested
        // Request Id should be valid
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: 'interested'
        });

        if (!connectionRequest) {
            return res.status(404).json({
                message: 'Connection request not found'
            });
        }

        connectionRequest.status = status;

        const data = await connectionRequest.save();

        res.json({
            message: 'Connection request ' + status,
            data
        });


    } catch (err) {
        res.send(400).send('Error: ' + err.message);
    }
});

module.exports = requestRouter;