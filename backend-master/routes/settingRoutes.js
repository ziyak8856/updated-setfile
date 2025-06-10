const express = require("express");
const { getSettingsByCustomer,addSetting,getTableName } = require("../controllers/settingController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:customerId", authMiddleware, getSettingsByCustomer);

router.post("/add", authMiddleware, addSetting);
router.get("/getTableName/:settingId", authMiddleware, getTableName);

module.exports = router;