/**
 * routes/chatRoutes.js
 *
 * Friend chat endpoints. All routes require JWT authentication.
 */

const { Router } = require("express");
const { verifyToken } = require("../middleware/auth");
const c = require("../controllers/chatController");

const router = Router();

router.get("/conversations", verifyToken, c.getConversations);
router.get("/messages/:friendId", verifyToken, c.getMessages);
router.post("/messages/:friendId", verifyToken, c.sendTextMessage);
router.post("/voice/:friendId", verifyToken, c.sendVoiceMessage);
router.post("/messages/:friendId/seen", verifyToken, c.markSeen);
router.delete("/messages/:messageId", verifyToken, c.deleteMessage);

module.exports = router;
