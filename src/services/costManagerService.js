/*
 * Cost Manager Service - Main Business Logic
 * 
 * 🎯 What this does (for students):
 * This module combines database operations and currency conversion
 * to provide the main business logic for the Cost Manager app.
 * 
 * 📚 Key Learning Concepts:
 * - Service Layer Pattern: Combining multiple services into one interface
 * - Business Logic: The main rules and operations of the application
 * - Data Transformation: Converting data between different formats
 * - Error Handling: Managing errors from multiple services
 */

import databaseService from './databaseService.js';
import exchangeRateService from './exchangeRateService.js';

// Re-export currency constants for convenience
export const CURRENCIES = exchangeRateService.CURRENCIES;
export const currencyInfo = exchangeRateService.currencyInfo;
export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

// Open the database
export const openCostsDB = databaseService.openCostsDB;

// Add a new cost to the database
export const addCost = databaseService.addCost;

// Get all costs (for testing)
export const getAllCosts = databaseService.getAllCosts;

// Clear all costs (for testing)
export const clearAllCosts = databaseService.clearAllCosts;

// Get monthly report with currency conversion
export const getReport = async function(year, month, currency) {
  try {
    // Get raw data from database
    const rawReport = await databaseService.getReport(year, month, currency);
    
    // Convert to target currency
    const convertedReport = await exchangeRateService.convertReport(rawReport, currency);
    
    return convertedReport;
  } catch (error) {
    throw new Error('Failed to get report: ' + error.message);
  }
};

// Get costs for charts (by category for pie chart)
export const getCostsByCategory = async function(year, month, currency) {
  try {
    // Validate currency before proceeding
    if (!CURRENCIES.includes(currency)) {
      throw new Error(`Currency must be one of: ${CURRENCIES.join(', ')}`);
    }
    
    const report = await getReport(year, month, currency);
    
    // Group costs by category
    const categoryTotals = {};
    report.costs.forEach(cost => {
      if (categoryTotals[cost.category]) {
        categoryTotals[cost.category] += cost.sum;
      } else {
        categoryTotals[cost.category] = cost.sum;
      }
    });
    
    return {
      labels: Object.keys(categoryTotals),
      data: Object.values(categoryTotals),
      currency: currency
    };
  } catch (error) {
    throw new Error('Failed to get costs by category: ' + error.message);
  }
};

// Get costs for bar chart (by month for a year)
export const getCostsByMonth = async function(year, currency) {
  try {
    // Validate currency before proceeding
    if (!CURRENCIES.includes(currency)) {
      throw new Error(`Currency must be one of: ${CURRENCIES.join(', ')}`);
    }
    
    const monthlyData = [];
    
    // Get data for each month
    for (let month = 1; month <= 12; month++) {
      try {
        const report = await getReport(year, month, currency);
        monthlyData.push({
          month: month,
          total: report.total.total,
          currency: currency
        });
      } catch (error) {
        // If no data for this month, add zero
        monthlyData.push({
          month: month,
          total: 0,
          currency: currency
        });
      }
    }
    
    return {
      labels: MONTHS.map(m => m.label),
      data: monthlyData.map(d => d.total),
      currency: currency
    };
  } catch (error) {
    throw new Error('Failed to get costs by month: ' + error.message);
  }
};

// Currency conversion functions
export const convertAmount = exchangeRateService.convertAmount;
export const formatCurrency = exchangeRateService.formatCurrency;
export const getCurrencyName = exchangeRateService.getCurrencyName;
export const getCurrencySymbol = exchangeRateService.getCurrencySymbol;
export const isValidCurrency = exchangeRateService.isValidCurrency;

// Exchange rate management
export const fetchExchangeRates = exchangeRateService.fetchExchangeRates;
export const setExchangeUrl = exchangeRateService.setExchangeUrl;
export const getExchangeUrl = exchangeRateService.getExchangeUrl;
export const getExchangeRates = exchangeRateService.getExchangeRates;
export const setExchangeRates = exchangeRateService.setExchangeRates;

// Get array of years for dropdowns
export const getYearOptions = function() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= currentYear - 5; year--) {
    years.push(year);
  }
  return years;
};

// Export everything together
const costManagerService = {
  CURRENCIES,
  currencyInfo,
  MONTHS,
  openCostsDB,
  addCost,
  getReport,
  getAllCosts,
  clearAllCosts,
  getCostsByCategory,
  getCostsByMonth,
  convertAmount,
  formatCurrency,
  getCurrencyName,
  getCurrencySymbol,
  isValidCurrency,
  fetchExchangeRates,
  setExchangeUrl,
  getExchangeUrl,
  getExchangeRates,
  setExchangeRates,
  getYearOptions
};

export default costManagerService;
