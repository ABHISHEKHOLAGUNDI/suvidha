export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fetch with credentials for session cookies
const fetchWithCredentials = (url: string, options: RequestInit = {}) => {
    return fetch(url, {
        ...options,
        credentials: 'include', // Important for session cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

export const api = {
    // ===== AUTHENTICATION =====
    async login(email: string, password: string) {
        const res = await fetchWithCredentials(`${API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Login failed');
        }
        return data;
    },

    async logout() {
        const res = await fetchWithCredentials(`${API_URL}/auth/logout`, {
            method: 'POST'
        });
        return res.json();
    },

    async getCurrentUser() {
        const res = await fetchWithCredentials(`${API_URL}/auth/check`);
        if (!res.ok) {
            return null;
        }
        const data = await res.json();
        return data.user;
    },

    async register(data: any) {
        const res = await fetchWithCredentials(`${API_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async loginBio(type: 'face' | 'fingerprint', data: any) {
        const endpoint = type === 'face' ? '/auth/login-face' : '/auth/login-finger';
        const res = await fetchWithCredentials(`${API_URL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async saveBiometrics(data: { userId: string, faceDescriptor: number[] }) {
        const res = await fetchWithCredentials(`${API_URL}/auth/save-biometrics`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // ===== USERS =====
    async getUsers() {
        const res = await fetchWithCredentials(`${API_URL}/users`);
        return res.json();
    },

    async getUser(id: string) {
        const res = await fetchWithCredentials(`${API_URL}/users/${id}`);
        if (!res.ok) return null;
        return res.json();
    },

    async updateUser(id: string, data: any) {
        const res = await fetchWithCredentials(`${API_URL}/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) {
            throw new Error(result.error || 'Update failed');
        }
        return result;
    },

    async deleteUser(userId: string) {
        const res = await fetchWithCredentials(`${API_URL}/admin/users/${userId}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Delete failed');
        }
        return data;
    },

    // ===== BILLS =====
    async getBills(userId: string) {
        const res = await fetchWithCredentials(`${API_URL}/bills/${userId}`);
        return res.json();
    },

    async payBill(userId: string, billId: string, amount: number, type: string) {
        const res = await fetchWithCredentials(`${API_URL}/bills/pay`, {
            method: 'POST',
            body: JSON.stringify({ userId, billId, amount, type })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Payment failed');
        }
        return res.json();
    },

    // ===== ADMIN =====
    async addFunds(userId: string, amount: number) {
        const res = await fetchWithCredentials(`${API_URL}/admin/add-money`, {
            method: 'POST',
            body: JSON.stringify({ userId, amount })
        });
        return res.json();
    },

    // ===== PAYMENT OTP =====
    async requestPaymentOTP(userId: string, amount: number, billType: string) {
        const res = await fetchWithCredentials(`${API_URL}/payment/request-otp`, {
            method: 'POST',
            body: JSON.stringify({ userId, amount, billType })
        });
        return res.json();
    },

    async verifyPaymentOTP(userId: string, otp: string) {
        const res = await fetchWithCredentials(`${API_URL}/payment/verify-otp`, {
            method: 'POST',
            body: JSON.stringify({ userId, otp })
        });
        return res.json();
    },

    // ===== GRIEVANCES =====
    async addGrievance(data: { name: string, category: string, description: string }) {
        const res = await fetchWithCredentials(`${API_URL}/grievances`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async getGrievances() {
        const res = await fetchWithCredentials(`${API_URL}/grievances`);
        return res.json();
    },

    async getAllGrievances() {
        const res = await fetchWithCredentials(`${API_URL}/admin/grievances`);
        return res.json();
    },

    async updateGrievanceStatus(id: string, status: string) {
        const res = await fetchWithCredentials(`${API_URL}/admin/grievances/${id}/status`, {
            method: 'POST',
            body: JSON.stringify({ status })
        });
        return res.json();
    },

    async resolveGrievance(id: string, status: string, resolutionProof: string) {
        const res = await fetchWithCredentials(`${API_URL}/admin/resolve-grievance`, {
            method: 'POST',
            body: JSON.stringify({ id, status, resolutionProof })
        });
        return res.json();
    },

    // ===== TRANSACTIONS =====
    async getTransactions(userId: string) {
        const res = await fetchWithCredentials(`${API_URL}/transactions/${userId}`);
        return res.json();
    },

    async generateMonthlyBills() {
        const res = await fetchWithCredentials(`${API_URL}/admin/generate-bills`, {
            method: 'POST'
        });
        return res.json();
    },

    // ===== GAMIFICATION & WASTE =====
    async getScore(userId: string) {
        const res = await fetchWithCredentials(`${API_URL}/users/${userId}/score`);
        return res.json();
    },

    async scheduleWastePickup(type: string, slot: string) {
        const res = await fetchWithCredentials(`${API_URL}/waste/schedule`, {
            method: 'POST',
            body: JSON.stringify({ type, slot })
        });
        return res.json();
    },

    async getWasteRequests() {
        const res = await fetchWithCredentials(`${API_URL}/admin/waste`);
        return res.json();
    },

    async updateWasteStatus(id: string, status: string) {
        const res = await fetchWithCredentials(`${API_URL}/admin/waste/${id}/status`, {
            method: 'POST',
            body: JSON.stringify({ status })
        });
        return res.json();
    }
};
