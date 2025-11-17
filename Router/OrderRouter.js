const express = require("express");
const router = express.Router();

const AuthMiddleware = require("../Middleware/AuthMiddleware");

const OrderController = require("../Controller/Orders/OrderController");

router.get("/GetOrders", AuthMiddleware.AdminAuth, OrderController.GetOrders);
router.get("/GetOrderInfo", AuthMiddleware.AdminAuth, OrderController.GetOrderInfo);
router.post("/OrderAction", AuthMiddleware.AdminAuth, OrderController.OrderAction);


router.get("/GetOrderTimeLine", AuthMiddleware.AdminAuth, OrderController.GetOrderTimeLine)


router.post("/CreateComments", AuthMiddleware.AdminAuth, OrderController.CreateComments)
router.get("/GetComments", AuthMiddleware.AdminAuth, OrderController.GetComments)

module.exports = router;