// Cost Manager - Vanilla JavaScript Application
// Front-End Development Final Project

class CostManager {
    constructor() {
        this.db = null;
        this.exchangeRates = { USD: 1, GBP: 1.8, EURO: 0.7, ILS: 3.4 };
        this.init();
    }

    async init() {
        await this.initDB();
        this.initEventListeners();
        this.initSelectOptions();
        this.loadSettings();
    }

    async initDB() {
        try {
            this.db = await window.db.openCostsDB("costsdb", 1);
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            this.showMessage('Failed to initialize database', 'error');
        }
    }

    initEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Cost form submission
        document.getElementById('cost-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddCost();
        });

        // Report generation
        document.getElementById('generate-report').addEventListener('click', () => {
            this.generateReport();
        });

        // Chart generation
        document.getElementById('generate-pie').addEventListener('click', () => {
            this.generatePieChart();
        });

        document.getElementById('generate-bar').addEventListener('click', () => {
            this.generateBarChart();
        });

        // Settings
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Clear all data
        document.getElementById('clear-all-data').addEventListener('click', () => {
            this.clearAllData();
        });
    }

    initSelectOptions() {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 5; i--) {
            years.push(i);
        }

        const months = [
            { value: 1, name: 'January' },
            { value: 2, name: 'February' },
            { value: 3, name: 'March' },
            { value: 4, name: 'April' },
            { value: 5, name: 'May' },
            { value: 6, name: 'June' },
            { value: 7, name: 'July' },
            { value: 8, name: 'August' },
            { value: 9, name: 'September' },
            { value: 10, name: 'October' },
            { value: 11, name: 'November' },
            { value: 12, name: 'December' }
        ];

        // Populate year selects
        ['report-year', 'pie-year', 'bar-year'].forEach(id => {
            const select = document.getElementById(id);
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                if (year === currentYear) option.selected = true;
                select.appendChild(option);
            });
        });

        // Populate month selects
        ['report-month', 'pie-month'].forEach(id => {
            const select = document.getElementById(id);
            months.forEach(month => {
                const option = document.createElement('option');
                option.value = month.value;
                option.textContent = month.name;
                if (month.value === new Date().getMonth() + 1) option.selected = true;
                select.appendChild(option);
            });
        });
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    async handleAddCost() {
        const form = document.getElementById('cost-form');
        const formData = new FormData(form);
        
        const costData = {
            sum: parseFloat(formData.get('sum')),
            currency: formData.get('currency'),
            category: formData.get('category'),
            description: formData.get('description').trim()
        };

        // Validation
        if (!costData.sum || costData.sum <= 0) {
            this.showMessage('Please enter a valid amount', 'error');
            return;
        }

        if (!costData.category) {
            this.showMessage('Please select a category', 'error');
            return;
        }

        if (!costData.description) {
            this.showMessage('Please enter a description', 'error');
            return;
        }

        try {
            await this.db.addCost(costData);
            this.showMessage('Cost item added successfully!', 'success');
            form.reset();
        } catch (error) {
            console.error('Error adding cost:', error);
            this.showMessage('Failed to add cost item', 'error');
        }
    }

    async generateReport() {
        const year = parseInt(document.getElementById('report-year').value);
        const month = parseInt(document.getElementById('report-month').value);
        const currency = document.getElementById('report-currency').value;

        try {
            const report = await this.db.getReport(month, year, currency);
            this.displayReport(report);
        } catch (error) {
            console.error('Error generating report:', error);
            this.showMessage('Failed to generate report', 'error');
        }
    }

    displayReport(report) {
        const resultsDiv = document.getElementById('report-results');
        
        if (!report || !report.costs || report.costs.length === 0) {
            resultsDiv.innerHTML = `
                <p>No data found for the selected period.</p>
                <button onclick="location.reload()" style="margin-top: 10px;">🔄 Refresh Page</button>
            `;
            return;
        }

        let html = `
            <h3>Report for ${this.getMonthName(report.month)} ${report.year}</h3>
            <div class="report-items">
        `;

        report.costs.forEach(cost => {
            html += `
                <div class="report-item">
                    <span>${cost.description} (${cost.category})</span>
                    <span>${cost.sum} ${cost.currency}</span>
                </div>
            `;
        });

        html += `
            </div>
            <div class="report-item report-total">
                <span>Total</span>
                <span>${report.total.total} ${report.total.currency}</span>
            </div>
            <button onclick="location.reload()" style="margin-top: 15px;">🔄 Refresh Page</button>
        `;

        resultsDiv.innerHTML = html;
    }

    async generatePieChart() {
        const year = parseInt(document.getElementById('pie-year').value);
        const month = parseInt(document.getElementById('pie-month').value);
        const currency = document.getElementById('pie-currency').value;

        try {
            const report = await this.db.getReport(month, year, currency);
            
            if (!report || !report.costs || report.costs.length === 0) {
                this.showMessage('No data found for the selected period', 'error');
                return;
            }

            this.createPieChart(report.costs, currency);
        } catch (error) {
            console.error('Error generating pie chart:', error);
            this.showMessage('Failed to generate pie chart', 'error');
        }
    }

    async generateBarChart() {
        const year = parseInt(document.getElementById('bar-year').value);
        const currency = document.getElementById('bar-currency').value;

        try {
            const monthlyData = [];
            for (let month = 1; month <= 12; month++) {
                const report = await this.db.getReport(month, year, currency);
                monthlyData.push(report?.total?.total || 0);
            }

            this.createBarChart(monthlyData, currency, year);
        } catch (error) {
            console.error('Error generating bar chart:', error);
            this.showMessage('Failed to generate bar chart', 'error');
        }
    }

    createPieChart(costs, currency) {
        const ctx = document.getElementById('pie-chart').getContext('2d');
        
        // Destroy existing chart
        if (window.pieChart) {
            window.pieChart.destroy();
        }

        // Aggregate by category
        const categoryTotals = {};
        costs.forEach(cost => {
            if (!categoryTotals[cost.category]) {
                categoryTotals[cost.category] = 0;
            }
            categoryTotals[cost.category] += cost.sum;
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ];

        window.pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Expenses by Category (${currency})`
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createBarChart(monthlyData, currency, year) {
        const ctx = document.getElementById('bar-chart').getContext('2d');
        
        // Destroy existing chart
        if (window.barChart) {
            window.barChart.destroy();
        }

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        window.barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: `Monthly Expenses (${currency})`,
                    data: monthlyData,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Monthly Expenses for ${year}`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: `Amount (${currency})`
                        }
                    }
                }
            }
        });
    }

    async saveSettings() {
        const url = document.getElementById('exchange-rate-url').value.trim();
        
        if (!url) {
            this.showMessage('Please enter a valid URL', 'error');
            return;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch');
            
            const rates = await response.json();
            
            // Validate rates format
            if (!rates.USD || !rates.GBP || !rates.EURO || !rates.ILS) {
                throw new Error('Invalid rates format');
            }

            this.exchangeRates = rates;
            localStorage.setItem('exchangeRateUrl', url);
            localStorage.setItem('exchangeRates', JSON.stringify(rates));
            
            this.updateRatesDisplay();
            this.showMessage('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showMessage('Failed to fetch exchange rates. Please check the URL.', 'error');
        }
    }

    loadSettings() {
        const savedUrl = localStorage.getItem('exchangeRateUrl');
        const savedRates = localStorage.getItem('exchangeRates');
        
        if (savedUrl) {
            document.getElementById('exchange-rate-url').value = savedUrl;
        }
        
        if (savedRates) {
            this.exchangeRates = JSON.parse(savedRates);
        }
        
        this.updateRatesDisplay();
    }

    updateRatesDisplay() {
        const display = document.getElementById('current-rates');
        const ratesText = Object.entries(this.exchangeRates)
            .map(([currency, rate]) => `${currency}: ${rate}`)
            .join(', ');
        display.textContent = ratesText;
    }

    async clearAllData() {
        const confirmed = confirm('⚠️ Are you sure you want to delete ALL cost data? This action cannot be undone!');
        
        if (!confirmed) {
            return;
        }

        try {
            await this.db.clearAllCosts();
            this.showMessage('All data has been cleared successfully!', 'success');
            
            // Clear any displayed reports
            const reportResults = document.getElementById('report-results');
            if (reportResults) {
                reportResults.innerHTML = '<p>No data found. All data has been cleared.</p>';
            }

            // Destroy any existing charts
            if (window.pieChart) {
                window.pieChart.destroy();
                window.pieChart = null;
            }
            if (window.barChart) {
                window.barChart.destroy();
                window.barChart = null;
            }

        } catch (error) {
            console.error('Error clearing data:', error);
            this.showMessage('Failed to clear data: ' + error.message, 'error');
        }
    }

    getMonthName(monthNum) {
        const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthNum] || '';
    }

    showMessage(message, type) {
        // Remove existing messages
        document.querySelectorAll('.success-message, .error-message').forEach(el => el.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        
        // Insert at the top of the active tab
        const activeTab = document.querySelector('.tab-content.active .card');
        activeTab.insertBefore(messageDiv, activeTab.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CostManager();
});
