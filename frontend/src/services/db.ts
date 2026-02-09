// LocalDB - A mock backend using localStorage for persistence

export interface Bill {
    id: string;
    userId: string;
    type: 'electricity' | 'water' | 'gas';
    amount: number;
    dueDate: string;
    status: 'paid' | 'overdue' | 'pending';
}

export interface Grievance {
    id: string;
    userId: string;
    name: string;
    category: string;
    description: string;
    status: 'Pending' | 'Received' | 'In Progress' | 'Resolved' | 'Rejected';
    date: string;
    timeline: { status: string; date: string; completed: boolean; active?: boolean }[];
}

export interface WasteRequest {
    id: string;
    userId: string;
    type: string;
    date: string;
    status: 'Scheduled' | 'Completed';
}

const DB_KEYS = {
    BILLS: 'suvidha_bills',
    GRIEVANCES: 'suvidha_grievances',
    WASTE: 'suvidha_waste',
    WALLET: 'suvidha_wallet_v1', // Deprecated in favor of User.balance
    USERS: 'suvidha_users_v2', // Schema V2
    INIT: 'suvidha_init_v3', // Force re-seed
    SESSION: 'suvidha_session'
};

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'citizen' | 'admin';
    address: string;
    walletBalance: number;
    faceDescriptor?: number[];
    fingerprintId?: string;
}

export interface Transaction {
    id: string;
    userId: string;
    type: 'DEPOSIT' | 'PAYMENT' | 'REFUND';
    amount: number;
    description: string;
    date: string;
    refId?: string;
}

class LocalDBService {
    constructor() {
        this.init();
    }

    private init() {
        if (!localStorage.getItem(DB_KEYS.INIT)) {
            console.log('Initializing LocalDB V3 (Multi-Tenant)...');

            // Seed Users
            const seedUsers: User[] = [
                {
                    id: '8829-1122-9900',
                    name: 'Abhishek Holagundi',
                    email: 'abhishek@city.com',
                    password: '123',
                    role: 'citizen',
                    address: 'Indiranagar, Bangalore',
                    walletBalance: 500
                },
                {
                    id: '7744-5566-3322',
                    name: 'Vinay Kumar',
                    email: 'vinay@city.com',
                    password: '123',
                    role: 'citizen',
                    address: 'Koramangala, Bangalore',
                    walletBalance: 1200
                },
                {
                    id: '6655-4433-2211',
                    name: 'Varun Sharma',
                    email: 'varun@city.com',
                    password: '123',
                    role: 'citizen',
                    address: 'Whitefield, Bangalore',
                    walletBalance: 50
                },
                {
                    id: 'ADMIN-001',
                    name: 'City Admin',
                    email: 'admin@city.com',
                    password: 'admin',
                    role: 'admin',
                    address: 'City Hall',
                    walletBalance: 0
                }
            ];

            // Seed Bills
            const seedBills: Bill[] = [
                { id: 'ELEC-Abhi', userId: '8829-1122-9900', type: 'electricity', amount: 1256.26, dueDate: '2024-01-15', status: 'overdue' },
                { id: 'WATER-Vinay', userId: '7744-5566-3322', type: 'water', amount: 450, dueDate: '2024-01-28', status: 'pending' },
                { id: 'GAS-Varun', userId: '6655-4433-2211', type: 'gas', amount: 900, dueDate: '2024-02-01', status: 'pending' }
            ];

            // Seed Grievances
            const seedGrievances: Grievance[] = [
                {
                    id: 'TK-Abhi-1',
                    userId: '8829-1122-9900',
                    name: 'Abhishek Holagundi',
                    category: 'Street Light',
                    description: 'Street light not working near 2nd Main.',
                    status: 'In Progress',
                    date: new Date().toLocaleDateString('en-IN'),
                    timeline: [
                        { status: "Complaint Received", date: "20 Jan", completed: true },
                        { status: "In Progress", date: "Today", completed: true, active: true },
                        { status: "Resolved", date: "Pending", completed: false }
                    ]
                }
            ];

            const seedTransactions: Transaction[] = [
                { id: 'TXN-1', userId: '8829-1122-9900', type: 'DEPOSIT', amount: 500, description: 'Opening Balance', date: '21/01/2026' },
                { id: 'TXN-2', userId: '7744-5566-3322', type: 'DEPOSIT', amount: 1200, description: 'Opening Balance', date: '21/01/2026' }
            ];

            localStorage.setItem(DB_KEYS.BILLS, JSON.stringify(seedBills));
            localStorage.setItem(DB_KEYS.GRIEVANCES, JSON.stringify(seedGrievances));
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(seedUsers));
            localStorage.setItem(DB_KEYS.WALLET, JSON.stringify(seedTransactions)); // Reuse key for transaction log
            localStorage.setItem(DB_KEYS.WASTE, JSON.stringify([]));
            localStorage.setItem(DB_KEYS.INIT, 'true');
        }
    }

    // AUTH & SESSION
    login(email: string): User | undefined {
        const user = this.getUsers().find(u => u.email === email);
        if (user) {
            localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(user));
        }
        return user;
    }

    logout() {
        localStorage.removeItem(DB_KEYS.SESSION);
    }

    getCurrentUser(): User | null {
        return JSON.parse(localStorage.getItem(DB_KEYS.SESSION) || 'null');
    }

    // USERS
    getUsers(): User[] {
        return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    }

    getUser(email: string): User | undefined {
        return this.getUsers().find(u => u.email === email);
    }

    getUserById(id: string): User | undefined {
        return this.getUsers().find(u => u.id === id);
    }

    addUser(user: User) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    }

    updateUser(updatedUser: User) {
        let users = this.getUsers();
        users = users.map(u => u.id === updatedUser.id ? updatedUser : u);
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

        // Update Session if it's current user
        const current = this.getCurrentUser();
        if (current && current.id === updatedUser.id) {
            localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(updatedUser));
        }
    }

    // BILLS
    getBills(userId?: string): Bill[] {
        const all = JSON.parse(localStorage.getItem(DB_KEYS.BILLS) || '[]');
        if (userId) return all.filter((b: Bill) => b.userId === userId);
        return all;
    }

    getBill(billId: string, userId: string): Bill | undefined {
        return this.getBills(userId).find(b => b.id === billId);
    }

    payBill(billId: string, userId: string): boolean {
        // 1. Get User to check Balance
        const users = this.getUsers();
        const userIdx = users.findIndex(u => u.id === userId);
        if (userIdx === -1) return false;

        const user = users[userIdx];

        // 2. Get Bill
        const allBills = this.getBills(); // Get all bills to find and update
        const bill = allBills.find(b => b.id === billId && b.userId === userId);

        if (bill && bill.status !== 'paid') {
            if (user.walletBalance >= bill.amount) {
                // Deduct Balance
                user.walletBalance -= bill.amount;
                this.updateUser(user);

                // Add Transaction
                this.addTransaction({
                    id: `TXN-${Date.now()}`,
                    userId: user.id,
                    type: 'PAYMENT',
                    amount: bill.amount,
                    description: `Bill Payment - ${bill.type}`,
                    date: new Date().toLocaleString()
                });

                // Update Bill
                bill.status = 'paid';
                bill.amount = 0;
                localStorage.setItem(DB_KEYS.BILLS, JSON.stringify(allBills));
                return true;
            }
        }
        return false;
    }

    // WALLET / TRANSACTIONS
    getTransactions(userId: string): Transaction[] {
        const all: Transaction[] = JSON.parse(localStorage.getItem(DB_KEYS.WALLET) || '[]');
        return all.filter(t => t.userId === userId);
    }

    addTransaction(t: Transaction) {
        const all: Transaction[] = JSON.parse(localStorage.getItem(DB_KEYS.WALLET) || '[]');
        all.unshift(t);
        localStorage.setItem(DB_KEYS.WALLET, JSON.stringify(all));
    }

    loadWallet(userId: string, amount: number) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            user.walletBalance += amount;
            this.updateUser(user);

            this.addTransaction({
                id: `TXN-${Date.now()}`,
                userId: user.id,
                type: 'DEPOSIT',
                amount: amount,
                description: 'Cash Deposit by Admin',
                date: new Date().toLocaleString()
            });
        }
    }

    // GRIEVANCES
    getGrievances(userId?: string): Grievance[] {
        const all = JSON.parse(localStorage.getItem(DB_KEYS.GRIEVANCES) || '[]');
        if (userId) return all.filter((g: Grievance) => g.userId === userId);
        return all;
    }

    getAllGrievances(): Grievance[] {
        return JSON.parse(localStorage.getItem(DB_KEYS.GRIEVANCES) || '[]');
    }

    addGrievance(g: Omit<Grievance, 'date' | 'timeline'>): Grievance {
        const grievances = this.getAllGrievances();
        const newGrievance: Grievance = {
            ...g,
            date: new Date().toLocaleDateString('en-IN'),
            timeline: [
                { status: "Complaint Received", date: "Just Now", completed: true, active: true },
                { status: "Processing", date: "Pending", completed: false },
                { status: "Resolved", date: "Pending", completed: false }
            ]
        };
        grievances.unshift(newGrievance);
        localStorage.setItem(DB_KEYS.GRIEVANCES, JSON.stringify(grievances));
        return newGrievance;
    }

    updateGrievanceStatus(id: string, newStatus: Grievance['status']) {
        const grievances = this.getAllGrievances();
        const g = grievances.find(i => i.id === id);
        if (g) {
            g.status = newStatus;

            // Auto Update Timeline based on status
            const timelineMap = {
                'Received': 0,
                'In Progress': 1,
                'Resolved': 2
            };

            const stageIndex = timelineMap[newStatus as keyof typeof timelineMap] ?? -1;

            if (stageIndex >= 0) {
                g.timeline = g.timeline.map((t, idx) => {
                    if (idx < stageIndex) return { ...t, completed: true, active: false };
                    if (idx === stageIndex) return { ...t, completed: true, active: true, date: "Just Now" };
                    return { ...t, completed: false, active: false };
                });
            }

            // Force resolve all if Resolved
            if (newStatus === 'Resolved') {
                g.timeline.forEach(t => t.completed = true);
                g.timeline[g.timeline.length - 1].active = true;
                g.timeline[g.timeline.length - 1].date = "Just Now";
            }
            localStorage.setItem(DB_KEYS.GRIEVANCES, JSON.stringify(grievances));
        }
    }

    // WASTE
    getWasteRequests(userId?: string): WasteRequest[] {
        const all = JSON.parse(localStorage.getItem(DB_KEYS.WASTE) || '[]');
        if (userId) return all.filter((r: WasteRequest) => r.userId === userId);
        return all;
    }

    addWasteRequest(type: string, userId: string): WasteRequest {
        const requests = this.getWasteRequests();
        const newReq: WasteRequest = {
            id: `PICK-${Math.floor(1000 + Math.random() * 9000)}`,
            userId,
            type,
            date: new Date().toLocaleDateString('en-IN'),
            status: 'Scheduled'
        };
        requests.push(newReq);
        localStorage.setItem(DB_KEYS.WASTE, JSON.stringify(requests));
        return newReq;
    }

    setSession(user: User) {
        localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(user));
    }
}

export const LocalDB = new LocalDBService();
