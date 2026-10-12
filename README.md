# 🏛️ Smart Grievance Priority System

[![React](https://img.shields.io/badge/Frontend-React%2019-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8.svg)](https://tailwindcss.com/)
[![Flask](https://img.shields.io/badge/Backend-Flask%203.1-black.svg)](https://flask.palletsprojects.com/)
[![Machine Learning](https://img.shields.io/badge/ML-Scikit--Learn%20Random%20Forest-orange.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

An AI-powered municipal grievance redressal and priority triage platform designed for modern civic administration. The system allows citizens to seamlessly lodge public grievances with automatic high-precision geolocation and reverse geocoding, while providing municipal administrators with a streamlined, zero-jargon control panel to triage complaints and immediately dispatch them to the respected civic departments (**Road**, **Water**, and **Electricity**).

---

## ✨ Key Features

### 👤 Citizen Portal
* **No Mandatory Citizen Login:** Direct, friction-free grievance lodging with instant complaint tracking ID generation.
* **Automatic High-Precision Geolocation:** Instant GPS capture with multi-zoom reverse geocoding resolving detailed Indian localities, society names, streets, landmarks, and pincodes.
* **Smart Auto-Categorization & Severity Scoring:** Automated detection of municipal category (Roads, Water Supply, Electricity, Sanitation) with priority estimation.
* **Multi-Media Evidence Upload:** Supports photo uploads and document attachments for instant grievance verification.
* **Real-time Status Tracking:** Citizens can track the exact timeline and department assigned to their complaint using their Complaint ID.

### 🛡️ Municipal Admin Panel
* **Clean, Human-Friendly Design:** Zero robotic jargon or cluttered analytics graphs—built specifically for municipal administrative staff.
* **1-Click Department Assignment:** Directly assign problems on the spot to:
  * 🛣️ **Road Department**
  * 🚰 **Water Department**
  * ⚡ **Electricity Department**
* **Instant Filter Triage:** Filter complaints in 1-click by Urgency (`🔴 Urgent`), Assignment (`⚠️ Not Assigned`), or Specific Department.
* **Live Status Progression:** Quick-toggle status from `Submitted` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React, React Router v7 |
| **Backend** | Python 3, Flask, Flask-CORS, PyJWT, Werkzeug |
| **Machine Learning** | Scikit-Learn (Random Forest Classifier for Priority & Category Triage), Joblib |
| **Database** | SQLite Relational Database with automatic seeding and audit history |
| **Geocoding** | Nominatim OpenStreetMap Multi-Tier Geocoding API |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* **Node.js** (v18 or higher) and **npm**
* **Python** (v3.10 or higher) and **pip**
* **Git**

---

### 2. Clone Repository
```bash
git clone https://github.com/singhanchal1125/smart-grievance-system.git
cd smart-grievance-system
```

---

### 3. Backend Setup
1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```
2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask backend server:
   ```bash
   python app.py
   ```
   *The backend will launch at `http://127.0.0.1:5000` with the SQLite database initialized and seeded automatically.*

---

### 4. Frontend Setup
1. In a separate terminal, navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The citizen portal and admin panel will be accessible at `http://localhost:5173`.*

---

## 🔐 Default Admin Credentials

For evaluation and administrative demonstration:
* **Admin Login URL:** `http://localhost:5173/admin/login`
* **Email / Officer ID:** `admin@gov.in`
* **Password:** `admin123`
*(A convenient 1-click "Auto-Fill Admin Credentials" button is provided directly on the login screen).*

---

## 📁 Project Architecture

```
smart-grievance-system/
├── backend/
│   ├── app.py                  # Main Flask application and blueprint registration
│   ├── database.py             # SQLite database schemas, initialization & seeders
│   ├── auth.py                 # Role-based JWT authentication & token verification
│   ├── ml_service.py           # ML inference pipeline (Priority & Category models)
│   ├── ml_models/              # Trained Random Forest classifiers (.joblib)
│   ├── routes/                 # Modular API endpoints
│   │   ├── admin_routes.py     # Admin triage, department assignment & metrics
│   │   ├── auth_routes.py      # Authentication & officer verification
│   │   ├── complaint_routes.py # Public grievance submission and status tracking
│   │   ├── geocode_routes.py   # Multi-tier reverse geocoding API
│   │   └── notification_routes.py # Notification alerts & audit trails
│   └── requirements.txt        # Python package dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components & layouts (AdminLayout)
│   │   ├── pages/
│   │   │   ├── citizen/        # Public Citizen Portal (CitizenDashboard, ComplaintDetail)
│   │   │   └── admin/          # Streamlined Admin Panel (AdminDashboard, AdminDepartments)
│   │   ├── services/api.js     # Unified API integration layer
│   │   └── App.jsx             # React Router routing configuration
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 📜 License
This project is licensed under the MIT License - open for civic adoption, educational research, and enhancement.
