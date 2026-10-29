import sqlite3
import os
import sys
import json
import shutil
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

def get_db_path():
    if os.environ.get('VERCEL'):
        tmp_db = '/tmp/grievance_system.db'
        bundled_db = os.path.join(os.path.dirname(__file__), 'grievance_system.db')
        if not os.path.exists(tmp_db) and os.path.exists(bundled_db):
            try:
                shutil.copy2(bundled_db, tmp_db)
            except Exception as e:
                print(f"Notice: copying DB to /tmp: {e}")
        return tmp_db
    return os.path.join(os.path.dirname(__file__), 'grievance_system.db')

DB_PATH = get_db_path()

def get_db_connection():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # USERS table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        address TEXT,
        role TEXT NOT NULL DEFAULT 'citizen',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ''')

    # ADMINS table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ''')

    # DEPARTMENTS table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department_name TEXT UNIQUE NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'active'
    );
    ''')

    # COMPLAINTS table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_id TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Submitted',
        assigned_department TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    ''')

    # COMPLAINT_HISTORY table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS complaint_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_id TEXT NOT NULL,
        status TEXT NOT NULL,
        remarks TEXT,
        updated_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE
    );
    ''')

    # NOTIFICATIONS table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        complaint_id TEXT,
        message TEXT NOT NULL,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    ''')

    # MODEL_PREDICTIONS table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS model_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_id TEXT UNIQUE NOT NULL,
        predicted_category TEXT NOT NULL,
        predicted_priority TEXT NOT NULL,
        confidence_category REAL DEFAULT 0.92,
        confidence_priority REAL DEFAULT 0.89,
        explanation TEXT,
        model_name TEXT NOT NULL DEFAULT 'Random Forest Classifier',
        prediction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE
    );
    ''')

    conn.commit()
    conn.close()

def seed_database():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if database already has users/admins
    cursor.execute("SELECT COUNT(*) as count FROM admins")
    admin_count = cursor.fetchone()['count']

    if admin_count > 0:
        conn.close()
        return

    print("Seeding database with default initial data...")

    # 1. Seed Admins
    admin_hash = generate_password_hash("admin123")
    cursor.execute('''
    INSERT INTO admins (name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
    ''', ("Chief Municipal Administrator", "admin@gov.in", admin_hash, "admin"))

    cursor.execute('''
    INSERT INTO admins (name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
    ''', ("Senior Triage Officer", "triage.officer@gov.in", admin_hash, "admin"))

    # 2. Seed Citizens
    citizen_hash = generate_password_hash("citizen123")
    citizens_data = [
        ("Rahul Sharma", "citizen@example.com", "9876543210", citizen_hash, "Flat 402, Sector 14, Urban Colony, New Delhi"),
        ("Priya Patel", "priya.patel@example.com", "9812345678", citizen_hash, "42 MG Road, Gandhi Nagar, Ward 7"),
        ("Amit Verma", "amit.verma@example.com", "9765432109", citizen_hash, "Block C-12, Green Park, South Zone"),
        ("Sunita Rao", "sunita.rao@example.com", "9988776655", citizen_hash, "House 18, Lakeview Residency, Sector 21"),
    ]

    user_ids = []
    for c in citizens_data:
        cursor.execute('''
        INSERT INTO users (name, email, mobile, password_hash, address, role, status)
        VALUES (?, ?, ?, ?, ?, 'citizen', 'active')
        ''', c)
        user_ids.append(cursor.lastrowid)

    # 3. Seed Departments
    departments = [
        ("Road Department", "Responsible for road repairs, potholes, sidewalks, and traffic safety hazards.", "active"),
        ("Water Department", "Responsible for municipal water supply, pipeline leakages, and water contamination triage.", "active"),
        ("Electricity Department", "Responsible for electrical transformers, street lighting, power failures, and wire hazards.", "active"),
    ]
    for dept in departments:
        cursor.execute('''
        INSERT INTO departments (department_name, description, status)
        VALUES (?, ?, ?)
        ''', dept)

    # 4. Realistic Demo Complaints
    now = datetime.now()
    demo_complaints = [
        {
            "complaint_id": "GRV-1001",
            "user_id": user_ids[0],
            "title": "Large pothole near the main road is causing accidents",
            "description": "Large pothole near the main road intersection is causing frequent accidents, especially for two-wheelers during peak traffic hours. Several motorists have sustained injuries.",
            "location": "Main Road Junction, Sector 14, New Delhi",
            "category": "Road",
            "priority": "High",
            "status": "In Progress",
            "assigned_department": "Road Department",
            "days_ago": 3,
            "explanation": "Classified as Road grievance with High Priority due to severe safety hazard indicators ('accidents', 'fatalities risk', 'motorists injuries').",
            "history": [
                ("Submitted", "Complaint registered via citizen portal. AI automated triage assigned Category: Road, Priority: High.", "System"),
                ("Under Review", "Reviewed by Municipal Triage Desk. Validated emergency severity level.", "Chief Municipal Administrator"),
                ("Assigned", "Assigned to Road Department engineering field squad.", "Chief Municipal Administrator"),
                ("In Progress", "Road maintenance crew dispatched with asphalt patcher unit.", "Road Department")
            ]
        },
        {
            "complaint_id": "GRV-1002",
            "user_id": user_ids[1],
            "title": "No water supply in our locality for three days",
            "description": "No water supply in our locality for three continuous days. Over 200 families in Ward 7 have zero drinking water supply and tankers have not arrived.",
            "location": "Block B & C, 42 MG Road, Gandhi Nagar",
            "category": "Water",
            "priority": "High",
            "status": "Assigned",
            "assigned_department": "Water Department",
            "days_ago": 2,
            "explanation": "Classified as Water grievance with High Priority due to prolonged scarcity indicator ('no water supply for three days', affecting entire locality).",
            "history": [
                ("Submitted", "Complaint registered and auto-classified as High Priority Water emergency.", "System"),
                ("Under Review", "Triage team verified bulk feeder pipeline blockage.", "Senior Triage Officer"),
                ("Assigned", "Assigned to Water Department emergency valve maintenance team.", "Senior Triage Officer")
            ]
        },
        {
            "complaint_id": "GRV-1003",
            "user_id": user_ids[2],
            "title": "Transformer has stopped working and the entire locality has no electricity",
            "description": "Transformer has stopped working with loud sparks and the entire locality has no electricity since midnight. Risk of short circuit fire near residential apartments.",
            "location": "Substation Corner, Block C, Green Park",
            "category": "Electricity",
            "priority": "High",
            "status": "In Progress",
            "assigned_department": "Electricity Department",
            "days_ago": 1,
            "explanation": "Classified as Electricity grievance with High Priority based on critical grid failure and spark/fire hazard indicators.",
            "history": [
                ("Submitted", "High Priority electrical triage detected. AI flagged urgent safety danger.", "System"),
                ("Assigned", "Escalated immediately to Electricity Department substation repair team.", "Chief Municipal Administrator"),
                ("In Progress", "Replacement 250kVA transformer in transit; safety cordon established.", "Electricity Department")
            ]
        },
        {
            "complaint_id": "GRV-1004",
            "user_id": user_ids[0],
            "title": "Small crack on the side of the road",
            "description": "There is a small crack developing on the side of the asphalt curb on Street 5. It is not currently hindering traffic but needs preventative sealing before monsoon.",
            "location": "Street 5, Sector 14, Urban Colony",
            "category": "Road",
            "priority": "Low",
            "status": "Under Review",
            "assigned_department": "Road Department",
            "days_ago": 5,
            "explanation": "Classified as Road grievance with Low Priority. Non-critical cosmetic pavement wear without acute traffic hindrance.",
            "history": [
                ("Submitted", "Complaint logged. Classified as Low Priority maintenance item.", "System"),
                ("Under Review", "Queued for scheduled seasonal patch maintenance.", "Senior Triage Officer")
            ]
        },
        {
            "complaint_id": "GRV-1005",
            "user_id": user_ids[1],
            "title": "Water pressure is slightly low during the evening",
            "description": "Water pressure is slightly low during the evening hours between 6 PM to 8 PM on the upper floors. Morning supply is adequate.",
            "location": "Avenue 3, Gandhi Nagar",
            "category": "Water",
            "priority": "Medium",
            "status": "Submitted",
            "assigned_department": "Water Department",
            "days_ago": 4,
            "explanation": "Classified as Water grievance with Medium Priority based on moderate service disruption without complete supply outage.",
            "history": [
                ("Submitted", "Complaint logged and categorized as Medium Priority Water issue.", "System")
            ]
        },
        {
            "complaint_id": "GRV-1006",
            "user_id": user_ids[2],
            "title": "One street light is slightly dim",
            "description": "One street light bulb near lamp post #14 is slightly dim. Surrounding lights illuminate the road safely.",
            "location": "Park Perimeter Lane, Green Park",
            "category": "Electricity",
            "priority": "Low",
            "status": "Resolved",
            "assigned_department": "Electricity Department",
            "days_ago": 7,
            "resolved_days_ago": 1,
            "explanation": "Classified as Electricity grievance with Low Priority. Minor illumination degradation with no safety hazard.",
            "history": [
                ("Submitted", "Classified as Low Priority Street Light replacement.", "System"),
                ("Assigned", "Assigned to Zone 4 lighting technician.", "Senior Triage Officer"),
                ("In Progress", "LED bulb replacement scheduled.", "Electricity Department"),
                ("Resolved", "Defective 40W fixture replaced with new LED luminaire. Verified operational.", "Electricity Department")
            ]
        },
        {
            "complaint_id": "GRV-1007",
            "user_id": user_ids[3],
            "title": "Exposed high voltage cable touching puddle near school walkway",
            "description": "Dangling high-voltage power wire snapped and is touching rainwater puddle right outside Government Primary School gate. High danger of electrocution for schoolchildren.",
            "location": "School Gate 2, Lakeview Residency Road",
            "category": "Electricity",
            "priority": "High",
            "status": "In Progress",
            "assigned_department": "Electricity Department",
            "days_ago": 1,
            "explanation": "Classified as Electricity grievance with High Priority (Critical Hazard). High-voltage exposure near school with electrocution risk.",
            "history": [
                ("Submitted", "Critical Emergency Flag raised by AI NLP Engine.", "System"),
                ("Assigned", "Emergency Grid Response dispatched immediately.", "Chief Municipal Administrator"),
                ("In Progress", "Feeder line isolated remotely. Crew on-site splicing overhead conductor.", "Electricity Department")
            ]
        },
        {
            "complaint_id": "GRV-1008",
            "user_id": user_ids[3],
            "title": "Foul-smelling sewage contamination entering domestic drinking pipeline",
            "description": "Domestic tap water has blackish tint and extreme sewage stench. Suspected cross-contamination between broken sewer line and main water line. Residents falling ill.",
            "location": "Lane 4, Lakeview Residency",
            "category": "Water",
            "priority": "High",
            "status": "Under Review",
            "assigned_department": "Water Department",
            "days_ago": 2,
            "explanation": "Classified as Water grievance with High Priority. Biohazard contamination of potable water affecting public health.",
            "history": [
                ("Submitted", "Classified as High Priority Public Health & Water Emergency.", "System"),
                ("Under Review", "Water Quality Wing alerted. Emergency mobile chlorination unit ordered.", "Chief Municipal Administrator")
            ]
        },
        {
            "complaint_id": "GRV-1009",
            "user_id": user_ids[0],
            "title": "Major road cave-in and sinkhole near metro pillar 114",
            "description": "A 4-foot deep sinkhole opened up following drainage pipe collapse under the road. Buses and cars cannot pass. Risk of vehicle falling in.",
            "location": "Ring Road near Metro Pillar 114",
            "category": "Road",
            "priority": "High",
            "status": "Assigned",
            "assigned_department": "Road Department",
            "days_ago": 2,
            "explanation": "Classified as Road grievance with High Priority. Major sinkhole/structural collapse causing severe hazard and transit blockage.",
            "history": [
                ("Submitted", "Automated Triage identified sinkhole collapse as High Priority Road hazard.", "System"),
                ("Assigned", "Structural Highway Engineers assigned with heavy barricades.", "Chief Municipal Administrator")
            ]
        },
        {
            "complaint_id": "GRV-1010",
            "user_id": user_ids[1],
            "title": "Broken municipal water valve leaking clean water into gutter",
            "description": "A municipal distribution valve has cracked and thousands of liters of clean drinking water are wasting into the stormwater drain.",
            "location": "Near Water Tanker Depot, Gandhi Nagar",
            "category": "Water",
            "priority": "Medium",
            "status": "Resolved",
            "assigned_department": "Water Department",
            "days_ago": 6,
            "resolved_days_ago": 2,
            "explanation": "Classified as Water grievance with Medium Priority. Resource wastage without acute residential shortage or danger.",
            "history": [
                ("Submitted", "Classified as Medium Priority Water wastage grievance.", "System"),
                ("Assigned", "Assigned to Pipeline Maintenance Depot.", "Senior Triage Officer"),
                ("In Progress", "Sluice valve isolation and seal replacement underway.", "Water Department"),
                ("Resolved", "New bronze gate valve installed and pressure tested. Leak completely sealed.", "Water Department")
            ]
        },
        {
            "complaint_id": "GRV-1011",
            "user_id": user_ids[2],
            "title": "Frequent voltage fluctuation and flickering lights in evening",
            "description": "Voltage fluctuates drastically between 140V and 260V every evening. Refrigerators and motors are tripping repeatedly.",
            "location": "North Suburb Block C, Green Park",
            "category": "Electricity",
            "priority": "Medium",
            "status": "Assigned",
            "assigned_department": "Electricity Department",
            "days_ago": 3,
            "explanation": "Classified as Electricity grievance with Medium Priority. Voltage instability threatening appliances without live danger.",
            "history": [
                ("Submitted", "Classified as Medium Priority Power Quality issue.", "System"),
                ("Assigned", "Assigned to Sub-station phase balancer division.", "Senior Triage Officer")
            ]
        },
        {
            "complaint_id": "GRV-1012",
            "user_id": user_ids[3],
            "title": "Paver blocks loosened on sidewalk walkway",
            "description": "A few interlocking paving stones have become loose on the pedestrian walkway near the park gate. Pedestrians can trip if walking in dark.",
            "location": "Sector 21 Community Park Promenade",
            "category": "Road",
            "priority": "Low",
            "status": "Submitted",
            "assigned_department": "Road Department",
            "days_ago": 4,
            "explanation": "Classified as Road grievance with Low Priority. Minor sidewalk maintenance.",
            "history": [
                ("Submitted", "Classified as Low Priority pedestrian infrastructure issue.", "System")
            ]
        }
    ]

    for item in demo_complaints:
        created_time = (now - timedelta(days=item["days_ago"])).strftime("%Y-%m-%d %H:%M:%S")
        updated_time = created_time
        resolved_time = None
        if "resolved_days_ago" in item:
            resolved_time = (now - timedelta(days=item["resolved_days_ago"])).strftime("%Y-%m-%d %H:%M:%S")
            updated_time = resolved_time

        cursor.execute('''
        INSERT INTO complaints (
            complaint_id, user_id, title, description, location,
            category, priority, status, assigned_department,
            created_at, updated_at, resolved_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            item["complaint_id"], item["user_id"], item["title"], item["description"], item["location"],
            item["category"], item["priority"], item["status"], item["assigned_department"],
            created_time, updated_time, resolved_time
        ))

        # Model Prediction entry
        cursor.execute('''
        INSERT INTO model_predictions (
            complaint_id, predicted_category, predicted_priority,
            confidence_category, confidence_priority, explanation,
            model_name, prediction_timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, 'Random Forest Classifier', ?)
        ''', (
            item["complaint_id"], item["category"], item["priority"],
            0.94 if item["priority"] == "High" else 0.88,
            0.91 if item["priority"] == "High" else 0.85,
            item["explanation"],
            created_time
        ))

        # Complaint History entries
        for hist_step, hist_remark, hist_by in item["history"]:
            cursor.execute('''
            INSERT INTO complaint_history (
                complaint_id, status, remarks, updated_by, created_at
            ) VALUES (?, ?, ?, ?, ?)
            ''', (item["complaint_id"], hist_step, hist_remark, hist_by, created_time))

        # Notifications entry for citizen
        cursor.execute('''
        INSERT INTO notifications (
            user_id, complaint_id, message, is_read, created_at
        ) VALUES (?, ?, ?, ?, ?)
        ''', (
            item["user_id"],
            item["complaint_id"],
            f"Your complaint {item['complaint_id']} has been classified as {item['priority']} Priority in {item['category']} Category.",
            1 if item["status"] == "Resolved" else 0,
            created_time
        ))

        if item["status"] in ["Assigned", "In Progress", "Resolved"]:
            cursor.execute('''
            INSERT INTO notifications (
                user_id, complaint_id, message, is_read, created_at
            ) VALUES (?, ?, ?, ?, ?)
            ''', (
                item["user_id"],
                item["complaint_id"],
                f"Your complaint {item['complaint_id']} status updated to: {item['status']}.",
                0,
                updated_time
            ))

    conn.commit()
    conn.close()
    print("Database seeding completed successfully.")

def clear_database(keep_auth=True):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = OFF;")
    cursor.execute("DELETE FROM complaint_history;")
    cursor.execute("DELETE FROM model_predictions;")
    cursor.execute("DELETE FROM notifications;")
    cursor.execute("DELETE FROM complaints;")
    cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('complaints', 'complaint_history', 'model_predictions', 'notifications');")

    if not keep_auth:
        cursor.execute("DELETE FROM users;")
        cursor.execute("DELETE FROM admins;")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('users', 'admins');")
    else:
        # Keep clean default user accounts
        cursor.execute("DELETE FROM users WHERE email NOT IN ('citizen@example.com', 'priya.patel@example.com', 'amit.verma@example.com', 'sunita.rao@example.com');")

    cursor.execute("PRAGMA foreign_keys = ON;")
    conn.commit()
    cursor.execute("VACUUM;")
    conn.close()
    print("Database cleared: All complaints, timelines, notifications, and model predictions have been completely removed.")

if __name__ == '__main__':
    if '--clear' in sys.argv:
        clear_database(keep_auth='--full' not in sys.argv)
    else:
        init_db()
        seed_database()
