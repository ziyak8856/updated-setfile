const express = require("express");
const { getSetFiles,getTableData,addRow,updateMultipleRows,deleteallRow,markFileAsDeleted ,updateSelectedMV,addSetfile,clonesetfile} = require("../controllers/setfileController");

const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");


// Route to fetch setfiles by mode_id
router.get("/getSetFiles", authMiddleware,getSetFiles);
router.post("/get-table-data", authMiddleware,getTableData);
router.post("/add-row", authMiddleware,addRow);
router.post("/update-row", authMiddleware,updateMultipleRows);
router.post("/delete-row", authMiddleware,deleteallRow); 
router.post("/mark-deleted",authMiddleware,markFileAsDeleted);
router.post("/update-mv",authMiddleware,updateSelectedMV);
router.post("/clone-from",authMiddleware,clonesetfile);
router.post("/add-setfile",authMiddleware,addSetfile);
module.exports = router;