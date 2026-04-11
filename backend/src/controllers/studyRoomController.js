/**
 * controllers/studyRoomController.js
 *
 * HTTP layer for study rooms.
 */

const studyRoomService = require("../services/studyRoomService");
const studyRoomRepo = require("../repositories/studyRoomRepository");
const { sendSuccess, sendError } = require("../response");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function createRoom(req, res, next) {
  try {
    const { name, invitedUserIds, goalType, targetValue, maxMembers } = req.body;
    if (!name) return sendError(res, { status: 400, message: "name is required" });
    const result = await studyRoomService.createRoom(req.user.id, { name, invitedUserIds, goalType, targetValue, maxMembers });
    return sendSuccess(res, { data: result, status: 201, message: "Room created" });
  } catch (err) { next(err); }
}

async function getMyRooms(req, res, next) {
  try {
    const rooms = await studyRoomService.getMyRooms(req.user.id);
    return sendSuccess(res, { data: { rooms }, message: "Rooms retrieved" });
  } catch (err) { next(err); }
}

async function getDashboard(req, res, next) {
  try {
    const { roomId } = req.params;
    if (!UUID_RE.test(roomId)) return sendError(res, { status: 400, message: "Valid roomId required" });
    const dashboard = await studyRoomService.getRoomDashboard(roomId, req.user.id);
    return sendSuccess(res, { data: dashboard, message: "Dashboard retrieved" });
  } catch (err) { next(err); }
}

async function acceptInvite(req, res, next) {
  try {
    const { roomId } = req.params;
    if (!UUID_RE.test(roomId)) return sendError(res, { status: 400, message: "Valid roomId required" });
    await studyRoomService.acceptInvite(roomId, req.user.id);
    return sendSuccess(res, { message: "Invite accepted" });
  } catch (err) { next(err); }
}

async function leaveRoom(req, res, next) {
  try {
    const { roomId } = req.params;
    if (!UUID_RE.test(roomId)) return sendError(res, { status: 400, message: "Valid roomId required" });
    await studyRoomService.leaveRoom(roomId, req.user.id);
    return sendSuccess(res, { message: "Left room" });
  } catch (err) { next(err); }
}

async function createGoal(req, res, next) {
  try {
    const { roomId } = req.params;
    if (!UUID_RE.test(roomId)) return sendError(res, { status: 400, message: "Valid roomId required" });
    const { goalType, targetValue, startDate, endDate } = req.body;
    if (!goalType || !targetValue) return sendError(res, { status: 400, message: "goalType and targetValue required" });
    const goal = await studyRoomService.createGoal(roomId, req.user.id, { goalType, targetValue, startDate, endDate });
    return sendSuccess(res, { data: goal, status: 201, message: "Goal created" });
  } catch (err) { next(err); }
}

async function getNotes(req, res, next) {
  try {
    const { roomId } = req.params;
    if (!UUID_RE.test(roomId)) return sendError(res, { status: 400, message: "Valid roomId required" });
    const notes = await studyRoomRepo.getRoomNotes(roomId);
    return sendSuccess(res, { data: { notes }, message: "Notes retrieved" });
  } catch (err) { next(err); }
}

async function createNote(req, res, next) {
  try {
    const { roomId } = req.params;
    if (!UUID_RE.test(roomId)) return sendError(res, { status: 400, message: "Valid roomId required" });
    const { noteType, content } = req.body;
    if (!noteType || !content) return sendError(res, { status: 400, message: "noteType and content required" });
    const note = await studyRoomService.createNote(roomId, req.user.id, { noteType, content });
    return sendSuccess(res, { data: note, status: 201, message: "Note created" });
  } catch (err) { next(err); }
}

async function deleteNote(req, res, next) {
  try {
    const { noteId } = req.params;
    if (!UUID_RE.test(noteId)) return sendError(res, { status: 400, message: "Valid noteId required" });
    await studyRoomService.deleteNote(noteId, req.user.id);
    return sendSuccess(res, { message: "Note deleted" });
  } catch (err) { next(err); }
}

async function pinNote(req, res, next) {
  try {
    const { roomId, noteId } = req.params;
    if (!UUID_RE.test(roomId) || !UUID_RE.test(noteId)) return sendError(res, { status: 400, message: "Valid IDs required" });
    await studyRoomService.pinNoteToggle(roomId, noteId, req.user.id);
    return sendSuccess(res, { message: "Note pinned" });
  } catch (err) { next(err); }
}

async function getFeed(req, res, next) {
  try {
    const { roomId } = req.params;
    if (!UUID_RE.test(roomId)) return sendError(res, { status: 400, message: "Valid roomId required" });
    const feed = await studyRoomRepo.getRoomFeed(roomId);
    return sendSuccess(res, { data: { feed }, message: "Feed retrieved" });
  } catch (err) { next(err); }
}

async function sendNudge(req, res, next) {
  try {
    const { roomId } = req.params;
    const { targetUserId } = req.body;
    if (!UUID_RE.test(roomId) || !targetUserId) return sendError(res, { status: 400, message: "roomId and targetUserId required" });
    await studyRoomService.sendNudge(roomId, req.user.id, targetUserId);
    return sendSuccess(res, { message: "Nudge sent" });
  } catch (err) { next(err); }
}

module.exports = {
  createRoom, getMyRooms, getDashboard, acceptInvite, leaveRoom,
  createGoal, getNotes, createNote, deleteNote, pinNote, getFeed, sendNudge,
};
