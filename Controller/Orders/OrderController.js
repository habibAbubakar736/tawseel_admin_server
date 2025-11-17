const pool = require("../../Config/db_pool");
const { PaginationQuery } = require("../Helper/QueryHelper");
const { statusOptions, global } = require("../../Config/global")

exports.GetOrders = async (req, res) => {
    try {
        const { page, limit } = req.query;

        let query_count = `
      SELECT COUNT(DISTINCT orders.order_id) as total_records
      FROM orders
      LEFT JOIN customers ON orders.customer_id = customers.customer_id
      LEFT JOIN parcel_sizes ON orders.parcel_size_id = parcel_sizes.parcel_id
      LEFT JOIN orders__items ON orders.order_id = orders__items.order_id
    `;

        let query = `
      SELECT 
        orders.*,
        customers.*,
        parcel_sizes.*,
        SUM( (orders__items.order_item_charges + orders__items.order_item_fragile_charges) * orders__items.order_item_qty ) AS order_item_grand_total
      FROM orders
      LEFT JOIN customers ON orders.customer_id = customers.customer_id
      LEFT JOIN parcel_sizes ON orders.parcel_size_id = parcel_sizes.parcel_id
      LEFT JOIN orders__items ON orders.order_id = orders__items.order_id
      GROUP BY orders.order_id
      ORDER BY orders.order_id DESC
      LIMIT ?, ?
    `;

        let conditionValue = [];
        const response = await PaginationQuery(query_count, query, conditionValue, limit, page);

        return res.status(200).json(response);

    } catch (error) {
        console.error("Error in Orders : ", error);
        return res.json({ success: false, message: "Internal server error", error });
    }
};


exports.GetOrderInfo = async (req, res) => {
    try {
        const { order_id } = req.query;

        if (!order_id) {
            return res.status(400).json({ success: false, message: "order_id is required" });
        }

        // Get order + customer details
        let query = `
      SELECT * FROM orders 
      LEFT JOIN customers ON orders.customer_id = customers.customer_id
      WHERE orders.order_id = ?`;
        const [result] = await pool.query(query, [order_id]);

        if (!result.length) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Get order items
        let sub_query = `SELECT * FROM orders__items WHERE order_id = ?`;
        const [rows] = await pool.query(sub_query, [order_id]);

        // Get grand total
        let total_query = `
            SELECT SUM( (order_item_charges + order_item_fragile_charges) * order_item_qty ) AS order_item_grand_total
            FROM orders__items WHERE order_id = ?`;
        const [totalRows] = await pool.query(total_query, [order_id]);

        return res.json({
            success: true,
            order: result[0],
            items: rows,
            grand_total: totalRows[0]?.order_item_grand_total || 0
        });

    } catch (error) {
        console.error("error", error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
};


exports.OrderAction = async (req, res) => {
    try {
        const { order_id, remark, status, action_by, user_id } = req.body;

        if (!order_id || !status) {
            return res.status(400).json({ success: false, message: "order_id and status are required" });
        }

        // Define mapping for remark/user assignment based on status
        const remarkColumns = {
            "1": { column: "order_accepted_remark", value: remark },
            "2": { column: "order_assigned_to", value: user_id },
            "3": { column: "order_picked_remark", value: remark },
            "4": { column: "order_delivered_remark", value: remark },
            "5": { column: "order_canceled_remark", value: remark },
        };

        // Build update query
        let updateQuery = `UPDATE orders SET order_status = ?`;
        const updateValues = [status];

        if (remarkColumns[status]) {
            updateQuery += `, ${remarkColumns[status].column} = ?`;
            updateValues.push(remarkColumns[status].value);
        }

        updateQuery += ` WHERE order_id = ?`;
        updateValues.push(order_id);

        // Execute update
        await pool.query(updateQuery, updateValues);

        const selectedStatus = statusOptions.find(option => option.value === status)?.label || "Updated";

        const timelineFields = {
            order_id,
            order_status: status,
            order_status_label: selectedStatus,
            order_status_text: remark,
            order_action_by: action_by,
            order_timeline_datetime: new Date(),
        };

        const timelineQuery = `INSERT INTO orders_timeline SET ?`;
        await pool.query(timelineQuery, [timelineFields]);

        return res.status(200).json({ success: true, message: `Order has been ${selectedStatus}` });

    } catch (error) {
        console.error("OrderAction Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
};

exports.GetOrderTimeLine = async (req, res) => {
    try {

        const { order_id } = req.query;

        if (!order_id) {
            return res.status(400).json({ success: false, message: 'Missing order_id' });
        }


        let query = `SELECT orders_timeline.*,
         users.user_name AS action_by_name
         FROM orders_timeline
         LEFT JOIN users ON orders_timeline.order_action_by = users.user_id
         WHERE orders_timeline.order_id = ?
         `

        const [rows] = await pool.query(query, [order_id]);
        return res.status(200).json({ success: true, data: rows });



    } catch (error) {
        console.error("OrderAction Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
}

exports.CreateComments = async (req, res) => {
    try {

        const request = req.body;

        let fields = {
            order_id: request.order_id,
            order_comment_text: request.order_comment_text,
            business_order_comment_by: request.business_order_comment_by,
            order_comment_date: global.current_date,
        }

        await pool.query(`INSERT INTO orders_comments SET ?`, [fields])
        return res.json({ success: true, message: "Comment added successfully..!" })

    } catch (error) {
        console.error("Create Order Comment Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
}

exports.GetComments = async (req, res) => {
    try {
        const { order_id } = req.query;

        if (!order_id) {
            return res.status(400).json({ success: false, message: "order_id is required" });
        }

        const [rows] = await pool.query(
            `SELECT *
             FROM orders_comments
             WHERE order_id = ?
             ORDER BY order_comment_id DESC`,
            [order_id]
        );

        return res.json({
            success: true,
            message: "Comments fetched successfully",
            data: rows
        });

    } catch (error) {
        console.error("Get Order Comments Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
};
