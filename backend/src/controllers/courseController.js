/**
 * controllers/courseController.js
 *
 * HTTP layer for course endpoints.
 *
 * Rules for this layer:
 *  - Reads from req, writes to res — nothing else.
 *  - Validates and sanitises incoming request data before passing to service.
 *  - Delegates all logic to courseService.
 *  - Passes unexpected errors to next() so errorMiddleware handles them.
 *  - Uses sendSuccess() so the response envelope matches all other endpoints.
 */

const courseService = require("../services/courseService");
const { sendSuccess } = require("../response");

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/courses
 *
 * Returns an array of course summaries (no units).
 */
async function getCourses(req, res, next) {
  try {
    const courses = await courseService.getCourses();
    return sendSuccess(res, {
      data: courses,
      message: "Courses retrieved successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/courses/:courseId
 *
 * Returns a single course with its nested units → lessons.
 * Responds 400 if :courseId is not a valid integer.
 * Responds 404 if no course matches the given id.
 */
async function getCourseById(req, res, next) {
  try {
    const courseId = parseInt(req.params.courseId, 10);

    // Guard: reject non-integer values before hitting the DB.
    if (isNaN(courseId)) {
      const err = new Error("Invalid course ID. Expected an integer.");
      err.status = 400;
      return next(err);
    }

    const course = await courseService.getCourseById(courseId);

    if (!course) {
      const err = new Error(`Course not found: ${courseId}`);
      err.status = 404;
      return next(err);
    }

    return sendSuccess(res, {
      data: course,
      message: "Course retrieved successfully",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCourses, getCourseById };
