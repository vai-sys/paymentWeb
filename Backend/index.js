const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

require('dotenv').config();

const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/PaymentWeb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('error', (err) => {
    console.error('Failed to connect to MongoDB:', err);
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

// Routes
const mainRoute = require('./routes/index');
app.use('/api/v1', mainRoute);


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});