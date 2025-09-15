/*
 * Exchange Rate Service - Server Communication for Currency Data
 * 
 * 🎯 What this does (for students):
 * This module handles all communication with external servers to fetch exchange rates.
 * It's completely separate from database operations and UI components.
 * 
 * 📚 Key Learning Concepts:
 * - API Communication: Using fetch() to get data from external servers
 * - Error Handling: What to do when API calls fail
 * - Data Transformation: Converting API responses to app format
 * - Configuration Management: Storing and updating API endpoints
 */

// 🌐 Default exchange rate API endpoint
const defaultExchangeUrl = 'https://api.exchangerate-api.com/v4/latest/USD';

// 💱 The 4 currencies our app supports
export const CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];

// 💰 Information about each currency - full name and symbol
export const currencyInfo = {
  USD: { name: 'US Dollar', symbol: '$' },
  ILS: { name: 'Israeli Shekel', symbol: '₪' },
  GBP: { name: 'British Pound', symbol: '£' },
  EURO: { name: 'European Euro', symbol: '€' }
};

// Current exchange rates (how much 1 USD is worth in other currencies)
let exchangeRates = {
  USD: 1,     // US Dollar is our "base" currency (always 1)
  GBP: 0.8,   // 1 USD = 0.8 British Pounds
  EURO: 0.85, // 1 USD = 0.85 Euros
  ILS: 3.5    // 1 USD = 3.5 Israeli Shekels
};

// The website URL we use to get fresh exchange rates
let exchangeUrl = defaultExchangeUrl;

// This function gets fresh exchange rates from the internet
export const fetchExchangeRates = async function() {
  try {
    // Step 1: Ask the API website for current exchange rates
    const response = await fetch(exchangeUrl);
    
    // Step 2: Check if the website responded successfully
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    // Step 3: Convert the response to JavaScript object
    const data = await response.json();
    
    // Step 4: Extract just the currencies we care about
    const rates = {
      USD: data.rates.USD || 1,      // Use API rate, or fallback to 1
      GBP: data.rates.GBP || 0.8,    // Use API rate, or fallback to 0.8
      EURO: data.rates.EUR || 0.85,  // Note: API uses "EUR", we use "EURO"
      ILS: data.rates.ILS || 3.5     // Use API rate, or fallback to 3.5
    };
    
    // Step 5: Update our app's exchange rates
    exchangeRates = rates;
    
    // Step 6: Share these rates with other parts of the app
    if (window) {
      window.app = window.app || {};
      window.app.exchangeRates = exchangeRates;
    }
    
    // Step 7: Return the new rates
    return rates;
  } catch (error) {
    // If anything goes wrong (no internet, bad URL, etc.), use our default rates
    console.warn('Could not get exchange rates, using defaults:', error);
    return exchangeRates;
  }
};

// This function converts money from one currency to another
export const convertAmount = function(amount, fromCurrency, toCurrency) {
  // If it's the same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Currency conversion always goes through USD (our base currency)
  const usdAmount = amount / exchangeRates[fromCurrency];        // Convert to USD first
  const convertedAmount = usdAmount * exchangeRates[toCurrency]; // Then to target currency
  
  return convertedAmount;
};

// Convert a whole report to different currency
export const convertReport = async function(report, targetCurrency) {
  // Get fresh exchange rates first
  await fetchExchangeRates();
  
  const convertedCosts = report.costs.map(cost => ({
    sum: convertAmount(cost.sum || 0, cost.currency, targetCurrency),
    currency: targetCurrency,
    category: cost.category,
    description: cost.description,
    Date: { day: cost.day }
  }));
  
  const convertedTotal = convertedCosts.reduce((sum, cost) => sum + cost.sum, 0);
  
  return {
    year: report.year,
    month: report.month,
    costs: convertedCosts,
    total: {
      currency: targetCurrency,
      total: convertedTotal
    }
  };
};

// Set the URL for getting exchange rates
export const setExchangeUrl = function(url) {
  exchangeUrl = url;
};

// Get the current exchange rates URL
export const getExchangeUrl = function() {
  return exchangeUrl;
};

// Get current exchange rates
export const getExchangeRates = function() {
  return { ...exchangeRates };
};

// Set exchange rates manually
export const setExchangeRates = function(rates) {
  exchangeRates = { ...rates };
  
  // Share with other parts of the app
  if (window) {
    window.app = window.app || {};
    window.app.exchangeRates = exchangeRates;
  }
};

// Format currency amount with symbol
export const formatCurrency = function(amount, currency) {
  if (typeof amount !== 'number') {
    return 'Invalid amount';
  }

  if (!CURRENCIES.includes(currency)) {
    return `${amount.toFixed(2)} ${currency}`;
  }

  const currencyInfoData = currencyInfo[currency];
  const formattedAmount = amount.toFixed(2);
  
  if (currencyInfoData.symbol) {
    return `${currencyInfoData.symbol}${formattedAmount}`;
  }
  
  return `${formattedAmount} ${currency}`;
};

// Get currency display name
export const getCurrencyName = function(currency) {
  return currencyInfo[currency]?.name || currency;
};

// Get currency symbol
export const getCurrencySymbol = function(currency) {
  return currencyInfo[currency]?.symbol || currency;
};

// Check if currency is supported
export const isValidCurrency = function(currency) {
  return CURRENCIES.includes(currency);
};

// Export everything together
const exchangeRateService = {
  CURRENCIES,
  currencyInfo,
  fetchExchangeRates,
  convertAmount,
  convertReport,
  setExchangeUrl,
  getExchangeUrl,
  getExchangeRates,
  setExchangeRates,
  formatCurrency,
  getCurrencyName,
  getCurrencySymbol,
  isValidCurrency
};

export default exchangeRateService;
