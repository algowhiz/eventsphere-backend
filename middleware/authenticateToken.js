const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401);  // Return early after rendering
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        console.log("Token not provided.");
        return res.status(403);  // Return early after rendering
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("Token is invalid or expired.");
            return res.status(403);  // Return early after rendering
        }
        req.user = user;
        next();  // Proceed to the next middleware/route handler
    });
};

module.exports = { authenticateToken };
