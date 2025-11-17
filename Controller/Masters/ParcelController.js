const pool = require("../../Config/db_pool")
const { global } = require("../../Config/global");
const { PaginationQuery } = require("../Helper/QueryHelper");

exports.CreateParcel = async (req, res) => {
    try {
        const request = req.body;

        let fields = {
            parcel_size_title: request.parcel_size_title,
            parcel_size_description: request.parcel_size_description,
            parcel_charges: request.parcel_charges,
            fragile_charges: request.fragile_charges,
            created_by: request.created_by,
            created_date: global.current_date,
        };

        let query, message, cond;

        if (request.parcel_id) {
            query = `UPDATE parcel_sizes SET ? WHERE parcel_id = ?`;
            cond = [fields, request.parcel_id];
            message = "Parcel updated successfully.";
        } else {
            query = `INSERT INTO parcel_sizes SET ?`;
            cond = [fields];
            message = "Parcel created successfully.";
        }

        await pool.query(query, cond);

        return res.json({ success: true, message });
    } catch (error) {
        console.error("Error in CreatePercel:", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};


exports.GetParcels = async (req, res) => {
    try {
        let query_count = `SELECT COUNT(*) as total_records FROM parcel_sizes`

        let query = `SELECT * FROM parcel_sizes`;

        let conditionValue = [];
        let conditionCols = [];

        if (req.query.keyword) {
            conditionCols.push(`parcel_sizes.parcel_size_title LIKE ?`);
            conditionValue.push(`%${req.query.keyword}%`);
        }

        query += ` ORDER BY parcel_id DESC`;
        query += ` LIMIT ?, ?`;

        const response = await PaginationQuery(query_count, query, conditionValue, req.query.limit, req.query.page);

        return res.status(200).json(response)

    } catch (error) {
        console.error("Error in GetParcels:", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};


exports.GetParcelInfo = async (req, res) => {
    try {
        const { parcel_id } = req.query;

        if (!parcel_id) {
            return res.json({ success: false, message: "Parcel ID is required." });
        }

        const query = `SELECT * FROM parcel_sizes WHERE parcel_id = ? LIMIT 1`;
        const [rows] = await pool.query(query, [parcel_id]);

        if (rows.length === 0) {
            return res.json({ success: false, message: "Parcel not found." });
        }

        return res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Error in GetParcelInfo:", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};

exports.DeleteParcel = async (req, res) => {
    try {
        const { parcel_id } = req.body;


        console.log("Called",);
        console.log("parcel_id ===>", parcel_id);

        if (!parcel_id) {
            return res.json({ success: false, message: "Parcel ID is required." });
        }

        const query = `DELETE FROM parcel_sizes WHERE parcel_id = ?`;
        const [result] = await pool.query(query, [parcel_id]);

        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "Parcel not found or already deleted." });
        }

        return res.json({ success: true, message: "Parcel deleted successfully." });
    } catch (error) {
        console.error("Error in DeleteParcel:", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};
