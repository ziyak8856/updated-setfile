const express = require("express");
const { getSetFiles,getTableData,markFileAsDeleted ,updateSelectedMV,addSetfile,cloneFromAny,fetchTableDataFornew,FileDatatableSaveall,CloneFileFromsame} = require("../controllers/setfileController");

const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");



// Route to fetch setfiles by mode_id
router.get("/getSetFiles", authMiddleware,getSetFiles);
router.post("/get-table-data", authMiddleware,getTableData);
router.post("/mark-deleted",authMiddleware,markFileAsDeleted);
router.post("/update-mv",authMiddleware,updateSelectedMV);
router.post("/cloneFromAny",authMiddleware,cloneFromAny);
router.post("/fetchTableDataFornew",authMiddleware,fetchTableDataFornew);
router.post("/FileDatatableSaveall",authMiddleware,FileDatatableSaveall);
router.post("/CloneFileFromsame",authMiddleware,CloneFileFromsame)
module.exports = router;