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

    // HTML template for the ticket
    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 50px; }
          .ticket { border: 2px solid #333; padding: 20px; width: 600px; margin: auto; background-color: #fff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
          h1 { text-align: center; color: #ff6347; }
          .event-details, .user-details { margin-bottom: 20px; }
          .event-details p, .user-details p { margin: 5px 0; font-size: 16px; line-height: 1.5; }
          .qr-code { text-align: center; margin: 20px 0; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="ticket">
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
    const options = { format: 'A4', border: '10mm' };

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
