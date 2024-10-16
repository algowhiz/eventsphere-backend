const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinaryConfig');
const { sendOtpEmail, verifyOtpEmail, signUp, login, updateEmail, sendOtpToUpdateEmail, updateUserExtraInfo, updatePhoneNumber, updatePassword, fetchUserInfo, updateProfileImg } = require('../controller/auth');
const { authenticateToken } = require('../middleware/authenticateToken');


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user_images',
    format: async (req, file) => 'jpeg', 
    public_id: (req, file) => file.fieldname + '-' + Date.now(), 
  },
});
const upload = multer({ storage: storage });

router.post('/send-otp-email', sendOtpEmail);
router.post('/send-otp-to-update-email', sendOtpToUpdateEmail);
router.post('/verify-otp-email', verifyOtpEmail);
router.post('/signup', upload.single('image'), signUp);
router.post('/login', login);
router.post('/update-email', updateEmail);
router.put('/extra-user-info', updateUserExtraInfo);
router.put('/update-phone', updatePhoneNumber);
router.put('/update-password', updatePassword);
router.post('/update-profile-image', upload.single('image'), updateProfileImg);
router.get('/user/:userId', fetchUserInfo);

module.exports = router;
