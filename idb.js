/**
 * IndexedDB Wrapper Library for Cost Manager Application
 * This library provides a Promise-based interface for IndexedDB operations
 * Complies with Front-End Development Final Project requirements
 * 
 * As per requirements: "When adding a <script> element to HTML document in order to use this library, 
 * the db property should be added to the global object."
 */

// Global database object - as required by specifications
window.db = {};

// Also make available as idb for easier access (both should work)
if (typeof window !== 'undefined') {
    window.idb = window.db;
}

/**
 * Opens or creates a costs database
 * @param {string} databaseName - Name of the database
 * @param {number} databaseVersion - Version number of the database
 * @returns {Promise} Promise that resolves to the database object with methods
 */
window.db.openCostsDB = function(databaseName, databaseVersion) {
    return new Promise((resolve, reject) => {
        // Check if IndexedDB is supported
        if (!window.indexedDB) {
            reject(new Error('IndexedDB is not supported in this browser'));
            return;
        }

        // Open the database
        const request = indexedDB.open(databaseName, databaseVersion);

        request.onerror = function(event) {
            reject(new Error('Failed to open database: ' + event.target.error));
        };

        request.onsuccess = function(event) {
            const database = event.target.result;
            
            // Store database reference globally for other methods
            window.db.database = database;
            
            // Create database wrapper object with methods as per requirements
            const dbWrapper = {
                // Store the actual IndexedDB reference
                _database: database,
                
                // Expose database properties for test compatibility
                name: database.name,
                version: database.version,
                
                // Add cost method as required by test sample
                addCost: function(cost) {
                    return window.db.addCost(cost);
                },
                
                // Add other methods for completeness
                getReport: function(month, year, currency) {
                    return window.db.getReport(year, month, currency);
                },
                
                getAllCosts: function() {
                    return window.db.getAllCosts();
                },
                
                clearAllCosts: function() {
                    return window.db.clearAllCosts();
                }
            };
            
            resolve(dbWrapper);
        };

        request.onupgradeneeded = function(event) {
            const database = event.target.result;
            
            // Create the costs object store if it doesn't exist
            if (!database.objectStoreNames.contains('costs')) {
                const costsStore = database.createObjectStore('costs', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                
                // Create indexes for efficient querying
                costsStore.createIndex('year', 'year', { unique: false });
                costsStore.createIndex('month', 'month', { unique: false });
                costsStore.createIndex('category', 'category', { unique: false });
                costsStore.createIndex('currency', 'currency', { unique: false });
                costsStore.createIndex('date', 'date', { unique: false });
            }
        };
    });
};

/**
 * Adds a new cost item to the database
 * @param {Object} cost - Cost object with properties: sum, currency, category, description
 * @returns {Promise} Promise that resolves to the newly added cost item
 */
window.db.addCost = function(cost) {
    return new Promise((resolve, reject) => {
        // Validate input
        if (!cost || typeof cost.sum !== 'number' || typeof cost.currency !== 'string' || 
            typeof cost.category !== 'string' || typeof cost.description !== 'string') {
            reject(new Error('Invalid cost object. Must have sum (number), currency (string), category (string), and description (string)'));
            return;
        }

        // Get the current database instance
        if (!window.db.database) {
            reject(new Error('Database not initialized. Call openCostsDB first.'));
            return;
        }

        // Create the cost item with additional properties
        const costItem = {
            sum: cost.sum,
            currency: cost.currency,
            category: cost.category,
            description: cost.description,
            date: new Date(),
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1, // getMonth() returns 0-11
            day: new Date().getDate()
        };

        // Start a transaction
        const transaction = window.db.database.transaction(['costs'], 'readwrite');
        const costsStore = transaction.objectStore('costs');

        // Add the cost item
        const request = costsStore.add(costItem);

        request.onsuccess = function(event) {
            // Get the added item to return it
            const getRequest = costsStore.get(event.target.result);
            getRequest.onsuccess = function() {
                const addedItem = getRequest.result;
                // Return the item in the required format
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

        request.onerror = function(event) {
            reject(new Error('Failed to add cost item: ' + event.target.error));
        };

        transaction.onerror = function(event) {
            reject(new Error('Transaction failed: ' + event.target.error));
        };
    });
};

/**
 * Gets a detailed report for a specific month and year in a specific currency
 * @param {number} year - Year for the report
 * @param {number} month - Month for the report (1-12)
 * @param {string} currency - Target currency for the report
 * @returns {Promise} Promise that resolves to the report object
 */
window.db.getReport = function(year, month, currency) {
    return new Promise((resolve, reject) => {
        // Validate input
        if (typeof year !== 'number' || typeof month !== 'number' || typeof currency !== 'string') {
            reject(new Error('Invalid parameters. Year and month must be numbers, currency must be a string'));
            return;
        }

        if (month < 1 || month > 12) {
            reject(new Error('Month must be between 1 and 12'));
            return;
        }

        // Get the current database instance
        if (!window.db.database) {
            reject(new Error('Database not initialized. Call openCostsDB first.'));
            return;
        }

        // Start a transaction
        const transaction = window.db.database.transaction(['costs'], 'readonly');
        const costsStore = transaction.objectStore('costs');

        // Get all costs for the specified month and year
        const request = costsStore.getAll();

        request.onsuccess = function() {
            const allCosts = request.result;
            
            // Filter costs for the specified month and year
            const filteredCosts = allCosts.filter(cost => 
                cost.year === year && cost.month === month
            );

            // Convert costs to the target currency and format the report
            const convertedCosts = filteredCosts.map(cost => {
                // Currency conversion using global exchange rates
                const convertedSum = window.db._convertCurrency ? 
                    window.db._convertCurrency(cost.sum, cost.currency, currency) : 
                    cost.sum;
                
                return {
                    sum: convertedSum,
                    currency: currency,
                    category: cost.category,
                    description: cost.description,
                    Date: { day: cost.day }
                };
            });

            // Calculate total
            const total = convertedCosts.reduce((sum, cost) => sum + cost.sum, 0);

            // Create the report object in the required format
            // Note: Requirements document shows: total:{{currency:"USD"},total:440}
            // This appears to be a documentation error, implementing as: total:{currency:"USD", total:440}
            const report = {
                year: year,
                month: month,
                costs: convertedCosts,
                total: { currency: currency, total: total }
            };

            resolve(report);
        };

        request.onerror = function(event) {
            reject(new Error('Failed to retrieve costs: ' + event.target.error));
        };

        transaction.onerror = function(event) {
            reject(new Error('Transaction failed: ' + event.target.error));
        };
    });
};

/**
 * Sets the database instance for internal use
 * @param {IDBDatabase} database - The IndexedDB database instance
 */
window.db.setDatabase = function(database) {
    // If it's a wrapper object with _database property, use that
    if (database && database._database) {
        window.db.database = database._database;
    } else {
        // Otherwise assume it's the actual database
        window.db.database = database;
    }
};

/**
 * Debug function to check database state
 * @returns {Object} Database state information
 */
window.db.getDatabaseState = function() {
    return {
        hasDatabase: !!window.db.database,
        databaseType: typeof window.db.database,
        hasTransaction: !!(window.db.database && typeof window.db.database.transaction === 'function'),
        databaseName: window.db.database ? window.db.database.name : 'undefined',
        databaseVersion: window.db.database ? window.db.database.version : 'undefined'
    };
};

/**
 * Gets all costs from the database (utility method)
 * @returns {Promise} Promise that resolves to an array of all cost items
 */
window.db.getAllCosts = function() {
    return new Promise((resolve, reject) => {
        if (!window.db.database) {
            reject(new Error('Database not initialized. Call openCostsDB first.'));
            return;
        }

        const transaction = window.db.database.transaction(['costs'], 'readonly');
        const costsStore = transaction.objectStore('costs');
        const request = costsStore.getAll();

        request.onsuccess = function() {
            resolve(request.result);
        };

        request.onerror = function(event) {
            reject(new Error('Failed to retrieve costs: ' + event.target.error));
        };
    });
};

/**
 * Clears all costs from the database (utility method for testing)
 * @returns {Promise} Promise that resolves when all costs are cleared
 */
window.db.clearAllCosts = function() {
    return new Promise((resolve, reject) => {
        if (!window.db.database) {
            reject(new Error('Database not initialized. Call openCostsDB first.'));
            return;
        }

        const transaction = window.db.database.transaction(['costs'], 'readwrite');
        const costsStore = transaction.objectStore('costs');
        const request = costsStore.clear();

        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function(event) {
            reject(new Error('Failed to clear costs: ' + event.target.error));
        };
    });
};

/**
 * Currency conversion helper function
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {number} Converted amount
 */
window.db._convertCurrency = function(amount, fromCurrency, toCurrency) {
    // Default exchange rates as per requirements
    const defaultRates = { USD: 1, GBP: 1.8, EURO: 0.7, ILS: 3.4 };
    
    // Try to get rates from global app if available, otherwise use defaults
    const rates = (window.app && window.app.exchangeRates) || defaultRates;
    
    if (fromCurrency === toCurrency) {
        return amount;
    }

    if (!rates[fromCurrency] || !rates[toCurrency]) {
        console.warn(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
        return amount;
    }

    // Convert to USD first, then to target currency
    const usdAmount = amount / rates[fromCurrency];
    return usdAmount * rates[toCurrency];
};
