/**
 * services/firebaseService.js — Firebase Realtime DB notifications
 */
const { getFirebaseAdmin, getFirebaseDB } = require('../config/firebase');
const logger = require('../utils/logger');

/**
 * Write a notification to Firebase RTDB for a user.
 * Frontend listens on /notifications/{userId} for real-time updates.
 */
async function saveRealtimeNotification({ userId, title, body, type = 'info', category = 'system', actionUrl }) {
  try {
    const db = getFirebaseDB();
    if (!db) return; // Firebase not configured

    const ref = db.ref(`notifications/${userId}`);
    await ref.push({
      title,
      body,
      type,
      category,
      actionUrl: actionUrl || null,
      isRead:    false,
      createdAt: Date.now(),
    });

    logger.debug(`Firebase notification saved for user ${userId}: ${title}`);
  } catch (err) {
    logger.warn('Firebase notification failed:', err.message);
  }
}

/**
 * Send an FCM push notification to a topic (e.g. dept_1) or device token.
 */
async function sendNotification({ topic, token, title, body, data = {} }) {
  try {
    const admin = getFirebaseAdmin();
    if (!admin) return;

    const message = {
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    };

    if (topic) message.topic = topic;
    else if (token) message.token = token;
    else return;

    const response = await admin.messaging().send(message);
    logger.info(`FCM notification sent: ${response}`);
    return response;
  } catch (err) {
    logger.warn('FCM notification failed:', err.message);
  }
}

/**
 * Mark all notifications as read for a user in RTDB.
 */
async function markAllRead(userId) {
  try {
    const db = getFirebaseDB();
    if (!db) return;

    const ref  = db.ref(`notifications/${userId}`);
    const snap = await ref.get();
    if (!snap.exists()) return;

    const updates = {};
    snap.forEach((child) => {
      if (!child.val().isRead) {
        updates[`${child.key}/isRead`] = true;
        updates[`${child.key}/readAt`] = Date.now();
      }
    });

    if (Object.keys(updates).length) await ref.update(updates);
  } catch (err) {
    logger.warn('markAllRead failed:', err.message);
  }
}

module.exports = { saveRealtimeNotification, sendNotification, markAllRead };
