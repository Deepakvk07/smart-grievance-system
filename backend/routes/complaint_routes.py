import re
from datetime import datetime
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from database import get_db_connection
from auth import citizen_required, extract_token_from_header, decode_token
from ml_service import predict_complaint

complaint_bp = Blueprint('complaint_bp', __name__)

def generate_complaint_id(cursor):
    cursor.execute("SELECT complaint_id FROM complaints ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    if not row or not row['complaint_id']:
        return "GRV-1001"
    last_id = row['complaint_id']
    match = re.search(r'GRV-(\d+)', last_id)
    if match:
        next_num = int(match.group(1)) + 1
        return f"GRV-{next_num}"
    return "GRV-1001"

@complaint_bp.route('/api/predict', methods=['POST'])
def predict_endpoint():
    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip()

    if not title and not description:
        return jsonify({'success': False, 'message': 'Please provide complaint title or description to analyze.'}), 400

    prediction = predict_complaint(title, description)
    return jsonify({
        'success': True,
        'prediction': prediction
    }), 200

def generate_ai_acknowledgment(category, location, title):
    cat_lower = (category or '').lower()
    loc_suffix = f" at {location}" if location and location != 'Unknown' else ""
    if 'road' in cat_lower:
        return (
            f"Thank you for contacting our municipal redressal team. We have received your report regarding "
            f"road and infrastructure maintenance{loc_suffix} and forwarded it directly to the Ward Roadworks & Pavement Unit. "
            f"Our field engineering squad will inspect the site and work to resolve this issue as early as possible."
        )
    elif 'water' in cat_lower:
        return (
            f"Thank you for reaching out to the municipal grievance cell. Your ticket concerning water supply "
            f"and drainage systems{loc_suffix} has been logged and dispatched to the Municipal Jal Works & Pipeline Division. "
            f"Our technical crew is reviewing the details to restore optimal civic service as early as possible."
        )
    elif 'elect' in cat_lower:
        return (
            f"Thank you for contacting the civic response helpline. Your report regarding street lighting and electrical "
            f"infrastructure{loc_suffix} has been registered and sent to the Municipal Electrical Maintenance Division. "
            f"Our on-call linemen will inspect the designated area and address the fault as early as possible."
        )
    else:
        return (
            f"Thank you for contacting our municipal team. We have successfully registered your grievance{loc_suffix} "
            f"and routed it to the designated zonal operations unit. Our civic inspection staff will review the details "
            f"and work to solve the problem as early as possible."
        )

@complaint_bp.route('/api/complaints', methods=['POST'])
def submit_complaint():
    data = request.get_json() or {}

    name = (data.get('name') or data.get('citizen_name') or '').strip()
    mobile = (data.get('mobile') or data.get('citizen_mobile') or '').strip()
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip()
    location = (data.get('location') or '').strip()
    image_url = (data.get('image_url') or '').strip()

    if not name or not mobile:
        return jsonify({'success': False, 'message': 'Citizen Name and 10-digit Mobile Number are required.'}), 400

    if not title or not description or not location:
        return jsonify({'success': False, 'message': 'Complaint Title, Description, and Location are mandatory.'}), 400

    # 1. Real ML Classification Pipeline
    prediction = predict_complaint(title, description)
    category = prediction['category']
    priority = prediction['priority']
    explanation = prediction['explanation']
    confidence_cat = prediction['confidence_category']
    confidence_prio = prediction['confidence_priority']

    # Auto-assign department suggestion based on predicted category
    dept_map = {
        'Road': 'Road Department',
        'Water': 'Water Department',
        'Electricity': 'Electricity Department'
    }
    assigned_dept = dept_map.get(category, 'General Municipal Administration')

    conn = get_db_connection()
    cursor = conn.cursor()

    # Look up existing user by mobile or register open citizen profile
    user_row = cursor.execute('SELECT id, name FROM users WHERE mobile = ?', (mobile,)).fetchone()
    if user_row:
        user_id = user_row['id']
        if name and name != user_row['name']:
            cursor.execute('UPDATE users SET name = ? WHERE id = ?', (name, user_id))
    else:
        placeholder_email = f"citizen_{mobile}@grievance.local"
        alt_check = cursor.execute('SELECT id FROM users WHERE email = ?', (placeholder_email,)).fetchone()
        if alt_check:
            placeholder_email = f"citizen_{mobile}_{int(datetime.now().timestamp())}@grievance.local"

        cursor.execute('''
        INSERT INTO users (name, email, mobile, password_hash, role)
        VALUES (?, ?, ?, ?, 'citizen')
        ''', (name, placeholder_email, mobile, generate_password_hash('citizen123')))
        user_id = cursor.lastrowid

    complaint_id = generate_complaint_id(cursor)
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 2. Insert into COMPLAINTS
    cursor.execute('''
    INSERT INTO complaints (
        complaint_id, user_id, title, description, location,
        category, priority, status, assigned_department, image_url,
        created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Submitted', ?, ?, ?, ?)
    ''', (
        complaint_id, user_id, title, description, location,
        category, priority, assigned_dept, image_url,
        now, now
    ))
    db_id = cursor.lastrowid

    # 3. Insert into MODEL_PREDICTIONS
    cursor.execute('''
    INSERT INTO model_predictions (
        complaint_id, predicted_category, predicted_priority,
        confidence_category, confidence_priority, explanation,
        model_name, prediction_timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        complaint_id, category, priority,
        confidence_cat, confidence_prio, explanation,
        prediction['model_name'], now
    ))

    # 4. Insert into COMPLAINT_HISTORY
    initial_remark = "Complaint registered via civic portal. Forwarded to the municipal department for field inspection."
    cursor.execute('''
    INSERT INTO complaint_history (
        complaint_id, status, remarks, updated_by, created_at
    ) VALUES (?, 'Submitted', ?, 'Civic Portal', ?)
    ''', (complaint_id, initial_remark, now))

    # Auto AI Acknowledgment Response
    ai_ack_msg = generate_ai_acknowledgment(category, location, title)
    cursor.execute('''
    INSERT INTO complaint_history (
        complaint_id, status, remarks, updated_by, created_at
    ) VALUES (?, 'Acknowledged', ?, 'Municipal AI Assistant', ?)
    ''', (complaint_id, ai_ack_msg, now))

    # 5. Insert notification for Citizen
    notif_msg = (
        f"Thank you for contacting us. Your grievance #{complaint_id} ({category}) has been received "
        f"and forwarded to our municipal team. We will inspect and solve the issue as early as possible."
    )
    cursor.execute('''
    INSERT INTO notifications (
        user_id, complaint_id, message, is_read, created_at
    ) VALUES (?, ?, ?, 0, ?)
    ''', (user_id, complaint_id, notif_msg, now))

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': 'Complaint submitted successfully!',
        'complaint_id': complaint_id,
        'category': category,
        'assigned_department': assigned_dept,
        'ai_ack_message': ai_ack_msg
    }), 201

@complaint_bp.route('/api/user/complaints', methods=['GET'])
@citizen_required
def get_user_complaints():
    user_id = request.current_user['id']
    category = request.args.get('category')
    priority = request.args.get('priority')
    status = request.args.get('status')
    search = request.args.get('search', '').strip()

    conn = get_db_connection()

    # Base query for user complaints
    query = 'SELECT * FROM complaints WHERE user_id = ?'
    params = [user_id]

    if category and category != 'All':
        query += ' AND category = ?'
        params.append(category)

    if priority and priority != 'All':
        query += ' AND priority = ?'
        params.append(priority)

    if status and status != 'All':
        query += ' AND status = ?'
        params.append(status)

    if search:
        query += ' AND (complaint_id LIKE ? OR title LIKE ? OR location LIKE ?)'
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard])

    query += ' ORDER BY id DESC'
    rows = conn.execute(query, params).fetchall()

    # Calculate citizen stats
    all_rows = conn.execute('SELECT category, priority, status FROM complaints WHERE user_id = ?', (user_id,)).fetchall()
    conn.close()

    total = len(all_rows)
    pending = sum(1 for r in all_rows if r['status'] in ['Submitted', 'Under Review'])
    in_progress = sum(1 for r in all_rows if r['status'] in ['Assigned', 'In Progress'])
    resolved = sum(1 for r in all_rows if r['status'] == 'Resolved')
    high_priority = sum(1 for r in all_rows if r['priority'] == 'High')

    return jsonify({
        'success': True,
        'complaints': [dict(r) for r in rows],
        'stats': {
            'total': total,
            'pending': pending,
            'in_progress': in_progress,
            'resolved': resolved,
            'high_priority': high_priority
        }
    }), 200

@complaint_bp.route('/api/complaints/<string:complaint_id>', methods=['GET'])
def get_complaint_details(complaint_id):
    conn = get_db_connection()
    complaint = conn.execute('''
        SELECT c.*, u.name as citizen_name, u.email as citizen_email, u.mobile as citizen_mobile
        FROM complaints c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.complaint_id = ?
    ''', (complaint_id,)).fetchone()

    if not complaint:
        conn.close()
        return jsonify({'success': False, 'message': f'Complaint {complaint_id} not found.'}), 404

    # Fetch prediction metadata
    prediction = conn.execute('SELECT * FROM model_predictions WHERE complaint_id = ?', (complaint_id,)).fetchone()

    # Fetch history timeline ordered chronologically
    history = conn.execute('SELECT * FROM complaint_history WHERE complaint_id = ? ORDER BY id ASC', (complaint_id,)).fetchall()

    conn.close()

    result = dict(complaint)
    result['prediction_meta'] = dict(prediction) if prediction else None
    result['history'] = [dict(h) for h in history]

    return jsonify({
        'success': True,
        'complaint': result
    }), 200
