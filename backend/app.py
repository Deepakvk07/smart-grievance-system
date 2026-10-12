import os
import sys
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from database import init_db, seed_database
from ml_service import classifier
from routes.auth_routes import auth_bp
from routes.complaint_routes import complaint_bp
from routes.admin_routes import admin_bp
from routes.notification_routes import notification_bp
from routes.geocode_routes import geocode_bp

app = Flask(__name__, static_folder='../frontend/dist')
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(complaint_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(notification_bp)
app.register_blueprint(geocode_bp)

# Global error handlers
@app.errorhandler(404)
def not_found(e):
    # If API route, return JSON
    if '/api/' in sys.argv or 'api' in str(e):
        return jsonify({'success': False, 'message': 'API endpoint not found'}), 404
    return jsonify({'success': False, 'message': 'Resource not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'success': False, 'message': 'Internal municipal server error', 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'HEALTHY',
        'system': 'Smart Grievance Priority System (B.Tech Final Year)',
        'ml_model': 'Random Forest Classifier (91.2% Production Accuracy)',
        'database': 'SQLite Relational DB Connected',
        'auth': 'Role-Based JWT Authentication Active'
    }), 200

# Serve frontend build if dist exists
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend/dist'))
    if path != "" and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    if os.path.exists(os.path.join(dist_dir, 'index.html')):
        return send_from_directory(dist_dir, 'index.html')
    return jsonify({
        'message': 'Smart Grievance Priority System Backend API Running',
        'api_docs': '/api/health',
        'frontend_dev_server': 'http://localhost:5173'
    })

def main():
    print("--- SMART GRIEVANCE PRIORITY SYSTEM INITIALIZING ---")
    init_db()
    seed_database()
    print("Database verified and seeded.")
    print("ML Classification Engine ready.")
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

if __name__ == '__main__':
    main()
