const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
    },
    password: {
        type: String,
        minlength: 6,
    },
    phone: {
        type: String,
    },
    otp: {
        code: {
            type: String,
        },
        expiresAt: {
            type: Date,
        },
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    profileImage: {
        type: String,
        trim: true,
        default: 'https://i.postimg.cc/8Pp0NY9x/avatar-8.png',
    },
    bio: {
        type: String,
        trim: true,
    },
    website: {
        type: String,
        trim: true,
    },
    socialLinks: {
        facebook: {
            type: String,
            trim: true,
        },
        instagram: {
            type: String,
            trim: true,
        },
        twitter: {
            type: String,
            trim: true,
        },
        linkedin: {
            type: String,
            trim: true,
        },
    },
    address: {
        addressLine1: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        zipCode: {
            type: String,
            trim: true,
        },
    },
    eventsHosted: {
        total: {
            type: Number,
            default: 0,
        },
        online: {
            type: Number,
            default: 0,
        },
        offline: {
            type: Number,
            default: 0,
        },
        free: {
            type: Number,
            default: 0,
        },
        paid: {
            type: Number,
            default: 0,
        },
        attendedEvents:{
            type: Number,
            default: 0,
        }
        
    },
    savedEvents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        }
    ],    
    followers: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        }
    ],
    following: [
        { 
            type: mongoose.Schema.Types.ObjectId,
             ref: 'User' 
        }
    ],
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
