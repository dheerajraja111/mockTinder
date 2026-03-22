const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(
        'mongodb+srv://dheerajraja111:E133go2iXNtK41bU@mocktinder.xaerh5z.mongodb.net/mockTinder'
    );
}

module.exports = connectDB;