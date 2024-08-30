// config.js
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'khdkjahskdbzmcbkjs';

console.log('JWT_SECRET loaded:', JWT_SECRET); 

module.exports = { JWT_SECRET };