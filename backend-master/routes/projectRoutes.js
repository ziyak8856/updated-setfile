const express = require("express");
const { createFullProject, getProjects, uploadRegmap,getProjectById,getRegmap } = require("../controllers/projectController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Create a new project with file uploads
router.post("/createFullProject", authMiddleware, createFullProject);
router.post("/upload-regmap", authMiddleware, uploadRegmap);
router.get("/:projectId",authMiddleware, getProjectById);
router.get("/regmap/:projectId",authMiddleware, getRegmap);

// Get all projects
router.get("/", getProjects);

module.exports = router;