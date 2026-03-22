const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email format');
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error('Password is not strong enough');
            }
        }
    },
    age: {
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        validate(value){
            if (!['male', 'female', 'other'].includes(value.toLowerCase())) {
                throw new Error('Gender data is not valid');
            }
        }
    },
    photoUrl: {
        type: String,
        default: 'https://geographyandyou.com/images/user-profile.png',
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error('Invalid photo URL format: ' + value);
            }
        }
    },
    about: {
        type: String,
        default: 'This is default about the user'
    },
    skills: {
        type: [String]
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;