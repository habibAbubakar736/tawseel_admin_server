const pool = require("../../Config/db_pool")
const { global } = require("../../Config/global");
const jwt = require('jsonwebtoken');
const { PaginationQuery } = require("../Helper/QueryHelper");


exports.Login = async (req, res) => {
    try {
        const { user_login_id, user_login_password } = req.body;

        const query = `SELECT * FROM users WHERE user_login_id = ? AND user_login_password = ?`;
        const [rows] = await pool.query(query, [user_login_id, user_login_password]);

        if (rows.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }

        const token = jwt.sign(
            { user_id: rows[0].user_id },
            process.env.SECRET_KEY,
            { expiresIn: process.env.EXPIRY_TIME }
        );

        rows[0].token = token;

        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error in Login:", error);
        return res.json({ success: false, message: "Oops an error occurred!" });
    }
};


exports.CreateUser = async (req, res) => {
    try {
        const request = req.body;

        let fields = {
            user_name: request.user_name,
            user_login_id: request.user_login_id,
            user_login_password: request.user_login_password,
            created_by: request.created_by,
            created_date: global.current_date,
        };

        let query, message, cond;

        if (request.user_id) {
            query = `UPDATE users SET ? WHERE user_id = ?`;
            cond = [fields, request.user_id];
            message = "User updated successfully.";
        } else {
            query = `INSERT INTO users SET ?`;
            cond = [fields];
            message = "User created successfully.";
        }

        await pool.query(query, cond);

        return res.json({ success: true, message });

    } catch (error) {
        console.error("Error in CreateUser:", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};


exports.GetUsers = async (req, res) => {
    try {
        const { keyword } = req.query;

        let query_count = "SELECT COUNT(*) as total_records FROM users"
        let query = `SELECT * FROM users`;


        let conditionValue = [];
        let conditionCols = [];

        if (keyword) {
            conditionCols.push(`users.user_name LIKE ?`)
            conditionValue.push(`%${keyword}%`);
        }

        if (conditionCols.length > 0) {
            query += " WHERE " + conditionCols.join(" AND ");
            query_count += " WHERE " + conditionCols.join(" AND ");
        }

        query += ` ORDER BY user_id DESC`;
        query += ` LIMIT ?, ?`;


        const response = await PaginationQuery(query_count, query, conditionValue, req.query.limit, req.query.page);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error in GetUsers:", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};


exports.GetUserInfo = async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.json({ success: false, message: "User ID is required." });
        }

        const query = `SELECT * FROM users WHERE user_id = ? LIMIT 1`;
        const [rows] = await pool.query(query, [user_id]);

        if (rows.length === 0) {
            return res.json({ success: false, message: "User not found." });
        }

        return res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Error in GetUserInfo:", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};


exports.DeleteUser = async (req, res) => {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.json({ success: false, message: "User ID is required." });
        }

        const query = `DELETE FROM users WHERE user_id = ?`;
        const [result] = await pool.query(query, [user_id]);

        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "User not found or already deleted." });
        }

        return res.json({ success: true, message: "User deleted successfully." });
    } catch (error) {
        console.error("Error in DeleteUser:", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};


exports.GetCustomers = async (req, res) => {
    try {

        const { keyword, page, limit } = req.query;

        let query_count = "SELECT COUNT(*) as total_records FROM customers"
        let query = `SELECT * FROM customers`;


        let conditionValue = [];
        let conditionCols = [];

        if (keyword) {
            conditionCols.push(`customers.customer_name LIKE ?`)
            conditionValue.push(`%${keyword}%`);
        }

        if (conditionCols.length > 0) {
            query += " WHERE " + conditionCols.join(" AND ");
            query_count += " WHERE " + conditionCols.join(" AND ");
        }

        query += ` ORDER BY customers.customer_id DESC`;
        query += ` LIMIT ?, ?`;


        const response = await PaginationQuery(query_count, query, conditionValue, limit, page);
        return res.status(200).json(response);

    } catch (error) {
        console.log("error : ", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
}