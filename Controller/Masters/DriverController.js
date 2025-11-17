const pool = require("../../Config/db_pool")
const { global } = require("../../Config/global");
const { PaginationQuery } = require("../Helper/QueryHelper");
const { FormFileData } = require("../Helper/Utils");

const AddDriver = async (req, request) => {
    try {
        let fields = {
            driver_name: request.driver_name,
            driver_mobile_number: request.driver_mobile_number,
            driver_email_address: request.driver_email_address,
            created_date: global.current_date,
        };

        if (req.file) {
            fields.driver_picture = req.file.filename;
        }

        let query, message, cond;

        if (request.driver_id) {
            query = "UPDATE drivers SET ? WHERE driver_id = ?";
            cond = [fields, request.driver_id];
            message = "Driver updated successfully.";
        } else {
            if (!req.file) {
                return { success: false, message: "Please upload driver image." };
            }
            query = "INSERT INTO drivers SET ?";
            cond = [fields];
            message = "Driver created successfully.";
        }

        await pool.query(query, cond);

        return { success: true, message };
    } catch (error) {
        console.error("Error in AddDriver:", error);
        return { success: false, message: "Internal server error", error };
    }
};

exports.CreateDriver = async (req, res) => {
    try {

        const todayDate = new Date().toISOString().slice(0, 10);
        const randomNumber = Math.floor(Math.random() * 1000);

        const { upload } = FormFileData(`Driver/`, 'driver_picture', `driver_picture_${todayDate}_${randomNumber}`);

        upload(req, res, async (err) => {
            if (err) {
                console.error("Error uploading document:", err);
                return res.status(500).json({ success: false, message: 'Document upload failed' });
            } else {
                var response = await AddDriver(req, req.body);
                return res.status(200).json(response);
            }
        });


    } catch (error) {
        console.log("error", error)
        return res.json({ success: false, message: "Internal server error", error })
    }
}


exports.GetDrivers = async (req, res) => {
    try {

        let query_count = `SELECT COUNT(*) as total_records FROM drivers`

        let query = `
            SELECT *,
            CONCAT('${global.base_server_file_url}public/Driver/', driver_picture) AS driver_picture_url
            FROM drivers
        `;

        let conditionValue = [];
        let conditionCols = [];

        if (req.query.keyword) {
            conditionCols.push(`drivers.driver_name LIKE ?`);
            conditionValue.push(`%${req.query.keyword}%`);
        }


        query += " ORDER BY driver_id DESC";
        query += ` LIMIT ?, ?`;

        const response = await PaginationQuery(query_count, query, conditionValue, req.query.limit, req.query.page);

        return res.status(200).json(response)

    } catch (error) {
        console.error("Error in GetDrivers:", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};

exports.GetDriverInfo = async (req, res) => {
    try {
        const { driver_id } = req.query;

        if (!driver_id) {
            return res.json({ success: false, message: "Driver ID is required." });
        }

        const query = `
            SELECT *,
            CONCAT('${global.base_server_file_url}public/Driver/', driver_picture) AS driver_picture_url
            FROM drivers WHERE driver_id = ?
        `;
        const [rows] = await pool.query(query, [driver_id]);

        if (rows.length === 0) {
            return res.json({ success: false, message: "Driver not found." });
        }

        return res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Error in GetDriverInfo:", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};


exports.DeleteDriver = async (req, res) => {
    try {
        const { driver_id } = req.body;

        if (!driver_id) {
            return res.json({ success: false, message: "Driver ID is required." });
        }

        const query = `DELETE FROM drivers WHERE driver_id = ?`;
        const [result] = await pool.query(query, [driver_id]);

        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "Driver not found or already deleted." });
        }

        return res.json({ success: true, message: "Driver deleted successfully." });
    } catch (error) {
        console.error("Error in DeleteDriver:", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};


