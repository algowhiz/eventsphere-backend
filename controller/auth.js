const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');
require('dotenv').config();



// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOtpEmail = async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    try {
        let user = await User.findOne({ email });

        if (user) {
            user.otp = { code: otp, expiresAt };
        } else {
            user = new User({ email, isVerified: false, otp: { code: otp, expiresAt } });
        }

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending OTP', error });
            }
            return res.status(200).json({ message: 'OTP sent successfully' });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

const sendOtpToUpdateEmail = async (req, res) => {
    const { email, update_email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email does not exist' });
        }

        user.otp = { code: otp, expiresAt };
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: update_email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending OTP', error });
            }
            return res.status(200).json({ message: 'OTP sent successfully' });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

const verifyOtpEmail = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Email not registered' });
        }

        if (user.otp.code !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otp.expiresAt < new Date()) {
            user.otp = { code: null, expiresAt: null }; // Clear OTP
            await user.save();
            return res.status(400).json({ message: 'OTP has expired' });
        }

        user.otp = { code: null, expiresAt: null }; // Clear OTP
        user.isVerified = true;
        await user.save();

        return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

const updateEmail = async (req, res) => {
    const { email, newEmail } = req.body;

    if (!email || !newEmail) {
        return res.status(400).json({ message: 'Current email and new email are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.email = newEmail;
        user.otp = { code: null, expiresAt: null };
        user.isVerified = true;
        await user.save();

        return res.status(200).json({ message: 'Email updated successfully', user });
    } catch (error) {
        console.error('Error updating email:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const signUp = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            if (user.name || user.password || user.phone) {
                return res.status(400).json({ error: 'User already exists' });
            }
            user.name = name;
            user.password = password;
            user.phone = phone;

            if (req.file) {
                user.profileImage = req.file.path; // Cloudinary URL
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            return res.status(200).json({ message: 'User updated successfully.' });
        }

        user = new User({ name, email, password, phone, isVerified: false });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        if (req.file) {
            user.profileImage = req.file.path; // Cloudinary URL
        }

        await user.save();

        return res.status(201).json({ message: 'User created successfully. Please verify your email.' });
    } catch (error) {
        console.error('Error during sign up:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const payload = { id: user._id, email: user.email };
        const expiresIn = rememberMe ? '7d' : '1h';
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
        
        const { _id, name, email: userEmail, phone, isVerified, createdAt, profileImage , eventsHosted , savedEvents} = user;
        const userInfo = { _id, name, email: userEmail, phone, isVerified, createdAt, profileImage , eventsHosted , savedEvents:savedEvents.length};

        return res.json({ message: 'Login successful', token, user: userInfo });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const updateUserExtraInfo = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            bio,
            website,
            facebook,
            instagram,
            twitter,
            linkedin,
            addressLine1,
            addressLine2,
            country,
            state,
            city,
            zipCode,
            userId
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                name: firstName,
                lastName,
                bio,
                website,
                'socialLinks.facebook': facebook,
                'socialLinks.instagram': instagram,
                'socialLinks.twitter': twitter,
                'socialLinks.linkedin': linkedin,
                'address.addressLine1': addressLine1,
                'address.addressLine2': addressLine2,
                'address.country': country,
                'address.state': state,
                'address.city': city,
                'address.zipCode': zipCode,
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password, otp, updatedAt, ...safeUser } = updatedUser.toObject();
        res.status(200).json({ message: 'User info updated successfully', user: safeUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updatePhoneNumber = async (req, res) => {
    try {
        const { userId, newPhoneNumber } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { phone: newPhoneNumber },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Phone number updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error during password update:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateProfileImg = async (req, res) => {
    const { userId } = req.body;

    try {
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }


        if (req.file) {
            user.profileImage = req.file.path;
        }

        await user.save();

        return res.status(200).json({ message: 'Profile image updated successfully.', profileImage: user.profileImage });
    } catch (error) {
        console.error('Error during profile image update:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}

const fetchUserInfo = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId, '-password -otp') 
            .populate('followers', 'name email') 
            .populate('following', 'name email'); 
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userInfo = {
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            isVerified: user.isVerified,
            profileImage: user.profileImage,
            bio: user.bio,
            website: user.website,
            socialLinks: user.socialLinks,
            address: user.address,
            eventsHosted: user.eventsHosted,
            followers: user.followers.length,
            following: user.following.length,
            createdAt:user.createdAt,
        };

        res.status(200).json(userInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { sendOtpEmail, verifyOtpEmail, signUp, login, updateEmail, sendOtpToUpdateEmail, updateUserExtraInfo, updatePhoneNumber, updatePassword, updateProfileImg , fetchUserInfo };
