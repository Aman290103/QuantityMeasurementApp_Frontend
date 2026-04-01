/**
 * Quantity Nexus - History Service
 * Modular history management and reporting
 */

export class HistoryService {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('history')) || [];
    }

    add(type, fromStr, toStr) {
        const item = {
            id: Date.now(),
            type,
            from: fromStr,
            to: toStr,
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString()
        };
        
        this.history = [item, ...this.history.slice(0, 49)]; // Keep last 50
        localStorage.setItem('history', JSON.stringify(this.history));
        this.render();
    }

    render() {
        const list = document.getElementById('history-list');
        if (!list) return;

        if (this.history.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="inbox"></i>
                    <p>No activity records found</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        list.innerHTML = this.history.map(item => `
            <li class="history-item">
                <div class="hist-main">
                    <span class="hist-label badge">${item.type}</span>
                    <span class="hist-val">${item.from}</span>
                    <i data-lucide="chevrons-right" class="hist-arrow"></i>
                    <span class="hist-val success">${item.to}</span>
                </div>
                <div class="hist-meta">
                    <span class="hist-label">${item.date}</span>
                    <span class="hist-label">${item.time}</span>
                </div>
            </li>
        `).join('');
        lucide.createIcons();
    }

    async export() {
        if (this.history.length === 0) {
            this.showToast('No history to export', 'error');
            return;
        }

        this.showToast('Generating Nexus Report...', 'info');
        
        try {
            const report = await new Promise(resolve => {
                setTimeout(() => resolve(JSON.stringify(this.history, null, 2)), 1000);
            });

            const blob = new Blob([report], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nexus_history_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            this.showToast('History downloaded', 'success');
        } catch (err) {
            this.showToast('Export failed', 'error');
        }
    }

    clear() {
        this.history = [];
        localStorage.removeItem('history');
        this.render();
        this.showToast('History cleared successfully', 'success');
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
