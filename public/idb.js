/*
 * idb.js - Simple Student Version
 * This file creates a database library for the Cost Manager project
 * 
 * What this does:
 * - Creates window.db and window.idb objects for the browser
 * - Provides 3 main functions: openCostsDB, addCost, getReport
 * - All functions use Promises (like async/await)
 * - Stores expense data in the browser's IndexedDB
 */

// Create global database object as required by specifications
window.db = {};

// Also make it available as 'idb' for easier access
if (typeof window !== 'undefined') {
    window.idb = window.db;
}

// Function 1: openCostsDB
// This opens the database (like opening a file)
// Give it a name like "costsdb" and version number like 1
window.db.openCostsDB = function(databaseName, databaseVersion) {
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
            const database = event.target.result;
            
            // Store database reference for other functions to use
            window.db.database = database;
            
            // Create wrapper object with required methods
            const databaseWrapper = {
                // Store the actual database
                _database: database,
                
                // Database properties
                name: database.name,
                version: database.version,
                
                // Required method: addCost
                addCost: function(cost) {
                    return window.db.addCost(cost);
                },
                
                // Required method: getReport  
                getReport: function(year, month, currency) {
                    return window.db.getReport(year, month, currency);
                },
                
                // Utility methods
                getAllCosts: function() {
                    return window.db.getAllCosts();
                },
                
                clearAllCosts: function() {
                    return window.db.clearAllCosts();
                }
            };
            
            resolve(databaseWrapper);
        };

        // Handle database upgrade (first time creation or version change)
        request.onupgradeneeded = function(event) {
            const database = event.target.result;
            
            // Create the 'costs' object store if it doesn't exist
            if (!database.objectStoreNames.contains('costs')) {
                const costsStore = database.createObjectStore('costs', { 
                    keyPath: 'id',        // Primary key field
                    autoIncrement: true   // Automatically generate IDs
                });
                
                // Create indexes for faster searching
                costsStore.createIndex('year', 'year', { unique: false });
                costsStore.createIndex('month', 'month', { unique: false });
                costsStore.createIndex('category', 'category', { unique: false });
                costsStore.createIndex('currency', 'currency', { unique: false });
                costsStore.createIndex('date', 'date', { unique: false });
            }
        };
    });
};

// Function 2: addCost
// This saves a new expense to the database
// Give it an object like: {sum: 25.50, currency: "USD", category: "Food", description: "Pizza"}
window.db.addCost = function(cost) {
    return new Promise(function(resolve, reject) {
        // Validate input parameters
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

        // Check if database is initialized
        if (!window.db.database) {
            reject(new Error('Database not initialized. Call openCostsDB first.'));
            return;
        }

        // Create the cost item with additional date information
        const currentDate = new Date();
        const costItem = {
            sum: cost.sum,
            currency: cost.currency,
            category: cost.category,
            description: cost.description,
            date: currentDate,                        // Full date object
            year: currentDate.getFullYear(),          // Year (e.g., 2025)
            month: currentDate.getMonth() + 1,        // Month 1-12 (getMonth returns 0-11)
            day: currentDate.getDate()                // Day of month
        };

        // Start a database transaction
        const transaction = window.db.database.transaction(['costs'], 'readwrite');
        const costsStore = transaction.objectStore('costs');

        // Add the cost item to the database
        const addRequest = costsStore.add(costItem);

        // Handle successful addition
        addRequest.onsuccess = function(event) {
            // Get the added item to return it
            const getRequest = costsStore.get(event.target.result);
            
            getRequest.onsuccess = function() {
                const addedItem = getRequest.result;
                
                // Return only the required properties as per specification
                resolve({
                    sum: addedItem.sum,
                    currency: addedItem.currency,
                    category: addedItem.category,
                    description: addedItem.description
                });
            };
            
            getRequest.onerror = function() {
                reject(new Error('Failed to retrieve added cost item'));
            };
        };

        // Handle addition errors
        addRequest.onerror = function(event) {
            reject(new Error('Failed to add cost item: ' + event.target.error));
        };

        // Handle transaction errors
        transaction.onerror = function(event) {
            reject(new Error('Transaction failed: ' + event.target.error));
        };
    });
};

// Function 3: getReport
// This gets all expenses for a specific month and converts them to your chosen currency
// Example: getReport(2025, 9, "USD") gets September 2025 expenses in US Dollars
window.db.getReport = function(year, month, currency) {
    return new Promise(function(resolve, reject) {
        // Validate input parameters
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

        // Validate month range
        if (month < 1 || month > 12) {
            reject(new Error('Month must be between 1 and 12'));
            return;
        }

        // Check if database is initialized
        if (!window.db.database) {
            reject(new Error('Database not initialized. Call openCostsDB first.'));
            return;
        }

        // Start a read-only transaction
        const transaction = window.db.database.transaction(['costs'], 'readonly');
        const costsStore = transaction.objectStore('costs');

        // Get all costs from the database
        const getAllRequest = costsStore.getAll();

        // Handle successful data retrieval
        getAllRequest.onsuccess = function() {
            const allCosts = getAllRequest.result;
            
            // Filter costs for the specified month and year
            const filteredCosts = [];
            for (let i = 0; i < allCosts.length; i++) {
                const cost = allCosts[i];
                if (cost.year === year && cost.month === month) {
                    filteredCosts.push(cost);
                }
            }

            // Convert costs to the target currency
            const convertedCosts = [];
            let totalAmount = 0;
            
            for (let i = 0; i < filteredCosts.length; i++) {
                const cost = filteredCosts[i];
                
                // Convert currency using helper function
                const convertedAmount = convertCurrency(cost.sum, cost.currency, currency);
                
                // Create cost object in required format
                const convertedCost = {
                    sum: convertedAmount,
                    currency: currency,
                    category: cost.category,
                    description: cost.description,
                    Date: { day: cost.day }  // Note: Capital 'D' as per specification
                };
                
                convertedCosts.push(convertedCost);
                totalAmount += convertedAmount;
            }

            // Create report object in required format
            const report = {
                year: year,
                month: month,
                costs: convertedCosts,
                total: { 
                    currency: currency, 
                    total: totalAmount 
                }
            };

            resolve(report);
        };

        // Handle data retrieval errors
        getAllRequest.onerror = function(event) {
            reject(new Error('Failed to retrieve costs: ' + event.target.error));
        };

        // Handle transaction errors
        transaction.onerror = function(event) {
            reject(new Error('Transaction failed: ' + event.target.error));
        };
    });
};

// Helper function: convertCurrency
// This converts money from one currency to another
// Example: convertCurrency(100, "USD", "ILS") converts $100 to Israeli Shekels
function convertCurrency(amount, fromCurrency, toCurrency) {
    // Default exchange rates as per requirements
    const defaultRates = { 
        USD: 1,      // Base currency
        GBP: 1.8,    // 1 USD = 1.8 GBP
        EURO: 0.7,   // 1 USD = 0.7 EURO
        ILS: 3.4     // 1 USD = 3.4 ILS
    };
    
    // Try to get rates from global app object, otherwise use defaults
    let exchangeRates = defaultRates;
    if (window.app && window.app.exchangeRates) {
        exchangeRates = window.app.exchangeRates;
    }
    
    // If same currency, no conversion needed
    if (fromCurrency === toCurrency) {
        return amount;
    }

    // Check if exchange rates are available
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
        console.warn('Exchange rate not available for ' + fromCurrency + ' to ' + toCurrency);
        return amount; // Return original amount if conversion not possible
    }

    // Convert to USD first, then to target currency
    const usdAmount = amount / exchangeRates[fromCurrency];
    const convertedAmount = usdAmount * exchangeRates[toCurrency];
    
    return convertedAmount;
}

// Extra function: getAllCosts
// This gets ALL expenses from the database (useful for testing)
window.db.getAllCosts = function() {
    return new Promise(function(resolve, reject) {
        if (!window.db.database) {
            reject(new Error('Database not initialized. Call openCostsDB first.'));
            return;
        }

        const transaction = window.db.database.transaction(['costs'], 'readonly');
        const costsStore = transaction.objectStore('costs');
        const getAllRequest = costsStore.getAll();

        getAllRequest.onsuccess = function() {
            resolve(getAllRequest.result);
        };

        getAllRequest.onerror = function(event) {
            reject(new Error('Failed to retrieve costs: ' + event.target.error));
        };
    });
};

// Extra function: clearAllCosts
// This deletes ALL expenses from the database (useful for testing)
window.db.clearAllCosts = function() {
    return new Promise(function(resolve, reject) {
        if (!window.db.database) {
            reject(new Error('Database not initialized. Call openCostsDB first.'));
            return;
        }

        const transaction = window.db.database.transaction(['costs'], 'readwrite');
        const costsStore = transaction.objectStore('costs');
        const clearRequest = costsStore.clear();

        clearRequest.onsuccess = function() {
            resolve();
        };

        clearRequest.onerror = function(event) {
            reject(new Error('Failed to clear costs: ' + event.target.error));
        };
    });
};