// IndexedDB service for Cost Manager
let database = null;

export function openCostsDB(databaseName, databaseVersion) {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error('IndexedDB not supported'));
            return;
        }

        const request = indexedDB.open(databaseName, databaseVersion);
        request.onerror = () => reject(new Error('Database error'));
        request.onsuccess = (event) => resolve(event.target.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('costs')) {
                const store = db.createObjectStore('costs', { keyPath: 'id', autoIncrement: true });
                store.createIndex('year', 'year', { unique: false });
                store.createIndex('month', 'month', { unique: false });
                store.createIndex('category', 'category', { unique: false });
                store.createIndex('currency', 'currency', { unique: false });
                store.createIndex('date', 'date', { unique: false });
            }
        };
    });
}

export function addCost(cost) {
    return new Promise((resolve, reject) => {
        if (!cost || typeof cost.sum !== 'number' || cost.sum <= 0 || 
            !cost.currency || !cost.category || !cost.description) {
            reject(new Error('Invalid cost data'));
            return;
        }

        if (!database) {
            reject(new Error('Database not connected'));
            return;
        }

        const currentDate = new Date();
        const costItem = {
            sum: cost.sum,
            currency: cost.currency,
            category: cost.category,
            description: cost.description,
            date: currentDate,
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate()
        };

        const transaction = database.transaction(['costs'], 'readwrite');
        const store = transaction.objectStore('costs');
        const request = store.add(costItem);

        request.onsuccess = (event) => {
            const getRequest = store.get(event.target.result);
            getRequest.onsuccess = () => {
                const item = getRequest.result;
                resolve({
                    sum: item.sum,
                    currency: item.currency,
                    category: item.category,
                    description: item.description
                });
            };
        };

        request.onerror = () => reject(new Error('Failed to add cost'));
    });
}

export function getReport(year, month, currency) {
    return new Promise((resolve, reject) => {
        if (typeof year !== 'number' || typeof month !== 'number' || 
            month < 1 || month > 12 || !currency) {
            reject(new Error('Invalid parameters'));
            return;
        }

        if (!database) {
            reject(new Error('Database not connected'));
            return;
        }

        const transaction = database.transaction(['costs'], 'readonly');
        const store = transaction.objectStore('costs');
        const request = store.getAll();

        request.onsuccess = () => {
            const allCosts = request.result;
            const monthCosts = allCosts.filter(cost => cost.year === year && cost.month === month);

            const reportCosts = monthCosts.map(cost => {
                let convertedAmount = cost.sum;
                if (cost.currency !== currency && typeof convertCurrency === 'function') {
                    convertedAmount = convertCurrency(cost.sum, cost.currency, currency);
                }
                
                return {
                    sum: convertedAmount,
                    currency: currency,
                    category: cost.category,
                    description: cost.description,
                    Date: { day: cost.day }
                };
            });

            const totalAmount = reportCosts.reduce((sum, cost) => sum + cost.sum, 0);
            
            resolve({
                year: year,
                month: month,
                costs: reportCosts,
                total: { currency: currency, total: totalAmount }
            });
        };

        request.onerror = () => reject(new Error('Failed to get report'));
    });
}

export function setDatabase(db) {
    database = db;
}

export function getAllCosts() {
    return new Promise((resolve, reject) => {
        if (!database) {
            reject(new Error('Database not connected'));
            return;
        }

        const transaction = database.transaction(['costs'], 'readonly');
        const store = transaction.objectStore('costs');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error('Failed to get costs'));
    });
}

export function clearAllCosts() {
    return new Promise((resolve, reject) => {
        if (!database) {
            reject(new Error('Database not connected'));
            return;
        }

        const transaction = database.transaction(['costs'], 'readwrite');
        const store = transaction.objectStore('costs');
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to clear costs'));
    });
}

export function convertCurrency(amount, fromCurrency, toCurrency) {
    const defaultRates = { USD: 1, GBP: 1.8, EURO: 0.7, ILS: 3.4 };
    const rates = (typeof window !== 'undefined' && window.app && window.app.exchangeRates) || defaultRates;
    
    if (fromCurrency === toCurrency) return amount;
    if (!rates[fromCurrency] || !rates[toCurrency]) return amount;

    const usdAmount = amount / rates[fromCurrency];
    return usdAmount * rates[toCurrency];
}

const idbService = {
    openCostsDB,
    addCost,
    getReport,
    setDatabase,
    getAllCosts,
    clearAllCosts,
    convertCurrency
};

export default idbService;