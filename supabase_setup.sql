-- RESET DATABASE (Drop all tables to start fresh)
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS waste_requests CASCADE;
DROP TABLE IF EXISTS grievances CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS water_valves CASCADE;
DROP TABLE IF EXISTS smart_meters CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL, -- 'admin' or 'client'
    address TEXT,
    score INTEGER DEFAULT 0,
    balance DECIMAL(10,2) DEFAULT 1000.00,
    wallet_balance DECIMAL(10,2) DEFAULT 1000.00,
    face_descriptor TEXT, -- JSON string of face descriptor
    fingerprint_id TEXT,
    lat DECIMAL(10,6) DEFAULT 12.9716,
    lng DECIMAL(10,6) DEFAULT 77.5946,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SMART METERS
CREATE TABLE smart_meters (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    current_load_kw DECIMAL(10,2) DEFAULT 0,
    total_units DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. WATER VALVES
CREATE TABLE water_valves (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    flow_rate_lpm DECIMAL(10,2) DEFAULT 0,
    pressure_level DECIMAL(10,2) DEFAULT 0,
    leakage_detected INTEGER DEFAULT 0, -- 0 or 1
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TRANSACTIONS
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    type TEXT, -- 'BILL_PAYMENT', 'TOPUP', etc.
    amount DECIMAL(10,2),
    description TEXT,
    status TEXT DEFAULT 'SUCCESS',
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. GRIEVANCES
CREATE TABLE grievances (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    name TEXT,
    category TEXT, -- 'Water', 'Road', 'Electricity'
    description TEXT,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Resolved', 'Rejected'
    resolution_photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. WASTE REQUESTS
CREATE TABLE waste_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    type TEXT, -- 'e-waste', 'medical', etc.
    date TEXT,
    slot TEXT,
    name TEXT,
    address TEXT,
    status TEXT DEFAULT 'Pending'
);

-- 7. SETTINGS
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- 8. ANNOUNCEMENTS
CREATE TABLE announcements (
    id TEXT PRIMARY KEY,
    message TEXT NOT NULL,
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- SEED DATA (Password: 123456789 hashed)
-- Admin
INSERT INTO users (id, name, email, password, role, address, balance, wallet_balance, score)
VALUES 
('USR-ADMIN-001', 'Admin', 'abhishekholagundi@gmail.com', '$2b$10$VuE5KKW/w98rsTtlN/oflOvSoLvlgh/pGnvgeZdXZk34QV5QzUsJe', 'admin', 'Admin Office', 10000, 10000, 0);

-- Krishna
INSERT INTO users (id, name, email, password, role, address, balance, wallet_balance, score)
VALUES 
('USR-001', 'Krishna K', 'krishnak0974@op.iitg.ac.in', '$2b$10$VuE5KKW/w98rsTtlN/oflOvSoLvlgh/pGnvgeZdXZk34QV5QzUsJe', 'client', 'Sector 12', 5000, 5000, 100);

-- Samarth
INSERT INTO users (id, name, email, password, role, address, balance, wallet_balance, score)
VALUES 
('USR-002', 'Samarth P', 'samarthpujar6@gmail.com', '$2b$10$VuE5KKW/w98rsTtlN/oflOvSoLvlgh/pGnvgeZdXZk34QV5QzUsJe', 'client', 'Sector 15', 5000, 5000, 100);

-- Abhishek
INSERT INTO users (id, name, email, password, role, address, balance, wallet_balance, score)
VALUES 
('USR-003', 'ABHISHEK H', 'abhishekholagunditrading@gmail.com', '$2b$10$VuE5KKW/w98rsTtlN/oflOvSoLvlgh/pGnvgeZdXZk34QV5QzUsJe', 'client', 'Sector 22', 5000, 5000, 100);

-- Sudhakar
INSERT INTO users (id, name, email, password, role, address, balance, wallet_balance, score)
VALUES 
('USR-004', 'Sudhakar', 'sudhakarsonkar007@gmail.com', '$2b$10$VuE5KKW/w98rsTtlN/oflOvSoLvlgh/pGnvgeZdXZk34QV5QzUsJe', 'client', 'Sector 8', 5000, 5000, 100);

-- Default Settings
INSERT INTO settings (key, value) VALUES ('feature_electricity', 'true');
INSERT INTO settings (key, value) VALUES ('feature_water', 'true');
INSERT INTO settings (key, value) VALUES ('feature_waste_pickup', 'true');
