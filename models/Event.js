const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    eventName: {
        type: String,
        required: true,
    },
    eventDesc: {
        type: String,
        required: true,
    },
    isFree: {
        type: Boolean,
        required: true,
    },
    amount: {
        type: String,
        default: 0,
    },
    meetingType: {
        type: String,
        enum: ['online', 'venue'],
        required: true,
    },
    meetingLink: {
        type: String,
        required: function() {
            return this.meetingType === 'online';
        },
    },
    venueDetails: {
        type: String,
        required: function() {
            return this.meetingType === 'venue';
        },
    },
    eventStartDateTime: {
        type: Date,
        required: true,
    },
    eventEndDateTime: {
        type: Date,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        alt: {
            type: String,
            default: 'https://i.postimg.cc/7ZhCwRmB/event-banner.jpg',
        },
        width: {
            type: Number
        },
        height: {
            type: Number
        }
    }],
    paymentDetails: {
        type: Object, // Change this to Object to store the payment details directly
    },
    clientPayments: [{
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  // Refers to the user who is purchasing the event ticket
            required: true
        },
        paymentMethod: {
            type: String,  // Payment method used by the client
            required: true
        },
        paymentAmount: {
            type: Number,  // Amount paid by the client
            required: true
        },
        transactionId: {
            type: String,  // Transaction ID for tracking the payment
            required: true
        },
        paymentStatus: {
            type: String,  // Payment status (e.g., 'pending', 'completed', 'failed')
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        paymentDate: {
            type: Date,  // The date and time when the payment was made
            default: Date.now
        }
    }]
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
