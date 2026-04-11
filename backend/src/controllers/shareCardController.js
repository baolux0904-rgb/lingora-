/**
 * controllers/shareCardController.js
 */

const shareCardService = require("../services/shareCardService");
const { sendSuccess } = require("../response");

async function getPreviewData(req, res, next) {
  try {
    const stats = await shareCardService.getShareCardStats(req.user.id);
    return sendSuccess(res, { data: stats, message: "Preview data retrieved" });
  } catch (err) { next(err); }
}

async function generateCard(req, res, next) {
  try {
    const { templateKey, triggerType } = req.body;
    const card = await shareCardService.generateShareCard(req.user.id, templateKey || "weekly_grind", triggerType);
    return sendSuccess(res, { data: card, status: 201, message: "Card generated" });
  } catch (err) { next(err); }
}

async function getHistory(req, res, next) {
  try {
    const history = await shareCardService.getHistory(req.user.id);
    return sendSuccess(res, { data: { history }, message: "History retrieved" });
  } catch (err) { next(err); }
}

module.exports = { getPreviewData, generateCard, getHistory };
