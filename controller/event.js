const User = require('../models/User');
const Event = require('../models/Event');


const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('userId', 'name email isVerified lastName profileImage');;
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

const SaveAttendedEvents = async (req, res) => {
  try {
    
    const event = await Event.findById(req.params.eventId).populate('userId', 'name email isVerified lastName profileImage');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.eventsHosted.attendedEvents= user.eventsHosted.attendedEvents || 0;
    user.eventsHosted.attendedEvents+= 1;

    await user.save();

    res.json({
      message: 'Event attendance updated successfully',
      attendedEvents: user.attendedEvents,
      eventsHosted: user.eventsHosted,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

const createEvent = async (req, res) => {
  const {
    eventName,
    eventDesc,
    isFree,
    amount,
    meetingType,
    meetingLink,
    venueDetails,
    eventStartDate,
    eventEndDate,
    userId,
    cardDetails,
  } = req.body;
  console.log(req.body);

  const isPaidEvent = isFree === 'false';


  const eventImages = req.files;

  if (!eventStartDate || !eventEndDate || !userId) {
    return res.status(400).json({ message: 'Event start date, end date, and User ID are required.' });
  }

  // Check if it's a paid event and cardDetails is provided
  if (!isFree && (!cardDetails || !Object.keys(cardDetails).length)) {
    return res.status(400).json({ message: 'Payment method and cardDetails are required for paid events.' });
  }

  try {
    const event = await Event.create({
      userId,
      eventName,
      eventDesc,
      isFree,
      amount: !isPaidEvent ? 0 : amount,
      meetingType,
      meetingLink: meetingType === 'online' ? meetingLink : null,
      venueDetails: meetingType === 'venue' ? venueDetails : null,
      eventStartDateTime: new Date(eventStartDate),
      eventEndDateTime: new Date(eventEndDate),
      images: eventImages ? eventImages.map(file => ({
        url: file.path,
        name: file.originalname,
      })) : [],
      paymentDetails: isPaidEvent ? JSON.parse(cardDetails) : null
    });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's hosted events stats
    if (isFree) {
      user.eventsHosted.free += 1;
    } else {
      user.eventsHosted.paid += 1;
    }

    if (meetingType === 'online') {
      user.eventsHosted.online += 1;
    } else if (meetingType === 'venue') {
      user.eventsHosted.offline += 1;
    }

    user.eventsHosted.total += 1;

    await user.save();

    res.status(201).json({ event });
  } catch (error) {
    console.error('Error creating event:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};




const fetchEvents = async (req, res) => {
  try {
    const events = await Event.find({});
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const SaveEvent = async (req, res) => {
  try {
    const userId = req.params.id;
    const eventId = req.params.eventId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isEventSaved = user.savedEvents.includes(eventId);

    let updatedUser;
    if (isEventSaved) {

      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { savedEvents: eventId } },
        { new: true }
      );
      res.status(200).json({ message: 'Event removed from saved events', user: updatedUser.savedEvents.length });
    } else {

      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { savedEvents: eventId } },
        { new: true }
      );
      res.status(200).json({ message: 'Event added to saved events', user: updatedUser.savedEvents.length });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};


module.exports = { getEventDetails, createEvent, fetchEvents, SaveEvent, SaveAttendedEvents };