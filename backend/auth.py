import os
import jwt
from functools import wraps
from datetime import datetime, timedelta, timezone
from flask import request, jsonify
from database import get_db_connection

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'smart-grievance-gov-jwt-key-2026')
ALGORITHM = 'HS256'

def generate_token(user_id, role, email, name):
    payload = {
        'sub': str(user_id),
        'role': role,
        'email': email,
        'name': name,
        'exp': datetime.now(timezone.utc) + timedelta(days=7),
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception as e:
        return None

def extract_token_from_header():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    parts = auth_header.split()
    if len(parts) == 2 and parts[0].lower() == 'bearer':
        return parts[1]
    return None

def citizen_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = extract_token_from_header()
        if not token:
            return jsonify({'success': False, 'message': 'Authentication required. Missing Bearer token.'}), 401

        payload = decode_token(token)
        if not payload:
            return jsonify({'success': False, 'message': 'Invalid or expired session. Please log in again.'}), 401

        if payload.get('role') != 'citizen':
            return jsonify({'success': False, 'message': 'Access restricted to registered citizens only.'}), 403

        # Verify citizen exists and is active in database
        user_id = int(payload['sub'])
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
        conn.close()

        if not user:
            return jsonify({'success': False, 'message': 'Citizen account not found.'}), 401
        if user['status'] != 'active':
            return jsonify({'success': False, 'message': 'Your account has been deactivated. Please contact municipal support.'}), 403

        request.current_user = dict(user)
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = extract_token_from_header()
        if not token:
            return jsonify({'success': False, 'message': 'Authentication required. Administrative access token missing.'}), 401

        payload = decode_token(token)
        if not payload:
            return jsonify({'success': False, 'message': 'Invalid or expired administrative session.'}), 401

        if payload.get('role') != 'admin':
            return jsonify({'success': False, 'message': 'Access Denied: Administrative privileges required. Unauthorized personnel access logged.'}), 403

        # Verify admin exists in database
        admin_id = int(payload['sub'])
        conn = get_db_connection()
        admin = conn.execute('SELECT * FROM admins WHERE id = ?', (admin_id,)).fetchone()
        conn.close()

        if not admin:
            return jsonify({'success': False, 'message': 'Administrative account not found.'}), 401

        request.current_admin = dict(admin)
        return f(*args, **kwargs)
    return decorated
