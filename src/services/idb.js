// idb.js - Backward Compatibility Wrapper
// This file maintains backward compatibility while using the new separated services

import costManagerService from './costManagerService.js';

// Re-export all functions for backward compatibility
export const openCostsDB = costManagerService.openCostsDB;
export const addCost = costManagerService.addCost;
export const getReport = costManagerService.getReport;
export const getAllCosts = costManagerService.getAllCosts;
export const clearAllCosts = costManagerService.clearAllCosts;

// Export everything together for backward compatibility
const idb = {
    openCostsDB,
    addCost,
    getReport,
    getAllCosts,
    clearAllCosts
};

export default idb;
