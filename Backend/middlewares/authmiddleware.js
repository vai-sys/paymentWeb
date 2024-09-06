const JWT_SECRET = require("../config").JWT_SECRET;
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error("JWT verification error:", error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ message: "Invalid token" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { authMiddleware };
