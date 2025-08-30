/**
 * Cost Manager Application - Main JavaScript File
 * Handles UI interactions, database operations, and chart generation
 */

class CostManagerApp {
    constructor() {
        this.database = null;
        this.exchangeRates = { USD: 1, GBP: 1.8, EURO: 0.7, ILS: 3.4 };
        this.exchangeRateUrl = '';
        this.charts = {};
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Initialize database
            await this.initializeDatabase();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Populate form controls
            this.populateFormControls();
            
            // Load settings
            this.loadSettings();
            
            console.log('Cost Manager Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showMessage('Failed to initialize application: ' + error.message, 'error');
        }
    }

    /**
     * Initialize the IndexedDB database
     */
    async initializeDatabase() {
        try {
            const database = await db.openCostsDB('costsdb', 1);
            db.setDatabase(database);
            this.database = database;
            console.log('Database initialized successfully');
        } catch (error) {
            throw new Error('Failed to initialize database: ' + error.message);
        }
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Form submission
        document.getElementById('cost-form').addEventListener('submit', (e) => this.handleAddCost(e));

        // Report generation
        document.getElementById('generate-report').addEventListener('click', () => this.generateReport());

        // Chart generation
        document.getElementById('generate-pie').addEventListener('click', () => this.generatePieChart());
        document.getElementById('generate-bar').addEventListener('click', () => this.generateBarChart());

        // Settings
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    /**
     * Populate form controls with dynamic data
     */
    populateFormControls() {
        const currentYear = new Date().getFullYear();
        const years = [];
        
        // Generate years (current year - 5 to current year + 5)
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
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
        const yearSelects = ['report-year', 'pie-year', 'bar-year'];
        yearSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select Year</option>';
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                if (year === currentYear) option.selected = true;
                select.appendChild(option);
            });
        });

        // Populate month selects
        const monthSelects = ['report-month', 'pie-month'];
        monthSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select Month</option>';
            months.forEach(month => {
                const option = document.createElement('option');
                option.value = month.value;
                option.textContent = month.name;
                if (month.value === new Date().getMonth() + 1) option.selected = true;
                select.appendChild(option);
            });
        });
    }

    /**
     * Handle adding a new cost item
     */
    async handleAddCost(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const costData = {
            sum: parseFloat(formData.get('sum')),
            currency: formData.get('currency'),
            category: formData.get('category'),
            description: formData.get('description')
        };

        try {
            const result = await db.addCost(costData);
            this.showMessage('Cost item added successfully!', 'success');
            event.target.reset();
            console.log('Added cost item:', result);
        } catch (error) {
            console.error('Failed to add cost item:', error);
            this.showMessage('Failed to add cost item: ' + error.message, 'error');
        }
    }

    /**
     * Generate monthly report
     */
    async generateReport() {
        const year = parseInt(document.getElementById('report-year').value);
        const month = parseInt(document.getElementById('report-month').value);
        const currency = document.getElementById('report-currency').value;

        if (!year || !month || !currency) {
            this.showMessage('Please select year, month, and currency', 'error');
            return;
        }

        try {
            const report = await db.getReport(year, month, currency);
            this.displayReport(report);
        } catch (error) {
            console.error('Failed to generate report:', error);
            this.showMessage('Failed to generate report: ' + error.message, 'error');
        }
    }

    /**
     * Display the generated report
     */
    displayReport(report) {
        const resultsContainer = document.getElementById('report-results');
        
        if (report.costs.length === 0) {
            resultsContainer.innerHTML = '<div class="message">No costs found for the selected month and year.</div>';
            return;
        }

        let html = '<h3>Report for ' + this.getMonthName(report.month) + ' ' + report.year + '</h3>';
        
        // Display individual cost items
        report.costs.forEach(cost => {
            html += `
                <div class="cost-item">
                    <div class="cost-info">
                        <div class="cost-amount">${cost.sum.toFixed(2)} ${cost.currency}</div>
                        <div class="cost-category">${cost.category}</div>
                        <div class="cost-description">${cost.description}</div>
                        <div class="cost-date">Day: ${cost.Date.day}</div>
                    </div>
                </div>
            `;
        });

        // Display total
        html += `
            <div class="total-amount">
                <h3>Total</h3>
                <div class="amount">${report.total.total.toFixed(2)} ${report.total.currency}</div>
            </div>
        `;

        resultsContainer.innerHTML = html;
    }

    /**
     * Generate pie chart for monthly categories
     */
    async generatePieChart() {
        const year = parseInt(document.getElementById('pie-year').value);
        const month = parseInt(document.getElementById('pie-month').value);
        const currency = document.getElementById('pie-currency').value;

        if (!year || !month || !currency) {
            this.showMessage('Please select year, month, and currency', 'error');
            return;
        }

        try {
            const report = await db.getReport(year, month, currency);
            this.createPieChart(report, currency);
        } catch (error) {
            console.error('Failed to generate pie chart:', error);
            this.showMessage('Failed to generate pie chart: ' + error.message, 'error');
        }
    }

    /**
     * Create pie chart using Chart.js
     */
    createPieChart(report, currency) {
        // Group costs by category
        const categoryTotals = {};
        report.costs.forEach(cost => {
            if (categoryTotals[cost.category]) {
                categoryTotals[cost.category] += cost.sum;
            } else {
                categoryTotals[cost.category] = cost.sum;
            }
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        // Destroy existing chart if it exists
        if (this.charts.pie) {
            this.charts.pie.destroy();
        }

        const ctx = document.getElementById('pie-chart').getContext('2d');
        this.charts.pie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Costs by Category - ${this.getMonthName(report.month)} ${report.year} (${currency})`
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * Generate bar chart for monthly totals
     */
    async generateBarChart() {
        const year = parseInt(document.getElementById('bar-year').value);
        const currency = document.getElementById('bar-currency').value;

        if (!year || !currency) {
            this.showMessage('Please select year and currency', 'error');
            return;
        }

        try {
            const monthlyData = await this.getMonthlyData(year, currency);
            this.createBarChart(monthlyData, year, currency);
        } catch (error) {
            console.error('Failed to generate bar chart:', error);
            this.showMessage('Failed to generate bar chart: ' + error.message, 'error');
        }
    }

    /**
     * Get monthly data for the specified year
     */
    async getMonthlyData(year, currency) {
        const monthlyTotals = new Array(12).fill(0);
        
        try {
            const allCosts = await db.getAllCosts();
            const yearCosts = allCosts.filter(cost => cost.year === year);
            
            yearCosts.forEach(cost => {
                // Convert to target currency (simplified conversion)
                const convertedAmount = cost.sum; // Placeholder for actual conversion
                monthlyTotals[cost.month - 1] += convertedAmount;
            });
        } catch (error) {
            console.error('Failed to get monthly data:', error);
        }

        return monthlyTotals;
    }

    /**
     * Create bar chart using Chart.js
     */
    createBarChart(monthlyData, year, currency) {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        // Destroy existing chart if it exists
        if (this.charts.bar) {
            this.charts.bar.destroy();
        }

        const ctx = document.getElementById('bar-chart').getContext('2d');
        this.charts.bar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: `Monthly Costs (${currency})`,
                    data: monthlyData,
                    backgroundColor: '#667eea',
                    borderColor: '#5a6fd8',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Monthly Costs for ${year} (${currency})`
                    },
                    legend: {
                        display: false
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

    /**
     * Load application settings
     */
    loadSettings() {
        const savedUrl = localStorage.getItem('exchangeRateUrl');
        if (savedUrl) {
            document.getElementById('exchange-rate-url').value = savedUrl;
            this.exchangeRateUrl = savedUrl;
        }
    }

    /**
     * Save application settings
     */
    saveSettings() {
        const url = document.getElementById('exchange-rate-url').value.trim();
        
        if (url) {
            localStorage.setItem('exchangeRateUrl', url);
            this.exchangeRateUrl = url;
            this.showMessage('Settings saved successfully!', 'success');
        } else {
            this.showMessage('Please enter a valid URL', 'error');
        }
    }

    /**
     * Get month name from month number
     */
    getMonthName(month) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month - 1];
    }

    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert at the top of the main content
        const main = document.querySelector('main');
        main.insertBefore(messageDiv, main.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    /**
     * Fetch exchange rates from API
     */
    async fetchExchangeRates() {
        if (!this.exchangeRateUrl) {
            console.warn('No exchange rate URL configured');
            return;
        }

        try {
            const response = await fetch(this.exchangeRateUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rates = await response.json();
            this.exchangeRates = rates;
            console.log('Exchange rates updated:', rates);
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
            this.showMessage('Failed to fetch exchange rates: ' + error.message, 'error');
        }
    }

    /**
     * Convert amount between currencies
     */
    convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return amount;
        }

        if (!this.exchangeRates[fromCurrency] || !this.exchangeRates[toCurrency]) {
            console.warn(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
            return amount; // Return original amount if conversion not possible
        }

        // Convert to USD first, then to target currency
        const usdAmount = amount / this.exchangeRates[fromCurrency];
        return usdAmount * this.exchangeRates[toCurrency];
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CostManagerApp();
});
