/**
 * services/studyRoomService.js
 *
 * Business logic for study rooms: creation, invites, goals, notes, activity tracking.
 */

"use strict";

const repo = require("../repositories/studyRoomRepository");
const socialRepo = require("../repositories/socialRepository");

// ---------------------------------------------------------------------------
// Room CRUD
// ---------------------------------------------------------------------------

async function createRoom(userId, { name, invitedUserIds = [], goalType, targetValue, maxMembers = 10 }) {
  if (!name || !name.trim()) {
    const err = new Error("Room name is required");
    err.status = 400;
    throw err;
  }

  const room = await repo.createRoom(name.trim(), userId, maxMembers);

  // Add creator as owner (active)
  await repo.addMember(room.id, userId, "owner", "active");

  // Invite friends
  for (const friendId of invitedUserIds.slice(0, maxMembers - 1)) {
    try {
      await repo.addMember(room.id, friendId, "member", "invited");
      await socialRepo.createNotification(friendId, "room_invite", {
        roomId: room.id,
        roomName: name.trim(),
        inviterName: (await socialRepo.getUserById(userId))?.name || "Someone",
      });
    } catch { /* skip invalid users */ }
  }

  // Create initial goal if provided
  let goal = null;
  if (goalType && targetValue) {
    const today = new Date().toISOString().split("T")[0];
    const endDate = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
    goal = await repo.createGoal(room.id, goalType, targetValue, today, endDate, userId);
  }

  const members = await repo.getRoomMembers(room.id);
  return { room, members, goal };
}

async function getMyRooms(userId) {
  const rooms = await repo.getUserRooms(userId);
  const enriched = await Promise.all(
    rooms.map(async (room) => {
      const [goal, members] = await Promise.all([
        repo.getActiveGoal(room.id),
        repo.getRoomMembers(room.id),
      ]);
      let goalProgress = null;
      if (goal) {
        goalProgress = await repo.getGoalProgress(goal.id);
      }
      return { ...room, activeGoal: goal, goalProgress, memberCount: members.length, members };
    })
  );
  return enriched;
}

async function getRoomDashboard(roomId, userId) {
  if (!(await repo.isRoomMember(roomId, userId))) {
    const err = new Error("Not a member of this room");
    err.status = 403;
    throw err;
  }

  const [room, members, feed, notes] = await Promise.all([
    repo.getRoomById(roomId),
    repo.getRoomMembers(roomId),
    repo.getRoomFeed(roomId, 10),
    repo.getRoomNotes(roomId, 20),
  ]);

  const activeGoalRow = await repo.getActiveGoal(roomId);
  let activeGoal = null;
  if (activeGoalRow) {
    const progress = await repo.getGoalProgress(activeGoalRow.id);
    activeGoal = { ...activeGoalRow, total_progress: progress.total, contributions: progress.contributions };
  }

  const pinnedNotes = notes.filter((n) => n.is_pinned).slice(0, 3);

  return {
    room,
    members,
    activeGoal,
    recentFeed: feed,
    pinnedNotes,
    allNotes: notes,
  };
}

// ---------------------------------------------------------------------------
// Invites & membership
// ---------------------------------------------------------------------------

async function acceptInvite(roomId, userId) {
  await repo.acceptInvite(roomId, userId);
  await repo.addActivity(roomId, userId, "member_joined");
}

async function leaveRoom(roomId, userId) {
  await repo.leaveRoom(roomId, userId);
  await repo.addActivity(roomId, userId, "member_left");
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

async function createGoal(roomId, userId, { goalType, targetValue, startDate, endDate }) {
  if (!(await repo.isRoomMember(roomId, userId))) {
    const err = new Error("Not a member");
    err.status = 403;
    throw err;
  }
  const goal = await repo.createGoal(roomId, goalType, targetValue, startDate, endDate, userId);
  await repo.addActivity(roomId, userId, "goal_created", { goalType, targetValue });
  return goal;
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

async function createNote(roomId, userId, { noteType, content }) {
  if (!(await repo.isRoomMember(roomId, userId))) {
    const err = new Error("Not a member");
    err.status = 403;
    throw err;
  }
  return repo.createNote(roomId, userId, noteType, content);
}

async function pinNoteToggle(roomId, noteId, userId) {
  if (!(await repo.isRoomOwner(roomId, userId))) {
    const err = new Error("Only room owner can pin notes");
    err.status = 403;
    throw err;
  }
  await repo.pinNote(noteId, true);
}

async function deleteNote(noteId, userId) {
  await repo.deleteNote(noteId, userId);
}

// ---------------------------------------------------------------------------
// Nudge
// ---------------------------------------------------------------------------

async function sendNudge(roomId, senderId, targetUserId) {
  if (!(await repo.isRoomMember(roomId, senderId)) || !(await repo.isRoomMember(roomId, targetUserId))) {
    const err = new Error("Both users must be room members");
    err.status = 403;
    throw err;
  }
  const sender = await socialRepo.getUserById(senderId);
  await socialRepo.createNotification(targetUserId, "room_nudge", {
    roomId,
    senderName: sender?.name || "A teammate",
  });
  await repo.addActivity(roomId, senderId, "nudge_sent", { targetUserId });
}

// ---------------------------------------------------------------------------
// Activity hook — called after user completes speaking/writing/lesson
// ---------------------------------------------------------------------------

async function onUserCompletedActivity(userId, activityType, value = 1) {
  try {
    const rooms = await repo.getUserRooms(userId);
    const today = new Date().toISOString().split("T")[0];

    for (const room of rooms) {
      // Update daily status
      const updates = {
        hasPracticed: true,
        xpToday: 0,
        speakingSessions: activityType === "speaking_sessions" ? value : 0,
        writingSessions: activityType === "writing_tasks" ? value : 0,
      };
      await repo.upsertDailyStatus(room.id, userId, today, updates);

      // Update goal contributions
      const goal = await repo.getActiveGoal(room.id);
      if (goal && goal.goal_type === activityType) {
        await repo.upsertContribution(goal.id, userId, value);

        // Check if goal completed
        const progress = await repo.getGoalProgress(goal.id);
        if (progress.total >= progress.target && goal.status === "active") {
          await repo.updateGoalStatus(goal.id, "completed");
          // Notify all members
          const members = await repo.getRoomMembers(room.id);
          for (const m of members) {
            await socialRepo.createNotification(m.user_id, "goal_completed", {
              roomName: room.name,
              goalType: goal.goal_type,
              targetValue: goal.target_value,
            });
          }
        }
      }

      // Add to activity feed
      await repo.addActivity(room.id, userId, activityType, { value });
    }
  } catch (err) {
    // Fire-and-forget: log but don't throw
    console.error("[study-room] onUserCompletedActivity error:", err.message);
  }
}

module.exports = {
  createRoom, getMyRooms, getRoomDashboard,
  acceptInvite, leaveRoom,
  createGoal, createNote, pinNoteToggle, deleteNote,
  sendNudge, onUserCompletedActivity,
};
