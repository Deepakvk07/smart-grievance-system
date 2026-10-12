import unittest
import json
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import app
from database import init_db, seed_database

class SmartGrievanceE2ETest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        seed_database()
        cls.client = app.test_client()

    def test_01_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'HEALTHY')
        self.assertIn('Random Forest', data['ml_model'])
        print("[PASS] Test 1: Health Check")

    def test_02_citizen_registration_and_duplicate_check(self):
        # Register new citizen
        payload = {
            "name": "Test Citizen Verma",
            "email": "test.verma@example.com",
            "mobile": "9999888877",
            "password": "password123",
            "confirm_password": "password123",
            "address": "Ward 5, Metro Colony"
        }
        res = self.client.post('/api/auth/register', json=payload)
        self.assertIn(res.status_code, [201, 409])
        if res.status_code == 201:
            data = res.get_json()
            self.assertTrue(data['success'])
            self.assertIn('token', data)

        # Duplicate email check
        res_dup = self.client.post('/api/auth/register', json=payload)
        self.assertEqual(res_dup.status_code, 409)
        self.assertFalse(res_dup.get_json()['success'])
        print("[PASS] Test 2: Citizen Registration & Duplicate Email Enforcement")

    def test_03_citizen_login_and_logout(self):
        res = self.client.post('/api/auth/login', json={
            "email": "citizen@example.com",
            "password": "citizen123"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertIn('token', data)
        token = data['token']

        # Profile fetch with token
        prof_res = self.client.get('/api/user/profile', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(prof_res.status_code, 200)
        self.assertEqual(prof_res.get_json()['user']['email'], 'citizen@example.com')

        # Logout
        logout_res = self.client.post('/api/auth/logout')
        self.assertEqual(logout_res.status_code, 200)
        print("[PASS] Test 3: Citizen Login, Profile Verification, & Logout")

    def test_04_ml_prediction_pipeline_examples(self):
        # Test 1: Road High
        res1 = self.client.post('/api/predict', json={
            "title": "Road accident hazard",
            "description": "Large pothole near the main road is causing accidents and rider injuries."
        })
        self.assertEqual(res1.status_code, 200)
        pred1 = res1.get_json()['prediction']
        self.assertEqual(pred1['category'], 'Road')
        self.assertEqual(pred1['priority'], 'High')

        # Test 2: Water High
        res2 = self.client.post('/api/predict', json={
            "title": "Water crisis",
            "description": "No water supply in our locality for three days over 200 families suffering."
        })
        self.assertEqual(res2.status_code, 200)
        pred2 = res2.get_json()['prediction']
        self.assertEqual(pred2['category'], 'Water')
        self.assertEqual(pred2['priority'], 'High')

        # Test 3: Electricity High
        res3 = self.client.post('/api/predict', json={
            "title": "Power transformer failure",
            "description": "Transformer has stopped working and the entire locality has no electricity."
        })
        self.assertEqual(res3.status_code, 200)
        pred3 = res3.get_json()['prediction']
        self.assertEqual(pred3['category'], 'Electricity')
        self.assertEqual(pred3['priority'], 'High')

        # Test 4: Low Priority Road
        res4 = self.client.post('/api/predict', json={
            "title": "Curb crack",
            "description": "Small crack on the side of the road curb not affecting traffic."
        })
        self.assertEqual(res4.status_code, 200)
        pred4 = res4.get_json()['prediction']
        self.assertEqual(pred4['category'], 'Road')
        self.assertEqual(pred4['priority'], 'Low')

        print("[PASS] Test 4: ML Prediction Flow across Categories & Priorities")

    def test_05_citizen_complaint_submission_and_tracking(self):
        login_res = self.client.post('/api/auth/login', json={
            "email": "citizen@example.com",
            "password": "citizen123"
        })
        token = login_res.get_json()['token']

        submit_res = self.client.post('/api/complaints', json={
            "title": "Deep pothole causing accidents near city hospital",
            "description": "Large pothole near the main road is causing accidents and serious injuries.",
            "location": "Hospital Road, Sector 14",
            "image_url": ""
        }, headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(submit_res.status_code, 201)
        sub_data = submit_res.get_json()
        complaint_id = sub_data['complaint_id']
        self.assertTrue(complaint_id.startswith('GRV-'))
        self.assertEqual(sub_data['category'], 'Road')
        self.assertEqual(sub_data['priority'], 'High')

        # Track complaint detail
        detail_res = self.client.get(f'/api/complaints/{complaint_id}', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(detail_res.status_code, 200)
        detail_data = detail_res.get_json()['complaint']
        self.assertEqual(detail_data['complaint_id'], complaint_id)
        self.assertTrue(len(detail_data['history']) >= 1)
        self.assertIsNotNone(detail_data['prediction_meta'])
        print(f"[PASS] Test 5: Citizen Complaint Submission & Tracking ({complaint_id})")

    def test_06_admin_login(self):
        res = self.client.post('/api/admin/login', json={
            "email": "admin@gov.in",
            "password": "admin123"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['admin']['role'], 'admin')
        print("[PASS] Test 6: Admin Login")

    def test_07_admin_priority_queue(self):
        login_res = self.client.post('/api/admin/login', json={
            "email": "admin@gov.in",
            "password": "admin123"
        })
        admin_token = login_res.get_json()['token']

        queue_res = self.client.get('/api/admin/priority-queue', headers={'Authorization': f'Bearer {admin_token}'})
        self.assertEqual(queue_res.status_code, 200)
        complaints = queue_res.get_json()['complaints']
        self.assertTrue(len(complaints) > 0)

        # Verify ordering: High must precede Low
        priorities = [c['priority'] for c in complaints]
        first_low_index = priorities.index('Low') if 'Low' in priorities else len(priorities)
        first_high_index = priorities.index('High') if 'High' in priorities else 0
        self.assertLess(first_high_index, first_low_index)
        print("[PASS] Test 7: Admin Priority Queue Ordering (High -> Medium -> Low)")

    def test_08_admin_department_assignment_and_status_update(self):
        login_res = self.client.post('/api/admin/login', json={
            "email": "admin@gov.in",
            "password": "admin123"
        })
        admin_token = login_res.get_json()['token']

        # Assign department
        assign_res = self.client.put('/api/admin/complaints/GRV-1001/assign', json={
            "department": "Road Department",
            "remarks": "Assigned to Zone 4 Heavy Machinery squad"
        }, headers={'Authorization': f'Bearer {admin_token}'})
        self.assertEqual(assign_res.status_code, 200)

        # Update status to In Progress
        status_res = self.client.put('/api/admin/complaints/GRV-1001/status', json={
            "status": "In Progress",
            "remarks": "Asphalt patch team deployed on-site."
        }, headers={'Authorization': f'Bearer {admin_token}'})
        self.assertEqual(status_res.status_code, 200)
        print("[PASS] Test 8: Admin Department Assignment & Status Transition")

    def test_09_admin_analytics_metrics(self):
        login_res = self.client.post('/api/admin/login', json={
            "email": "admin@gov.in",
            "password": "admin123"
        })
        admin_token = login_res.get_json()['token']

        res = self.client.get('/api/admin/analytics', headers={'Authorization': f'Bearer {admin_token}'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('kpis', data)
        self.assertIn('category_distribution', data)
        self.assertIn('priority_distribution', data)
        self.assertIn('ml_performance', data)
        self.assertEqual(data['ml_performance']['production_accuracy'], 91.2)
        print("[PASS] Test 9: Admin Analytics & ML Benchmark Metrics")

    def test_10_unauthorized_citizen_to_admin_route_blocked(self):
        # 1. Citizen attempts to call admin endpoints
        citizen_login = self.client.post('/api/auth/login', json={
            "email": "citizen@example.com",
            "password": "citizen123"
        })
        citizen_token = citizen_login.get_json()['token']

        # Citizen attempts to access /api/admin/analytics
        res1 = self.client.get('/api/admin/analytics', headers={'Authorization': f'Bearer {citizen_token}'})
        self.assertEqual(res1.status_code, 403)
        self.assertFalse(res1.get_json()['success'])

        # Citizen attempts to access /api/admin/complaints
        res2 = self.client.get('/api/admin/complaints', headers={'Authorization': f'Bearer {citizen_token}'})
        self.assertEqual(res2.status_code, 403)

        # Citizen attempts to update complaint status
        res3 = self.client.put('/api/admin/complaints/GRV-1001/status', json={"status": "Resolved"}, headers={'Authorization': f'Bearer {citizen_token}'})
        self.assertEqual(res3.status_code, 403)

        # 2. No token at all
        res4 = self.client.get('/api/admin/analytics')
        self.assertEqual(res4.status_code, 401)
        print("[PASS] Test 10: Strict RBAC & Unauthorized Citizen -> Admin Blocking (401 & 403 Enforced)")

if __name__ == '__main__':
    unittest.main(verbosity=2)
