  const courseRepository = require("../repositories/courseRepository");

/**
 * Return all courses (summary only).
 */
async function getCourses() {
  return courseRepository.getCourses();
}

/**
 * Return a single course with its nested units → lessons.
 * Returns null when the course does not exist.
 */
async function getCourseById(courseId) {
  const course = await courseRepository.getCourseById(courseId);
  if (!course) return null;

  const units = await courseRepository.getUnitsByCourseId(courseId);
  return { ...course, units };
}

module.exports = { getCourses, getCourseById };
