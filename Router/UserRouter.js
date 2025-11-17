const express = require("express");
const router = express.Router();


const AuthMiddleware = require("../Middleware/AuthMiddleware")



/////////////////////////////// USER 'S ROUTING ///////////////////////////////
const UserController = require("../Controller/Users/UserController");
router.post("/Login", UserController.Login);
router.post("/UpdateFcmToken", UserController.UpdateFcmToken);

router.post("/CreateUser", AuthMiddleware.AdminAuth, UserController.CreateUser);
router.get("/GetUsers", AuthMiddleware.AdminAuth, UserController.GetUsers);
router.get("/GetUserInfo", AuthMiddleware.AdminAuth, UserController.GetUserInfo);
router.post("/DeleteUser", AuthMiddleware.AdminAuth, UserController.DeleteUser);

router.get("/GetCustomers", AuthMiddleware.AdminAuth, UserController.GetCustomers);

module.exports = router;