const { query } = require("../config/db");

/**
 * Fetch all courses (summary — no units).
 */
async function getCourses() {
  const result = await query(
    `SELECT id, title, description, level, language, thumbnail_url, created_at
     FROM courses
     ORDER BY created_at ASC`
  );
  return result.rows;
}

/**
 * Fetch a single course by id.
 */
async function getCourseById(courseId) {
  const result = await query(
    `SELECT id, title, description, level, language, thumbnail_url, created_at
     FROM courses
     WHERE id = $1`,
    [courseId]
  );
  return result.rows[0] || null;
}

/**
 * Fetch all units (with their lessons) for a given course.
 */
async function getUnitsByCourseId(courseId) {
  // Fetch units
  const unitsResult = await query(
    `SELECT id, course_id, title, order_index
     FROM units
     WHERE course_id = $1
     ORDER BY order_index ASC`,
    [courseId]
  );
  const units = unitsResult.rows;

  if (units.length === 0) return [];

  const unitIds = units.map((u) => u.id);

  // Fetch lessons for all units in one query
  const lessonsResult = await query(
    `SELECT id, unit_id, title, type, order_index, xp_reward
     FROM lessons
     WHERE unit_id = ANY($1::int[])
     ORDER BY unit_id ASC, order_index ASC`,
    [unitIds]
  );

  // Group lessons into their parent unit
  const lessonsByUnit = {};
  for (const lesson of lessonsResult.rows) {
    if (!lessonsByUnit[lesson.unit_id]) lessonsByUnit[lesson.unit_id] = [];
    lessonsByUnit[lesson.unit_id].push(lesson);
  }

  return units.map((unit) => ({
    ...unit,
    lessons: lessonsByUnit[unit.id] || [],
  }));
}

module.exports = { getCourses, getCourseById, getUnitsByCourseId };
