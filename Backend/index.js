const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

require('dotenv').config();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/PaymentWeb')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB:', err));

const mainRoute = require('./routes/index');
app.use('/api/v1', mainRoute);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
