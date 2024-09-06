const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const { z } = require('zod');
const User = require('../models/user');
const {Account} = require('../models/account');
const bcrypt = require('bcrypt');

const signupSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required")
});

router.post('/signup', async (req, res) => {
    try {
      
        const result = signupSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ message: "Incorrect inputs", errors: result.error.errors });
        }

        const { username, password, firstName, lastName } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const dbUser = await User.create({
            username,
            password: hashedPassword,
            firstName,
            lastName
        });

        const token = jwt.sign({ userId: dbUser._id }, JWT_SECRET, { expiresIn: '1h' });
        console.log("token",token);

        await Account.create({ userId: dbUser._id, balance: 1 + Math.random() * 10000 });

        res.json({ message: "User created successfully", token });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

router.get('/bulk', async (req, res) => {
    try {
        const filter = req.query.filter || "";
        const users = await User.find({
            $or: [
                { firstName: { "$regex": filter, "$options": "i" } },
                { lastName: { "$regex": filter, "$options": "i" } }
            ]
        });
        res.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
