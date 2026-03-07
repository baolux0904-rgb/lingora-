const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");

// GET /api/v1/courses
router.get("/", courseController.getCourses);

// GET /api/v1/courses/:courseId
router.get("/:courseId", courseController.getCourseById);

module.exports = router;
