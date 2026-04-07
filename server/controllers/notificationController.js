/**
 * controllers/notificationController.js
 * Manage in-app notifications
 */
const { query }  = require('../config/db')
const { AppError } = require('../middleware/errorHandler')
const { markAllRead: fbMarkAllRead } = require('../services/firebaseService')

// GET /api/notifications — get user notifications
async function getNotifications(req, res, next) {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const conditions = ['user_id = ?']
    const params     = [req.user.id]
    if (unreadOnly === 'true') { conditions.push('is_read = FALSE') }

    const rows = await query(
      `SELECT * FROM notifications WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )
    const [{ total }] = await query(
      `SELECT COUNT(*) AS total FROM notifications WHERE ${conditions.join(' AND ')}`,
      params
    )
    const [{ unread }] = await query(
      `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = FALSE`,
      [req.user.id]
    )

    res.json({ success: true, data: { rows, total, unread } })
  } catch (err) { next(err) }
}

// PATCH /api/notifications/:id/read
async function markRead(req, res, next) {
  try {
    await query(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    )
    res.json({ success: true, message: 'Notification marked as read' })
  } catch (err) { next(err) }
}

// PATCH /api/notifications/read-all
async function markAllReadDB(req, res, next) {
  try {
    await query(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE`,
      [req.user.id]
    )
    await fbMarkAllRead(req.user.id).catch(() => {})
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (err) { next(err) }
}

// DELETE /api/notifications/:id
async function deleteNotification(req, res, next) {
  try {
    await query(`DELETE FROM notifications WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id])
    res.json({ success: true, message: 'Notification deleted' })
  } catch (err) { next(err) }
}

module.exports = { getNotifications, markRead, markAllReadDB, deleteNotification }
