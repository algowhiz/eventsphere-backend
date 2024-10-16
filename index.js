const express = require('express');
const path = require('path')
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/event');
const ticketRoutes = require('./routes/ticket');
const connection = require('./connection')
dotenv.config();

const app = express();


app.use(cors());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
connection();

app.use('/api/auth', authRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/ticket', ticketRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
