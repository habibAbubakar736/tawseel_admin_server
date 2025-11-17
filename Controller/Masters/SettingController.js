const pool = require("../../Config/db_pool");
const { global } = require("../../Config/global");
const { PaginationQuery } = require("../Helper/QueryHelper");

exports.CreateBaseFarePrice = async (req, res) => {
    try {
        const request = req.body;

        const fields = {
            setting_base_from_km: request.setting_base_from_km,
            setting_base_to_km: request.setting_base_to_km,
            setting_base_price: request.setting_base_price,
            created_by: request.created_by,
            created_date: global.current_date,
        };

        let query, cond, message;

        if (request.setting_id) {
            query = `UPDATE settings SET ? WHERE setting_id = ?`;
            cond = [fields, request.setting_id];
            message = "Base fare price updated successfully ..."
        } else {
            query = `INSERT INTO settings SET ?`;
            cond = [fields];
            message = "Base fare price created successfully ..."
        }
        await pool.query(query, cond);

        return res.json({ success: true, message });

    } catch (error) {
        console.error("updateBaseFare error:", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};

exports.GetBaseFareInfo = async (req, res) => {
    try {
        const { setting_id } = req.query;

        if (!setting_id) {
            return res.json({ success: false, message: "setting_id is required" });
        }

        const [rows] = await pool.query(
            `SELECT * FROM settings WHERE setting_id = ?`,
            [setting_id]
        );

        if (rows.length === 0) {
            return res.json({ success: false, message: "No record found" });
        }

        return res.json({ success: true, data: rows[0] });

    } catch (error) {
        console.error("getBaseFareById error:", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};

exports.GetBaseFareList = async (req, res) => {
    try {

        const { limit, page } = req.query;

        let query_count = `SELECT COUNT(*) AS total_records FROM settings`;
        let query = `SELECT * FROM settings`

        let conditionValue = [];
        let conditionCols = [];

        query += " ORDER BY setting_id DESC";
        query += ` LIMIT ?, ?`;

        const response = await PaginationQuery(query_count, query, conditionValue, limit, page);

        return res.status(200).json(response)

    } catch (error) {
        console.error("getBaseFareList error:", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};

exports.DeleteBaseFarePrice = async (req, res) => {
    try {

        const { setting_id } = req.body;

        if (!setting_id) return res.json({ success: false, message: "setting_id is required ... " });

        let query = `DELETE FROM settings WHERE setting_id = ?`;
        await pool.query(query, [setting_id]);

        return res.json({ success: true, message: "Base fare price deleted csuccessfully ... " });

    } catch (error) {
        console.log("Delete Base fare price error : ", error)
    }
}