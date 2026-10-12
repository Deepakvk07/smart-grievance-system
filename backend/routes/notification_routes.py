from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import citizen_required, admin_required

notification_bp = Blueprint('notification_bp', __name__)

@notification_bp.route('/api/notifications', methods=['GET'])
@citizen_required
def get_citizen_notifications():
    user_id = request.current_user['id']
    conn = get_db_connection()

    notifications = conn.execute('''
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY id DESC
    ''', (user_id,)).fetchall()

    unread_count = conn.execute('''
        SELECT COUNT(*) as unread 
        FROM notifications 
        WHERE user_id = ? AND is_read = 0
    ''', (user_id,)).fetchone()['unread']

    conn.close()

    return jsonify({
        'success': True,
        'notifications': [dict(n) for n in notifications],
        'unread_count': unread_count
    }), 200

@notification_bp.route('/api/notifications/<int:notif_id>/read', methods=['PUT'])
@citizen_required
def mark_notification_read(notif_id):
    user_id = request.current_user['id']
    conn = get_db_connection()

    conn.execute('''
        UPDATE notifications 
        SET is_read = 1 
        WHERE id = ? AND user_id = ?
    ''', (notif_id, user_id))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Notification marked as read.'}), 200

@notification_bp.route('/api/notifications/read-all', methods=['PUT'])
@citizen_required
def mark_all_read():
    user_id = request.current_user['id']
    conn = get_db_connection()

    conn.execute('''
        UPDATE notifications 
        SET is_read = 1 
        WHERE user_id = ?
    ''', (user_id,))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'All notifications marked as read.'}), 200

@notification_bp.route('/api/admin/notifications', methods=['GET'])
@admin_required
def get_admin_notifications():
    conn = get_db_connection()
    # High priority or recent unresolved complaints requiring admin action
    urgent_alerts = conn.execute('''
        SELECT complaint_id, title, category, priority, status, location, created_at
        FROM complaints
        WHERE priority = 'High' AND status != 'Resolved'
        ORDER BY id DESC
        LIMIT 10
    ''').fetchall()
    conn.close()

    formatted = []
    for alert in urgent_alerts:
        formatted.append({
            'complaint_id': alert['complaint_id'],
            'title': alert['title'],
            'message': f"Critical {alert['category']} hazard reported at {alert['location']}. Status: {alert['status']}.",
            'priority': alert['priority'],
            'created_at': alert['created_at']
        })

    return jsonify({
        'success': True,
        'alerts': formatted,
        'count': len(formatted)
    }), 200
