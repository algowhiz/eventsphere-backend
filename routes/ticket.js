const express = require('express');
const router = express.Router();
const {generateTicket} = require('../controller/ticket')


router.post('/generate-ticket', generateTicket);


module.exports = router;
