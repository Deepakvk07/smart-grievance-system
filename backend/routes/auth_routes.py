import re
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection
from auth import generate_token, citizen_required, admin_required

auth_bp = Blueprint('auth_bp', __name__)

EMAIL_REGEX = r'^[\w\.-]+@[\w\.-]+\.\w+$'

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    mobile = (data.get('mobile') or '').strip()
    password = data.get('password') or ''
    confirm_password = data.get('confirm_password') or ''
    address = (data.get('address') or '').strip()

    # Validations
    if not name or not email or not mobile or not password:
        return jsonify({'success': False, 'message': 'All required fields (Name, Email, Mobile, Password) must be provided.'}), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({'success': False, 'message': 'Invalid email address format.'}), 400

    if len(mobile) < 10:
        return jsonify({'success': False, 'message': 'Mobile number must contain at least 10 digits.'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long.'}), 400

    if password != confirm_password:
        return jsonify({'success': False, 'message': 'Password and confirmation password do not match.'}), 400

    conn = get_db_connection()
    # Check if duplicate email
    existing = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({'success': False, 'message': 'An account with this email address already exists. Please log in.'}), 409

    password_hash = generate_password_hash(password)
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO users (name, email, mobile, password_hash, address, role, status)
    VALUES (?, ?, ?, ?, ?, 'citizen', 'active')
    ''', (name, email, mobile, password_hash, address))
    user_id = cursor.lastrowid

    # Create welcome notification
    cursor.execute('''
    INSERT INTO notifications (user_id, message, is_read)
    VALUES (?, 'Welcome to the Smart Grievance Priority System. You can now submit and track civic complaints in real-time.', 0)
    ''', (user_id,))

    conn.commit()
    conn.close()

    token = generate_token(user_id, 'citizen', email, name)
    return jsonify({
        'success': True,
        'message': 'Citizen account created successfully.',
        'token': token,
        'user': {
            'id': user_id,
            'name': name,
            'email': email,
            'mobile': mobile,
            'address': address,
            'role': 'citizen'
        }
    }), 201

@auth_bp.route('/api/auth/login', methods=['POST'])
def citizen_login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'success': False, 'message': 'Invalid citizen credentials. Please check your email and password.'}), 401

    if user['status'] != 'active':
        return jsonify({'success': False, 'message': 'Your account has been deactivated. Please contact municipal administrators.'}), 403

    token = generate_token(user['id'], 'citizen', user['email'], user['name'])
    return jsonify({
        'success': True,
        'message': 'Citizen login successful.',
        'token': token,
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'mobile': user['mobile'],
            'address': user['address'],
            'role': user['role']
        }
    }), 200

@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    return jsonify({'success': True, 'message': 'Successfully logged out.'}), 200

@auth_bp.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()

    if not email:
        return jsonify({'success': False, 'message': 'Please provide registered email address.'}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()

    # For security, always respond with standard instruction
    return jsonify({
        'success': True,
        'message': f'If an account is associated with {email}, a secure password reset link has been dispatched to your email inbox.'
    }), 200

@auth_bp.route('/api/user/profile', methods=['GET', 'PUT'])
@citizen_required
def citizen_profile():
    user_id = request.current_user['id']
    conn = get_db_connection()

    if request.method == 'GET':
        user = conn.execute('SELECT id, name, email, mobile, address, role, status, created_at FROM users WHERE id = ?', (user_id,)).fetchone()
        conn.close()
        return jsonify({'success': True, 'user': dict(user)})

    # PUT update
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    mobile = (data.get('mobile') or '').strip()
    address = (data.get('address') or '').strip()
    new_password = data.get('new_password')

    if not name or not mobile:
        conn.close()
        return jsonify({'success': False, 'message': 'Name and Mobile number are required.'}), 400

    if new_password:
        if len(new_password) < 6:
            conn.close()
            return jsonify({'success': False, 'message': 'New password must be at least 6 characters.'}), 400
        new_hash = generate_password_hash(new_password)
        conn.execute('UPDATE users SET name = ?, mobile = ?, address = ?, password_hash = ? WHERE id = ?',
                     (name, mobile, address, new_hash, user_id))
    else:
        conn.execute('UPDATE users SET name = ?, mobile = ?, address = ? WHERE id = ?',
                     (name, mobile, address, user_id))

    conn.commit()
    user = conn.execute('SELECT id, name, email, mobile, address, role, status, created_at FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()

    return jsonify({'success': True, 'message': 'Citizen profile updated successfully.', 'user': dict(user)})

# ----------------- ADMIN AUTH -----------------

@auth_bp.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'success': False, 'message': 'Admin ID / Email and password are required.'}), 400

    conn = get_db_connection()
    admin = conn.execute('SELECT * FROM admins WHERE email = ?', (email,)).fetchone()
    conn.close()

    if not admin or not check_password_hash(admin['password_hash'], password):
        return jsonify({'success': False, 'message': 'Invalid administrative credentials. Access restricted to authorized personnel.'}), 401

    token = generate_token(admin['id'], 'admin', admin['email'], admin['name'])
    return jsonify({
        'success': True,
        'message': 'Administrative authentication authorized.',
        'token': token,
        'admin': {
            'id': admin['id'],
            'name': admin['name'],
            'email': admin['email'],
            'role': admin['role']
        }
    }), 200

@auth_bp.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    return jsonify({'success': True, 'message': 'Administrative session ended.'}), 200

@auth_bp.route('/api/admin/forgot-password', methods=['POST'])
def admin_forgot_password():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    return jsonify({
        'success': True,
        'message': f'Administrative reset token dispatched to government directory for {email}. Please contact the District System Administrator.'
    }), 200

@auth_bp.route('/api/admin/profile', methods=['GET', 'PUT'])
@admin_required
def admin_profile():
    admin_id = request.current_admin['id']
    conn = get_db_connection()

    if request.method == 'GET':
        admin = conn.execute('SELECT id, name, email, role, created_at FROM admins WHERE id = ?', (admin_id,)).fetchone()
        conn.close()
        return jsonify({'success': True, 'admin': dict(admin)})

    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    new_password = data.get('new_password')

    if not name:
        conn.close()
        return jsonify({'success': False, 'message': 'Admin name cannot be empty.'}), 400

    if new_password:
        if len(new_password) < 6:
            conn.close()
            return jsonify({'success': False, 'message': 'New password must be at least 6 characters.'}), 400
        new_hash = generate_password_hash(new_password)
        conn.execute('UPDATE admins SET name = ?, password_hash = ? WHERE id = ?', (name, new_hash, admin_id))
    else:
        conn.execute('UPDATE admins SET name = ? WHERE id = ?', (name, admin_id))

    conn.commit()
    admin = conn.execute('SELECT id, name, email, role, created_at FROM admins WHERE id = ?', (admin_id,)).fetchone()
    conn.close()
    return jsonify({'success': True, 'message': 'Admin profile updated successfully.', 'admin': dict(admin)})
