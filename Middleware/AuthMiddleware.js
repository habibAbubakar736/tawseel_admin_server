const jwt = require('jsonwebtoken');
const pool = require('../Config/db_pool');
require('dotenv').config();

const ValidateHeader = async (header) => {
    
    const token = header.token || header.authorization;
    const userId = header["user-id"] || header.user_id;

    if (!token) {
        return { success: false, message: "Token should not be null" };
    }

    if (!userId) {
        return { success: false, message: "Invalid Header" };
    }

    const [rows] = await pool.query(`SELECT * FROM users WHERE user_id = ?`, [userId]);
    if (rows.length === 0) {
        return { success: false, message: "User not found" };
    }

    return { success: true, user_id: userId, token };
};

exports.AdminAuth = async (req, res, next) => {
    try {
        const validate = await ValidateHeader(req.headers);
        if (!validate.success) {
            return res.json({ success: false, message: validate.message });
        }

        jwt.verify(validate.token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.json({ success: false, message: "This token has expired" });
            }
            req.decoded = decoded;
            next();
        });
    } catch (error) {
        console.error("AdminAuth error:", error);
        return res.json({ success: false, message: "Authentication failed" });
    }
};
