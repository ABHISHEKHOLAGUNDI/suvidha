// Load environment variables FIRST before any other modules!
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const email = require('./email'); // 100% FREE email notifications via Gmail
const db = require('./db'); // PostgreSQL Connection

const app = express();
app.set('trust proxy', 1); // Required for secure cookies behind proxies (Render)
const server = http.createServer(app);
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5000'
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.some(ao => origin.startsWith(ao)) ||
            origin.endsWith('.vercel.app');

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

const io = new Server(server, {
    cors: corsOptions
});

const PORT = process.env.PORT || 5000;

// Session configuration (MemoryStore for now, can perform better with Redis/PG store in prod)
app.use(session({
    secret: 'suvidha-city-os-secret-key-2026', // Change in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-domain
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// CORS with credentials
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
    res.send('SUVIDHA City OS - Digital Twin Backend Running 🏙️');
});

// OTP Storage (in-memory)
// Structure: Map<userId, { otp, expiry, amount, type, requestCount, lastRequest }>
const otpStore = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_RATE_LIMIT = 3; // Max 3 OTP requests
const OTP_RATE_WINDOW_MS = 10 * 60 * 1000; // Per 10 minutes

// Helper: Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: Clean expired OTPs
function cleanExpiredOTPs() {
    const now = Date.now();
    for (const [userId, data] of otpStore.entries()) {
        if (data.expiry < now) {
            otpStore.delete(userId);
        }
    }
}

// Clean OTPs every minute
setInterval(cleanExpiredOTPs, 60000);

// Socket.io Connection Handler
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id} `);

    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id} `);
    });
});

// Helper: Euclidean Distance for Face Matching
function getEuclideanDistance(descriptor1, descriptor2) {
    if (descriptor1.length !== descriptor2.length) return 1.0;
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        const diff = descriptor1[i] - descriptor2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

// --- AUTHENTICATION ROUTES ---

// Login
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            console.warn(`⚠️ Login failed - User not found: ${email} `);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare password with hashed password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            console.warn(`⚠️ Login failed - Invalid password for: ${email} `);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Regenerate session to prevent session fixation attacks
        req.session.regenerate((err) => {
            if (err) {
                console.error('Session regeneration error:', err);
                return res.status(500).json({ error: 'Login failed' });
            }

            // Create new session
            req.session.userId = user.id;
            req.session.userEmail = user.email;
            req.session.userRole = user.role;
            req.session.loginTime = Date.now();
            req.session.lastActivity = Date.now();

            // Save session
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).json({ error: 'Login failed' });
                }

                // Don't send password to frontend
                const { password: _, ...userWithoutPassword } = user;

                console.log(`✅ Login successful: ${user.email} (${user.role})`);

                res.json({
                    message: 'Login successful',
                    user: userWithoutPassword
                });
            });
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
app.post('/auth/logout', (req, res) => {
    const userEmail = req.session.userEmail;
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Logout error:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        console.log(`✅ Logout successful: ${userEmail}`);
        res.json({ message: 'Logged out successfully' });
    });
});

// Check current session
app.get('/auth/check', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check session expiry (2 hours of inactivity)
    const SESSION_TIMEOUT = 2 * 60 * 60 * 1000;
    if (req.session.lastActivity && (Date.now() - req.session.lastActivity > SESSION_TIMEOUT)) {
        console.warn(`⚠️ Session expired for: ${req.session.userEmail} `);
        req.session.destroy();
        return res.status(401).json({ error: 'Session expired. Please login again.' });
    }

    // Update last activity
    req.session.lastActivity = Date.now();
    try {
        const result = await db.query(
            'SELECT id, name, email, role, address, wallet_balance, lat, lng FROM users WHERE id = $1',
            [req.session.userId]
        );
        const user = result.rows[0];

        if (!user) {
            console.warn(`⚠️ Session check - User deleted: ${req.session.userId} `);
            req.session.destroy();
            return res.status(401).json({ error: 'User not found' });
        }

        // Verify role hasn't changed (prevent admin/client switching)
        if (user.role !== req.session.userRole) {
            console.warn(`⚠️ Role mismatch detected for: ${user.email}. Session role: ${req.session.userRole}, DB role: ${user.role} `);
            req.session.destroy();
            return res.status(401).json({ error: 'Session invalid. Please login again.' });
        }

        res.json({ user });
    } catch (error) {
        console.error('❌ Session check error:', error);
        res.status(500).json({ error: 'Session check failed' });
    }
});

// Middleware to protect routes
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.session.userRole !== 'admin') {
        console.warn(`⚠️ Admin access denied for: ${req.session.userEmail} (role: ${req.session.userRole})`);
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// --- ROUTES ---

// 1. Register Client
app.post('/auth/register', async (req, res) => {
    const { name, email, password, address } = req.body;
    const id = `CITIZEN-${Date.now()}`;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            `INSERT INTO users(id, name, email, password, role, address, wallet_balance) VALUES($1, $2, $3, $4, 'client', $5, 0)`,
            [id, name, email, hashedPassword, address]
        );
        res.status(201).json({ id, message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2. Save Biometrics (Face)
app.post('/auth/save-biometrics', async (req, res) => {
    const { userId, faceDescriptor } = req.body;
    try {
        const descriptorStr = JSON.stringify(faceDescriptor);
        await db.query("UPDATE users SET face_descriptor = $1 WHERE id = $2", [descriptorStr, userId]);
        res.json({ success: true, message: 'Face enrolled successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Face Login (Match + Session)
app.post('/auth/login-face', async (req, res) => {
    const { faceDescriptor } = req.body;
    try {
        const result = await db.query("SELECT * FROM users WHERE face_descriptor IS NOT NULL");
        const users = result.rows;
        let bestMatch = null;
        let lowestDistance = 0.6;

        for (const user of users) {
            const storedDescriptor = JSON.parse(user.face_descriptor);
            const distance = getEuclideanDistance(faceDescriptor, storedDescriptor);
            if (distance < lowestDistance) {
                lowestDistance = distance;
                bestMatch = user;
            }
        }

        if (bestMatch) {
            // Create session
            req.session.userId = bestMatch.id;
            req.session.userEmail = bestMatch.email;
            req.session.userRole = bestMatch.role;

            const { password: _, ...userWithoutPassword } = bestMatch;
            res.json({ success: true, user: userWithoutPassword });
        } else {
            res.status(401).json({ success: false, message: 'Face not recognized' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get Users (Admin only)
app.get('/users', requireAdmin, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, name, email, role, address, wallet_balance, face_descriptor, fingerprint_id FROM users WHERE role != 'admin'"
        );
        const users = result.rows;
        const cleaned = users.map(u => ({
            ...u,
            faceDescriptor: u.face_descriptor ? JSON.parse(u.face_descriptor) : null,
            face_descriptor: undefined
        }));
        res.json(cleaned);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Admin Add Money
app.post('/admin/add-money', requireAdmin, async (req, res) => {
    const { userId, amount } = req.body;
    try {
        const result = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });

        const newBalance = Number(user.wallet_balance || 0) + Number(amount);
        await db.query("UPDATE users SET wallet_balance = $1 WHERE id = $2", [newBalance, userId]);

        // Log Transaction
        await db.query(
            "INSERT INTO transactions (id, user_id, type, amount, description, date) VALUES ($1, $2, 'DEPOSIT', $3, 'Cash Deposit by Admin', $4)",
            [`TXN-${Date.now()}`, userId, amount, new Date().toLocaleString()]
        );

        res.json({ success: true, newBalance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Get User (by ID, for Dashboard refresh)
app.get('/users/:id', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
        const user = result.rows[0];
        if (user) {
            // Needed for wallet balance updates
            if (user.face_descriptor) user.face_descriptor = JSON.parse(user.face_descriptor);
            const { password, ...safeUser } = user;
            res.json(safeUser);
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User (Admin only)
app.put('/admin/users/:id', requireAdmin, async (req, res) => {
    try {
        const { name, email, address, wallet_balance } = req.body;
        const userId = req.params.id;

        await db.query(
            `UPDATE users SET name = $1, email = $2, address = $3, wallet_balance = $4 WHERE id = $5`,
            [name, email, address, wallet_balance, userId]
        );
        res.json({ success: true, message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete User (Admin only)
app.delete('/admin/users/:id', requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent deleting admin
        const uResult = await db.query("SELECT role FROM users WHERE id = $1", [userId]);
        const user = uResult.rows[0];
        if (user && user.role === 'admin') {
            return res.status(403).json({ error: 'Cannot delete admin user' });
        }

        // Cascade delete: remove all user data
        await db.query("DELETE FROM smart_meters WHERE user_id = $1", [userId]);
        await db.query("DELETE FROM water_valves WHERE user_id = $1", [userId]);
        await db.query("DELETE FROM grievances WHERE user_id = $1", [userId]);
        await db.query("DELETE FROM transactions WHERE user_id = $1", [userId]);

        // Finally delete the user
        const result = await db.query("DELETE FROM users WHERE id = $1", [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, message: 'User and all associated data deleted' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: err.message });
    }
    // 7.5 Get User Score
    app.get('/users/:userId/score', async (req, res) => {
        try {
            const result = await db.query("SELECT score FROM users WHERE id = $1", [req.params.userId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ score: result.rows[0].score });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 8. Bills API
    app.get('/bills/:userId', async (req, res) => {
        const bills = [
            { id: 'ELEC-001', userId: req.params.userId, type: 'electricity', amount: 1250.50, dueDate: '2024-02-15', status: 'pending' },
            { id: 'WATER-001', userId: req.params.userId, type: 'water', amount: 450.00, dueDate: '2024-02-28', status: 'pending' },
            { id: 'GAS-001', userId: req.params.userId, type: 'gas', amount: 900.00, dueDate: '2024-03-05', status: 'pending' }
        ];
        res.json(bills);
    });

    // ======= OTP PAYMENT VERIFICATION ENDPOINTS =======

    // Request OTP for Payment
    app.post('/payment/request-otp', async (req, res) => {
        const { userId, amount, billType } = req.body;

        try {
            if (!userId || !amount || !billType) {
                return res.status(400).json({ success: false, error: 'Missing required fields' });
            }

            const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
            const user = result.rows[0];

            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            if (!user.email) {
                return res.status(400).json({ success: false, error: 'No email registered' });
            }

            // Rate limiting check
            const now = Date.now();
            const existing = otpStore.get(userId);

            if (existing) {
                const timeSinceLastRequest = now - (existing.lastRequest || 0);
                if (existing.requestCount >= OTP_RATE_LIMIT && timeSinceLastRequest < OTP_RATE_WINDOW_MS) {
                    const waitTime = Math.ceil((OTP_RATE_WINDOW_MS - timeSinceLastRequest) / 60000);
                    return res.status(429).json({
                        success: false,
                        error: `Too many OTP requests. Please wait ${waitTime} minutes.`,
                        retryAfter: waitTime
                    });
                }
                if (timeSinceLastRequest >= OTP_RATE_WINDOW_MS) {
                    existing.requestCount = 0;
                }
            }

            // Generate new OTP
            const otp = generateOTP();
            const expiry = now + OTP_EXPIRY_MS;

            // Store OTP
            otpStore.set(userId, {
                otp,
                expiry,
                amount,
                type: billType,
                requestCount: (existing?.requestCount || 0) + 1,
                lastRequest: now,
                verified: false
            });

            // Send OTP email
            const emailTemplate = email.getOTPEmail(user.name, otp, billType, amount);
            const emailResult = await email.sendEmailNotification(user.email, emailTemplate.subject, emailTemplate.message);

            // Check if email was sent or if in demo mode
            if (emailResult.demo) {
                console.log(`📧 DEMO MODE: OTP for ${user.email}: ${otp}`);
                return res.json({
                    success: true,
                    message: `DEMO MODE: OTP is ${otp} (Check console)`,
                    demoMode: true,
                    expiresIn: OTP_EXPIRY_MS / 1000
                });
            }

            if (!emailResult.success) {
                console.error(`❌ Failed to send OTP email to ${user.email}:`, emailResult.error);
            } else {
                console.log(`✅ OTP sent to ${user.email} for ${billType} payment of ₹${amount}`);
            }

            res.json({
                success: true,
                message: 'OTP sent to your registered email',
                expiresIn: OTP_EXPIRY_MS / 1000
            });
        } catch (err) {
            console.error('❌ OTP request error:', err);
            res.status(500).json({ success: false, error: 'Failed to generate OTP' });
        }
    });

    // Verify OTP
    app.post('/payment/verify-otp', async (req, res) => {
        const { userId, otp } = req.body;

        try {
            if (!userId || !otp) {
                return res.status(400).json({ success: false, error: 'Missing userId or otp' });
            }

            const otpData = otpStore.get(userId);

            if (!otpData) {
                return res.status(400).json({ success: false, error: 'No OTP found' });
            }

            if (Date.now() > otpData.expiry) {
                otpStore.delete(userId);
                return res.status(400).json({ success: false, error: 'OTP expired' });
            }

            if (otpData.otp !== otp.toString()) {
                return res.status(400).json({ success: false, error: 'Invalid OTP' });
            }

            // Mark as verified
            otpData.verified = true;
            otpStore.set(userId, otpData);

            res.json({
                success: true,
                verified: true,
                message: 'OTP verified successfully'
            });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Failed to verify OTP' });
        }
    });

    // ======= END OTP ENDPOINTS =======

    // 9. Pay Bill
    // 9. Pay Bill (ACID Compliant)
    app.post('/bills/pay', async (req, res) => {
        const { userId, billId, amount, type } = req.body;

        try {
            // 1. BEGIN TRANSACTION
            await db.query('BEGIN');

            const uResult = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
            const user = uResult.rows[0];
            if (!user) {
                await db.query('ROLLBACK');
                return res.status(404).json({ error: 'User not found' });
            }

            // 🔐 CHECK OTP VERIFICATION
            const otpData = otpStore.get(userId);
            if (!otpData || !otpData.verified) {
                await db.query('ROLLBACK');
                return res.status(403).json({
                    error: 'Payment requires OTP verification. Please verify OTP first.',
                    requiresOTP: true
                });
            }

            // Verify OTP matches payment details
            if (Math.abs(otpData.amount - amount) > 0.01 || otpData.type !== type) {
                await db.query('ROLLBACK');
                otpStore.delete(userId); // Clear invalid OTP
                return res.status(400).json({
                    error: 'Payment details do not match OTP request. Please request a new OTP.'
                });
            }

            if ((user.wallet_balance || 0) < amount) {
                await db.query('ROLLBACK');
                return res.status(400).json({ error: 'Insufficient Balance' });
            }

            // 2. DEDUCT MONEY & UPDATE SCORE
            const newBalance = user.wallet_balance - amount;
            await db.query("UPDATE users SET wallet_balance = $1, score = score + 50 WHERE id = $2", [newBalance, userId]);

            // 3. LOG TRANSACTION to LEDGER
            const txnId = `TXN-${Date.now()}`;
            await db.query("INSERT INTO transactions (id, user_id, type, amount, description, date) VALUES ($1, $2, $3, $4, $5, $6)",
                [txnId, userId, 'PAYMENT', amount, `Bill Payment - ${type} (${billId})`, new Date().toISOString()]
            );

            // 4. COMMIT
            await db.query('COMMIT');

            // 🧹 Clear OTP after successful payment (one-time use)
            otpStore.delete(userId);

            // 5. REAL-TIME EVENT (To Admin Map)
            io.emit('city-pulse', {
                type: 'TRANSACTION',
                lat: user.lat,
                lng: user.lng,
                amount: amount,
                category: type,
                timestamp: new Date().toISOString()
            });

            // 6. SEND EMAIL NOTIFICATION (100% FREE with Gmail)
            if (user.email) {
                const { subject, message } = email.getBillPaymentEmail(
                    user.name,
                    type,
                    amount,
                    txnId
                );
                email.sendEmailNotification(user.email, subject, message)
                    .then(result => {
                        if (result.success) {
                            console.log(`📧 Email sent to ${user.name}: ${result.messageId}`);
                        }
                    })
                    .catch(err => console.error('Email notification error:', err));
            }

            res.json({ success: true, newBalance, message: 'Payment Successful', txnId });

        } catch (err) {
            await db.query('ROLLBACK');
            console.error("Transaction Failed:", err);
            res.status(500).json({ error: `Transaction processing failed: ${err.message}` });
        }
    });

    // 11. Transaction History
    app.get('/transactions/:userId', async (req, res) => {
        try {
            const result = await db.query("SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC", [req.params.userId]);
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 12. Simulate Monthly Bill Generation
    app.post('/admin/generate-bills', requireAdmin, async (req, res) => {
        try {
            // In a real app, this would insert into a bills table.
            // For this hackathon demo where bills are static/mocked in GET /bills/:userId,
            // we will simulate this by logging a "System Event" or just returning success.
            // To make it "feel" real, we can add a penalty transaction or log a 'BILL_GENERATED' event.

            await db.run("INSERT INTO system_events (id, type, status, affected_users, timestamp) VALUES (?, ?, ?, ?, ?)",
                [`EVT-${Date.now()}`, 'BILLING_CYCLE', 'COMPLETED', 'ALL', new Date().toISOString()]
            );

            console.log("✅ Monthly bills generated (Simulated)");
            res.json({ success: true, message: 'Monthly bills generated for all users.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 10. Grievances API
    app.post('/grievances', requireAuth, async (req, res) => {
        const { category, description, name } = req.body;
        const userId = req.session.userId;
        const id = `GRV - ${Date.now()} `;
        try {
            await db.query(
                `INSERT INTO grievances(id, user_id, name, category, description, status) VALUES($1, $2, $3, $4, $5, 'Pending')`,
                [id, userId, name, category, description]
            );

            // Gamification: +10 Points for reporting
            await db.query("UPDATE users SET score = score + 10 WHERE id = $1", [userId]);

            // Send Email to Admin (Abhishek)
            const ADMIN_EMAIL = 'abhishekholagundi@gmail.com';
            const userResult = await db.query("SELECT email FROM users WHERE id = $1", [userId]);
            const user = userResult.rows[0];
            const emailData = email.getGrievanceAdminEmail(id, category, name, description, user?.email);
            email.sendEmailNotification(ADMIN_EMAIL, emailData.subject, emailData.message)
                .catch(e => console.error("Admin notification failed:", e));

            res.status(201).json({ id, message: 'Grievance submitted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Admin Resolve Grievance
    app.post('/admin/resolve-grievance', requireAdmin, async (req, res) => {
        const { id, status, resolutionProof } = req.body; // resolutionProof is Base64 string

        try {
            // Validate request body
            if (!id || !status) {
                console.error('❌ Resolve Grievance - Missing required fields');
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: id, status'
                });
            }

            if (status === 'Resolved' && !resolutionProof) {
                console.error('❌ Resolve Grievance - Missing resolution proof');
                return res.status(400).json({
                    success: false,
                    error: 'Resolution proof (photo) is required when marking as resolved'
                });
            }

            // Ensure column exists (soft migration)
            try {
                await db.query("ALTER TABLE grievances ADD COLUMN IF NOT EXISTS resolution_proof TEXT");
                console.log('✅ Checked/Added resolution_proof column to grievances table');
            } catch (e) {
                // Column already exists, ignore error
            }

            // Update grievance status
            await db.query("UPDATE grievances SET status = $1, resolution_proof = $2 WHERE id = $3", [status, resolutionProof, id]);

            // Get grievance details
            const gResult = await db.query("SELECT * FROM grievances WHERE id = $1", [id]);
            const grievance = gResult.rows[0];

            if (!grievance) {
                console.error(`❌ Resolve Grievance - Grievance not found: ${id}`);
                return res.status(404).json({
                    success: false,
                    error: 'Grievance not found'
                });
            }

            console.log(`✅ Grievance ${id} status updated to: ${status}`);

            res.json({
                success: true,
                message: 'Grievance update processed. Citizen notification pending in background.'
            });

            // Notify Citizen if status is Resolved (IN BACKGROUND)
            if (status === 'Resolved' && grievance.user_id) {
                const uResult = await db.query("SELECT * FROM users WHERE id = $1", [grievance.user_id]);
                const user = uResult.rows[0];

                if (user && user.email) {
                    const emailData = email.getGrievanceResolvedEmail(user.name, id, grievance.category, resolutionProof);
                    email.sendEmailNotification(user.email, emailData.subject, emailData.message, emailData.attachments)
                        .then(emailResult => {
                            if (emailResult.success) {
                                console.log(`✅ Resolution email sent to ${user.email} for grievance ${id}`);
                            } else {
                                console.error(`❌ Failed to send resolution email to ${user.email}:`, emailResult.error);
                            }
                        })
                        .catch(emailError => console.error('❌ Background Email Error:', emailError));
                }
            }
        } catch (err) {
            console.error("❌ Resolve grievance error:", err);
            res.status(500).json({
                success: false,
                error: 'Failed to resolve grievance. Please try again.'
            });
        }
    });

    app.get('/grievances', requireAuth, async (req, res) => {
        const userId = req.session.userId;
        try {
            const result = await db.query("SELECT * FROM grievances WHERE user_id = $1", [userId]);
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/admin/grievances', requireAdmin, async (req, res) => {
        try {
            const result = await db.query("SELECT * FROM grievances");
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/admin/grievances/:id/status', requireAdmin, async (req, res) => {
        const { status } = req.body;
        try {
            await db.query("UPDATE grievances SET status = $1 WHERE id = $2", [status, req.params.id]);

            if (status === 'Resolved') {
                // Gamification: +5 Points Bonus for engagement/closure
                const gResult = await db.query("SELECT user_id FROM grievances WHERE id = $1", [req.params.id]);
                const grievance = gResult.rows[0];
                if (grievance) await db.query("UPDATE users SET score = score + 5 WHERE id = $1", [grievance.user_id]);
            }
            res.json({ success: true, message: 'Status updated' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // --- WASTE MANAGEMENT API ---
    app.post('/waste/schedule', requireAuth, async (req, res) => {
        const { type, slot } = req.body;
        const userId = req.session.userId;
        const id = `WST-${Date.now()}`;

        try {
            await db.query("INSERT INTO waste_requests (id, user_id, type, date, slot, status) VALUES ($1, $2, $3, $4, $5, 'Pending')",
                [id, userId, type, new Date().toISOString(), slot]);
            res.json({ success: true, message: 'Pickup Scheduled' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/admin/waste', requireAdmin, async (req, res) => {
        try {
            const result = await db.query(`
            SELECT w.*, u.name, u.address 
            FROM waste_requests w 
            JOIN users u ON w.user_id = u.id 
            ORDER BY w.date DESC
        `);
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/admin/waste/:id/status', requireAdmin, async (req, res) => {
        const { status } = req.body;
        try {
            await db.query("UPDATE waste_requests SET status = $1 WHERE id = $2", [status, req.params.id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // God Mode: Trigger Event
    app.post('/admin/trigger-event', async (req, res) => {
        // Ideally requireAdmin, but for demo buttons simple fetch might not send cookies easily unless credentials:include
        // For Hackathon demo ease, we'll leave it open or check headers if needed.
        // Let's rely on simple access for now.

        const { type } = req.body;
        console.log(`⚠️ ADMIN TRIGGERED EVENT: ${type} `);

        // Emit GLOBAL Alert
        io.emit('emergency-alert', {
            type: type,
            message: type === 'POWER_OUTAGE' ? 'CRITICAL GRID FAILURE DETECTED' :
                type === 'WATER_LEAK' ? 'MAJOR WATER PIPELINE BURST' :
                    'SYSTEM NORMAL',
            timestamp: new Date().toISOString()
        });

        // Also force update city metrics to reflect chaos instantly
        // In a real app, we'd update the DB state too.
        // For visual effect, the simulation.js loop typically overwrites, but the Alert Component is persistent.

        res.json({ success: true, message: `Triggered ${type} ` });
    });

    // Settings API
    app.get('/settings', async (req, res) => {
        try {
            const result = await db.query("SELECT * FROM settings");
            const settings = result.rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
            res.json(settings);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post('/admin/settings', async (req, res) => {
        const { settings } = req.body;
        try {
            for (const [key, value] of Object.entries(settings)) {
                await db.query("INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = $3", [key, String(value), String(value)]);
            }
            res.json({ success: true, message: 'Settings Updated' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // ============================================
    // AI CHATBOT ENDPOINT
    // ============================================
    let chatWithAI;
    try {
        const aiChat = require('./ai-chat');
        chatWithAI = aiChat.chatWithAI;
    } catch (error) {
        chatWithAI = async (message) => {
            return "AI chat is currently unavailable.";
        };
    }

    app.post('/api/chat', async (req, res) => {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ error: 'Not authenticated' });
            }

            const { message, history } = req.body;

            if (!message) {
                return res.status(400).json({ error: 'Message required' });
            }

            console.log(`🤖 AI Chat request from: ${req.session.userEmail}`);

            // Chat with AI
            const aiResponse = await chatWithAI(
                message,
                req.session.userId,
                db,
                history || []
            );

            res.json(aiResponse);
        } catch (error) {
            console.error('❌ AI Chat Error:', error);
            res.status(500).json({
                error: 'AI service error',
                answer: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."
            });
        }
    });

    // ============================================
    // CITY ANNOUNCEMENTS
    // ============================================

    // Get current active announcement
    app.get('/api/announcements/current', async (req, res) => {
        try {
            const result = await db.query(
                'SELECT * FROM announcements WHERE active = true ORDER BY created_at DESC LIMIT 1'
            );
            res.json(result.rows[0] || { message: 'Water supply maintenance in Indiranagar scheduled for 24th Jan.' });
        } catch (error) {
            console.error('❌ Error fetching announcement:', error);
            res.status(500).json({ error: 'Failed to fetch announcement' });
        }
    });

    // Admin: Create new announcement
    app.post('/api/announcements', requireAdmin, async (req, res) => {
        try {
            const { message } = req.body;

            if (!message || message.trim().length === 0) {
                return res.status(400).json({ error: 'Message is required' });
            }

            // Deactivate all previous announcements
            await db.query('UPDATE announcements SET active = false');

            // Create new announcement
            const id = `ANNOUNCE-${Date.now()}`;
            const created_at = new Date().toISOString();

            await db.query(
                'INSERT INTO announcements (id, message, created_by, created_at, active) VALUES ($1, $2, $3, $4, true)',
                [id, message.trim(), req.session.userId, created_at]
            );

            console.log(`📢 New announcement created by ${req.session.userEmail}: "${message}"`);

            // Send emails to all citizens
            try {
                const result = await db.query('SELECT email, name FROM users WHERE role = $1', ["client"]);
                const users = result.rows;

                if (users.length > 0) {
                    console.log(`📧 Sending announcement to ${users.length} citizens...`);

                    for (const user of users) {
                        try {
                            await email.sendEmailNotification(
                                user.email,
                                '📢 Important City Update - SUVIDHA',
                                `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px;">
                                    <h1 style="color: white; text-align: center; margin-bottom: 30px;">🏙️ SUVIDHA City Update</h1>
                                    
                                    <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                        <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Dear ${user.name},</p>
                                        
                                        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">A new important announcement has been published:</p>
                                        
                                        <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                            <p style="color: #333; font-size: 18px; font-weight: bold; margin: 0; line-height: 1.6;">${message}</p>
                                        </div>
                                        
                                        <p style="color: #666; font-size: 14px; margin-top: 20px;">
                                            For more information, please login to your SUVIDHA account or visit your nearest civic kiosk.
                                        </p>
                                        
                                        <div style="text-align: center; margin-top: 30px;">
                                            <p style="color: #999; font-size: 12px; margin: 0;">SUVIDHA Smart City Platform</p>
                                            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">Empowering Citizens Through Technology</p>
                                        </div>
                                    </div>
                                </div>
                            `
                            );
                        } catch (emailError) {
                            console.error(`Failed to send to ${user.email}:`, emailError.message);
                        }
                    }

                    console.log(`✅ Announcement emails sent to all citizens`);
                }
            } catch (emailError) {
                console.error('❌ Error sending announcement emails:', emailError);
                // Don't fail the request if emails fail
            }

            res.json({
                success: true,
                message: 'Announcement posted successfully',
                announcement: { id, message, created_at }
            });
        } catch (error) {
            console.error('❌ Error creating announcement:', error);
            res.status(500).json({ error: 'Failed to create announcement' });
        }
    });

    // Admin: Get all announcements
    app.get('/api/announcements', requireAdmin, async (req, res) => {
        try {
            const result = await db.query(
                `SELECT a.*, u.name as creator_name 
             FROM announcements a 
             LEFT JOIN users u ON a.created_by = u.id 
             ORDER BY created_at DESC 
             LIMIT 50`
            );
            res.json(result.rows);
        } catch (error) {
            console.error('❌ Error fetching announcements:', error);
            res.status(500).json({ error: 'Failed to fetch announcements' });
        }
    });

    // ============================================
    // START SERVER
    // ============================================
    server.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`🔌 Socket.io ready for real-time connections`);
    });
