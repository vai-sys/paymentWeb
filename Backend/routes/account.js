// const express = require('express');
// const { authMiddleware } = require('../middlewares/authmiddleware');
// const { Account } = require('../models/account');
// const mongoose = require('mongoose');

// const router = express.Router();

// router.get("/balance", authMiddleware, async (req, res) => {
//     try {
//         const account = await Account.findOne({ userId: req.userId });
//         if (!account) {
//             return res.status(404).json({ message: "Account not found" });
//         }
//         res.json({ balance: account.balance });
//     } catch (error) {
//         console.error("Error fetching balance:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

// router.post("/transfer", authMiddleware, async (req, res) => {
//     const session = await mongoose.startSession();
//     try {
//         session.startTransaction();
//         const { amount, to } = req.body;

//         const fromAccount = await Account.findOne({ userId: req.userId }).session(session);
//         const toAccount = await Account.findOne({ userId: to }).session(session);

//         if (!fromAccount || fromAccount.balance < amount) {
//             throw new Error("Insufficient balance");
//         }
//         if (!toAccount) {
//             throw new Error("Invalid recipient account");
//         }

//         await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
//         await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

//         await session.commitTransaction();
//         res.json({ message: "Transfer successful" });
//     } catch (error) {
//         await session.abortTransaction();
//         console.error("Transfer error:", error);
//         res.status(400).json({ message: error.message });
//     } finally {
//         session.endSession();
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const { z } = require('zod');
const User = require('../models/user');
const { Account } = require('../models/account'); // Ensure this import is correct
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

        // Ensure Account.create is a valid function
        const newAccount = await Account.create({ userId: dbUser._id, balance: 1 + Math.random() * 10000 });

        res.json({ message: "User created successfully", token });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

module.exports = router;

