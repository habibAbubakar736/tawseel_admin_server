const express = require("express");
const router = express.Router();

const AuthMiddleware = require("../Middleware/AuthMiddleware")

/////////////////////////////// DRIVER 'S ROUTING ///////////////////////////////
const DriverController = require("../Controller/Masters/DriverController");
router.post("/CreateDriver", AuthMiddleware.AdminAuth, DriverController.CreateDriver);
router.get("/GetDrivers", AuthMiddleware.AdminAuth, DriverController.GetDrivers);
router.get("/GetDriverInfo", AuthMiddleware.AdminAuth, DriverController.GetDriverInfo);
router.post("/DeleteDriver", AuthMiddleware.AdminAuth, DriverController.DeleteDriver);

/////////////////////////////// DRIVER 'S ROUTING ///////////////////////////////
const ParcelController = require("../Controller/Masters/ParcelController");
router.post("/CreateParcel", AuthMiddleware.AdminAuth, ParcelController.CreateParcel);
router.get("/GetParcels", AuthMiddleware.AdminAuth, ParcelController.GetParcels);
router.get("/GetParcelInfo", AuthMiddleware.AdminAuth, ParcelController.GetParcelInfo);
router.post("/DeleteParcel", AuthMiddleware.AdminAuth, ParcelController.DeleteParcel);

/////////////////////////////// SETTING 'S ROUTING ///////////////////////////////
const SettingController = require("../Controller/Masters/SettingController");
router.post("/CreateBaseFarePrice", AuthMiddleware.AdminAuth, SettingController.CreateBaseFarePrice);
router.get("/GetBaseFareList", AuthMiddleware.AdminAuth, SettingController.GetBaseFareList);
router.get("/GetBaseFareInfo", AuthMiddleware.AdminAuth, SettingController.GetBaseFareInfo);
router.post("/DeleteBaseFarePrice", AuthMiddleware.AdminAuth, SettingController.DeleteBaseFarePrice);

module.exports = router;