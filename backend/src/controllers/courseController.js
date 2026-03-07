const courseService = require("../services/courseService");

/**
 * GET /api/v1/courses
 */
async function getCourses(req, res) {
  try {
    const courses = await courseService.getCourses();
    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("[courseController] getCourses:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * GET /api/v1/courses/:courseId
 */
async function getCourseById(req, res) {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await courseService.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("[courseController] getCourseById:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { getCourses, getCourseById };
