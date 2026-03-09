/**
 * routes/index.js
 *
 * Central barrel that re-exports every route module.
 * app.js can either import individual routers directly or use this file
 * as a single mount point for all versioned routes.
 *
 * NOTE: This file previously contained a copy of config/index.js by mistake
 *       and was not imported anywhere. That content has been replaced with the
 *       correct route exports.
 */

const lessonRoutes = require("./lessonRoutes");
const courseRoutes = require("./courseRoutes");

module.exports = {
  lessonRoutes,
  courseRoutes,
};
