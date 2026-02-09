const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');

// Delete old database if exists
if (fs.existsSync('./database.sqlite')) {
    fs.unlinkSync('./database.sqlite');
    console.log('✅ Old database deleted');
}

const db = new sqlite3.Database('./database.sqlite');

console.log('🔄 Creating fresh database with YOUR team...\n');

// Create tables
db.serialize(async () => {
    // Users table
    db.run(`CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        address TEXT,
        score INTEGER DEFAULT 0,
        balance REAL DEFAULT 1000,
        wallet_balance REAL DEFAULT 1000,
        face_descriptor TEXT,
        fingerprint_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Smart Meters
    db.run(`CREATE TABLE smart_meters (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        current_load_kw REAL DEFAULT 0,
        total_units REAL DEFAULT 0,
        status TEXT DEFAULT 'ACTIVE',
        last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Water Valves
    db.run(`CREATE TABLE water_valves (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        flow_rate_lpm REAL DEFAULT 0,
        pressure_level REAL DEFAULT 0,
        leakage_detected INTEGER DEFAULT 0,
        last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Transactions
    db.run(`CREATE TABLE transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        type TEXT,
        amount REAL,
        description TEXT,
        status TEXT DEFAULT 'SUCCESS',
        date TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Grievances
    db.run(`CREATE TABLE grievances (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT,
        category TEXT,
        description TEXT,
        status TEXT DEFAULT 'Pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Waste Requests
    db.run(`CREATE TABLE waste_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        type TEXT,
        date TEXT,
        slot TEXT,
        status TEXT DEFAULT 'Pending',
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Settings
    db.run(`CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )`);

    // Announcements
    db.run(`CREATE TABLE announcements (
        id TEXT PRIMARY KEY,
        message TEXT NOT NULL,
        created_by TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        active INTEGER DEFAULT 1,
        FOREIGN KEY(created_by) REFERENCES users(id)
    )`);

    console.log('✅ Tables created\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('123456789', 10);

    // YOUR CUSTOM TEAM DATA
    const users = [
        {
            id: 'USR-ADMIN-001',
            name: 'Admin',
            email: 'abhishekholagundi@gmail.com',
            password: hashedPassword,
            role: 'admin',
            address: 'Admin Office, City Hall',
            balance: 10000
        },
        {
            id: 'USR-001',
            name: 'Krishna K',
            email: 'krishnak0974@op.iitg.ac.in',
            password: hashedPassword,
            role: 'client',
            address: 'Sector 12, Block A',
            balance: 5000
        },
        {
            id: 'USR-002',
            name: 'Samarth P',
            email: 'samarthpujar6@gmail.com',
            password: hashedPassword,
            role: 'client',
            address: 'Sector 15, Block B',
            balance: 5000
        },
        {
            id: 'USR-003',
            name: 'ABHISHEK H',
            email: 'abhishekholagunditrading@gmail.com',
            password: hashedPassword,
            role: 'client',
            address: 'Sector 22, Block C',
            balance: 5000
        },
        {
            id: 'USR-004',
            name: 'Sudhakar',
            email: 'sudhakarsonkar007@gmail.com',
            password: hashedPassword,
            role: 'client',
            address: 'Sector 8, Block D',
            balance: 5000
        }
    ];

    console.log('👥 ADDING YOUR TEAM:\n');

    // Insert users
    for (const user of users) {
        db.run(
            `INSERT INTO users (id, name, email, password, role, address, balance, score) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user.id, user.name, user.email, user.password, user.role, user.address, user.balance, 100]
        );

        console.log(`   ✅ ${user.role === 'admin' ? 'ADMIN' : 'CITIZEN'}: ${user.name}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Password: 123456789\n`);

        // Add smart meter and water valve for each user
        if (user.role === 'client') {
            db.run(
                `INSERT INTO smart_meters (id, user_id, current_load_kw, total_units, status)
                 VALUES (?, ?, ?, ?, ?)`,
                [`METER-${user.id}`, user.id, 2.5, 150, 'ACTIVE']
            );

            db.run(
                `INSERT INTO water_valves (id, user_id, flow_rate_lpm, pressure_level, leakage_detected)
                 VALUES (?, ?, ?, ?, ?)`,
                [`VALVE-${user.id}`, user.id, 15.5, 3.2, 0]
            );
        }
    }

    // Add default settings
    db.run(`INSERT INTO settings (key, value) VALUES ('feature_electricity', 'true')`);
    db.run(`INSERT INTO settings (key, value) VALUES ('feature_water', 'true')`);
    db.run(`INSERT INTO settings (key, value) VALUES ('feature_waste_pickup', 'true')`);

    console.log('\n════════════════════════════════════════');
    console.log('✅ DATABASE CREATED SUCCESSFULLY!');
    console.log('════════════════════════════════════════\n');
    console.log('👥 YOUR 5 USERS ARE READY:\n');
    console.log('   ADMIN: Admin');
    console.log('   └─ abhishekholagundi@gmail.com\n');
    console.log('   CITIZEN 1: Krishna K');
    console.log('   └─ krishnak0974@op.iitg.ac.in\n');
    console.log('   CITIZEN 2: Samarth P');
    console.log('   └─ samarthpujar6@gmail.com\n');
    console.log('   CITIZEN 3: ABHISHEK H');
    console.log('   └─ abhishekholagunditrading@gmail.com\n');
    console.log('   CITIZEN 4: Sudhakar');
    console.log('   └─ sudhakarsonkar007@gmail.com\n');
    console.log('════════════════════════════════════════');
    console.log('🔐 ALL PASSWORDS: 123456789');
    console.log('════════════════════════════════════════\n');

    db.close();
});
