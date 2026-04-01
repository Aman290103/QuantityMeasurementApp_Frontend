/**
 * Quantity Nexus - Auth Service
 * Modular authentication management
 */

export class AuthService {
    constructor() {
        // Mock Backend (JSON Server)
        // this.apiUrl = 'http://127.0.0.1:3000/users';

        // Real .NET Backend
        this.apiUrl = 'http://127.0.0.1:5076/api/v1/auth';
        this.user = JSON.parse(localStorage.getItem('user')) || null;
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Login failed');
            }
            
            const result = await response.json();
            this.user = { 
                fullName: result.fullName, 
                email: result.email,
                token: result.token
            };
            
            localStorage.setItem('user', JSON.stringify(this.user));
            this.showToast(`Welcome, ${result.fullName}!`, 'success');
            return true;
        } catch (error) {
            this.showToast(error.message, 'error');
            return false;
        }
    }

    async signup(userData) {
        try {
            // Mapping frontend data to .NET RegisterDTO
            const payload = {
                FullName: userData.fullName,
                Email: userData.email,
                Password: userData.password
            };

            const response = await fetch(`${this.apiUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                this.showToast('Account created successfully!', 'success');
                return true;
            } else {
                const err = await response.json();
                throw new Error(err.message || 'Registration failed');
            }
        } catch (error) {
            this.showToast(error.message, 'error');
            return false;
        }
    }

    logout() {
        this.user = null;
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    checkAuth(requireAuth = false) {
        if (!this.user && requireAuth) {
            window.location.href = 'login.html';
            return null;
        }
        return this.user;
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}
