/*
 * Database Service - Pure IndexedDB Operations
 * 
 * 🎯 What this does (for students):
 * This module handles all database operations using IndexedDB.
 * It's completely separate from currency conversion logic.
 * 
 * 📚 Key Learning Concepts:
 * - Separation of Concerns: Database logic separate from business logic
 * - IndexedDB API: Browser database for storing data locally
 * - Promise-based Operations: All database operations return Promises
 * - Error Handling: Proper error handling for database operations
 */

// Store the database connection
let database = null;

// Open the database
export function openCostsDB(databaseName, databaseVersion) {
    return new Promise(function(resolve, reject) {
        // Check if browser supports IndexedDB
        if (!window.indexedDB) {
            reject(new Error('IndexedDB is not supported in this browser'));
            return;
        }

        // Open the database
        const request = indexedDB.open(databaseName, databaseVersion);

        // Handle database opening errors
        request.onerror = function(event) {
            reject(new Error('Failed to open database: ' + event.target.error));
        };

        // Handle successful database opening
        request.onsuccess = function(event) {
            database = event.target.result;
            
            // Create wrapper object with required methods
            const databaseWrapper = {
                addCost: function(cost) {
                    return addCost(cost);
                },
                getReport: function(year, month, currency) {
                    return getReport(year, month, currency);
                },
                getAllCosts: function() {
                    return getAllCosts();
                },
                clearAllCosts: function() {
                    return clearAllCosts();
                }
            };
            
            resolve(databaseWrapper);
        };

        // Create database structure when needed
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('costs')) {
                const costsStore = db.createObjectStore('costs', { 
                    keyPath: 'id',
                    autoIncrement: true
                });
                
                // Create indexes for searching
                costsStore.createIndex('year', 'year', { unique: false });
                costsStore.createIndex('month', 'month', { unique: false });
                costsStore.createIndex('category', 'category', { unique: false });
                costsStore.createIndex('currency', 'currency', { unique: false });
            }
        };
    });
}

// Add a new cost to the database
export function addCost(cost) {
    return new Promise(function(resolve, reject) {
        // Check inputs
        if (!cost) {
            reject(new Error('Cost object is required'));
            return;
        }
        
        if (typeof cost.sum !== 'number') {
            reject(new Error('Sum must be a number'));
            return;
        }
        
        if (typeof cost.currency !== 'string') {
            reject(new Error('Currency must be a string'));
            return;
        }
        
        if (typeof cost.category !== 'string') {
            reject(new Error('Category must be a string'));
            return;
        }
        
        if (typeof cost.description !== 'string') {
            reject(new Error('Description must be a string'));
            return;
        }

        // Validate currency is one of the allowed options
        const allowedCurrencies = ['USD', 'ILS', 'GBP', 'EURO'];
        if (!allowedCurrencies.includes(cost.currency)) {
            reject(new Error(`Currency must be one of: ${allowedCurrencies.join(', ')}`));
            return;
        }

        // Validate sum is positive
        if (cost.sum <= 0) {
            reject(new Error('Sum must be a positive number'));
            return;
        }

        // Validate category is not empty
        if (cost.category.trim() === '') {
            reject(new Error('Category cannot be empty'));
            return;
        }

        // Validate description is not empty
        if (cost.description.trim() === '') {
            reject(new Error('Description cannot be empty'));
            return;
        }

        if (!database) {
            reject(new Error('Database not ready'));
            return;
        }

        // Create the cost item with date info
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

        // Save to database
        const transaction = database.transaction(['costs'], 'readwrite');
        const costsStore = transaction.objectStore('costs');
        const addRequest = costsStore.add(costItem);

        addRequest.onsuccess = function(event) {
            const getRequest = costsStore.get(event.target.result);
            
            getRequest.onsuccess = function() {
                const addedItem = getRequest.result;
                resolve({
                    sum: addedItem.sum,
                    currency: addedItem.currency,
                    category: addedItem.category,
                    description: addedItem.description
                });
            };
            
            getRequest.onerror = function() {
                reject(new Error('Could not get added item'));
            };
        };

        addRequest.onerror = function(event) {
            reject(new Error('Could not add cost: ' + event.target.error));
        };

        transaction.onerror = function(event) {
            reject(new Error('Database error: ' + event.target.error));
        };
    });
}

// Get monthly report in chosen currency (without conversion - just raw data)
export function getReport(year, month, currency) {
    return new Promise(function(resolve, reject) {
        // Check inputs
        if (typeof year !== 'number') {
            reject(new Error('Year must be a number'));
            return;
        }
        
        if (typeof month !== 'number') {
            reject(new Error('Month must be a number'));
            return;
        }
        
        if (typeof currency !== 'string') {
            reject(new Error('Currency must be a string'));
            return;
        }

        if (month < 1 || month > 12) {
            reject(new Error('Month must be between 1 and 12'));
            return;
        }

        // Validate currency is one of the allowed options
        const allowedCurrencies = ['USD', 'ILS', 'GBP', 'EURO'];
        if (!allowedCurrencies.includes(currency)) {
            reject(new Error(`Currency must be one of: ${allowedCurrencies.join(', ')}`));
            return;
        }

        if (!database) {
            reject(new Error('Database not ready'));
            return;
        }

        // Get all costs from database
        const transaction = database.transaction(['costs'], 'readonly');
        const costsStore = transaction.objectStore('costs');
        const getAllRequest = costsStore.getAll();

        getAllRequest.onsuccess = function() {
            const allCosts = getAllRequest.result;
            
            // Find costs for this month and year
            const filteredCosts = [];
            for (let i = 0; i < allCosts.length; i++) {
                const cost = allCosts[i];
                if (cost.year === year && cost.month === month) {
                    filteredCosts.push(cost);
                }
            }

            // Return raw data without currency conversion
            // Currency conversion will be handled by the currency service
            const report = {
                year: year,
                month: month,
                costs: filteredCosts,
                requestedCurrency: currency
            };

            resolve(report);
        };

        getAllRequest.onerror = function(event) {
            reject(new Error('Could not get costs: ' + event.target.error));
        };

        transaction.onerror = function(event) {
            reject(new Error('Database error: ' + event.target.error));
        };
    });
}

// Get all costs (for testing)
export function getAllCosts() {
    return new Promise(function(resolve, reject) {
        if (!database) {
            reject(new Error('Database not ready'));
            return;
        }

        const transaction = database.transaction(['costs'], 'readonly');
        const costsStore = transaction.objectStore('costs');
        const getAllRequest = costsStore.getAll();

        getAllRequest.onsuccess = function() {
            resolve(getAllRequest.result);
        };

        getAllRequest.onerror = function(event) {
            reject(new Error('Could not get costs: ' + event.target.error));
        };
    });
}

// Clear all costs (for testing)
export function clearAllCosts() {
    return new Promise(function(resolve, reject) {
        if (!database) {
            reject(new Error('Database not ready'));
            return;
        }

        const transaction = database.transaction(['costs'], 'readwrite');
        const costsStore = transaction.objectStore('costs');
        const clearRequest = costsStore.clear();

        clearRequest.onsuccess = function() {
            resolve();
        };

        clearRequest.onerror = function(event) {
            reject(new Error('Could not clear costs: ' + event.target.error));
        };
    });
}

// Export everything together
const databaseService = {
    openCostsDB,
    addCost,
    getReport,
    getAllCosts,
    clearAllCosts
};

export default databaseService;
