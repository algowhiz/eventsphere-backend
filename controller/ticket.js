const pdf = require('html-pdf');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateTicket = async (req, res) => {
  const { eventName, eventDate, eventLocation, userName, userEmail, websiteName } = req.body;
  console.log(req.body);

  // Generate QR code data
  const qrCodeData = `
      Event: ${eventName}
      Date: ${eventDate}
      Location: ${eventLocation}
      Ticket Holder: ${userName}
      Email: ${userEmail}
    `;

  // Generate QR code
  const qrCode = await qrcode.toDataURL(qrCodeData);


  // Background image (replace with the actual URL of the background image)
  const backgroundImage = 'https://png.pngtree.com/thumb_back/fh260/background/20241001/pngtree-party-atmosphere-with-disco-ball-image_16297339.jpg';

  // HTML template for the ticket with background image and logo
  const html = `
   <html>
  <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');
      
      body {
        font-family: 'Arial', sans-serif;
        background-color: #f5f5f5;
        padding: 15px;
        color: white;
      }

      .ticket {
        border: 2px solid #333;
        padding: 8px;
        width: 100%;
        margin: auto;
        background-color: #fff;
        background-image: url('${backgroundImage}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        position: relative;
        color: white;
        page-break-inside: avoid;
      }

      h1 {
        text-align: center;
        color: white;
        font-size: 24px;
        font-family: 'Poppins', sans-serif; 
      }

      .event-details,
      .user-details {
        margin-bottom: 10px;
      }

      .event-details p,
      .user-details p {
        margin: 5px 0;
        font-size: 14px;
        line-height: 1.3;
        padding: 5px;
        color: white;
      }

      .qr-code {
        text-align: center;
        margin: 5px 0;
      }

      .footer {
        text-align: center;
        font-size: 10px;
        color: white;
        padding: 5px;
      }

      .logo {
        text-align: center;
        margin-bottom: 1px;
      }

      .logo h1 {
        font-family: 'Poppins', sans-serif;
        font-size: 36px;
        color: white;
      }
    </style>
  </head>
  <body>
    <div class="ticket">
      <div class="logo">
        <h1>ES</h1> 
      </div>
      <h1>Your Event Ticket</h1>
      <div class="event-details">
        <p><strong>Event:</strong> ${eventName}</p>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p><strong>Location:</strong> ${eventLocation}</p>
      </div>
      <div class="user-details">
        <p><strong>Ticket Holder:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
      </div>
      <div class="qr-code">
        <img src="${qrCode}" alt="QR Code" />
      </div>
      <div class="footer">
        <p>Thank you for booking with us!</p>
        <p>${websiteName}</p>
      </div>
    </div>
  </body>
</html>

  `;

  // PDF options
  const options = { format: 'A4', orientation: 'landscape', border: '10mm' };

  // Create PDF
  pdf.create(html, options).toBuffer(async (err, buffer) => {
    if (err) {
      console.error('Error generating PDF:', err);
      return res.status(500).send('Error generating ticket.');
    }

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Your Event Ticket',
      text: `Dear ${userName},\n\nYour ticket has been booked successfully! Please find your ticket attached, and you can download the PDF.\n\nBest regards,\n${websiteName}`,
      attachments: [{
        filename: 'ticket.pdf',
        content: buffer,
        contentType: 'application/pdf'
      }]
    };

    // Send the email with the PDF attachment
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending ticket email.', error });
      }
      // Respond to the client with a success message
      return res.status(200).json({ message: 'Your ticket has been booked successfully, and you can download the PDF.' });
    });
  });
};

module.exports = { generateTicket };
