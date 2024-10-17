const express = require('express');
const router = express.Router();
const { getEventDetails, fetchEvents, createEvent, SaveEvent, SaveAttendedEvents } = require('../controller/event');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinaryConfig');
const { authenticateToken } = require('../middleware/authenticateToken');

// Multer configuration 
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'event_images',
    format: async (req, file) => 'jpeg',
    public_id: (req, file) => file.fieldname + '-' + Date.now(),
  },
});
const upload = multer({ storage: storage });

router.post('/events', authenticateToken, upload.array('images'), createEvent);
router.get('/events-fetch', fetchEvents);
router.get('/:id', authenticateToken, getEventDetails);
router.get('/saveEvent/:eventId/:id', SaveEvent);
router.get('/saveattendedevents/:eventId/:id', SaveAttendedEvents);

module.exports = router;