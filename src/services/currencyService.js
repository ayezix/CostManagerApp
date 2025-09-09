// Currency Service - This file handles all currency-related functions
// Think of this as a "currency calculator" that can:
// 1. Convert money between different currencies (like USD to ILS)
// 2. Get live exchange rates from the internet
// 3. Format money amounts with proper symbols (like $5.99)

// This is a website that gives us current exchange rates for free
// You can change this to any other API that returns currency rates
const DEFAULT_EXCHANGE_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

// The 4 currencies our app supports - you could add more if needed!
export const CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];

// All 12 months with their numbers (1-12) - used by reports and charts
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

// Information about each currency - full name and symbol
// This helps us show "US Dollar ($)" instead of just "USD"
export const CURRENCY_INFO = {
  USD: { name: 'US Dollar', symbol: '$' },      // American money
  ILS: { name: 'Israeli Shekel', symbol: '₪' }, // Israeli money  
  GBP: { name: 'British Pound', symbol: '£' },  // British money
  EURO: { name: 'European Euro', symbol: '€' }  // European money
};

// These are the current exchange rates - how much 1 USD is worth in other currencies
// For example: if USD is 1 and ILS is 3.5, then $1 = ₪3.5
let exchangeRates = {
  USD: 1,     // US Dollar is our "base" currency (always 1)
  GBP: 0.8,   // 1 USD = 0.8 British Pounds
  EURO: 0.85, // 1 USD = 0.85 Euros
  ILS: 3.5    // 1 USD = 3.5 Israeli Shekels
};

// The website URL we use to get fresh exchange rates
let exchangeUrl = DEFAULT_EXCHANGE_URL;

// This function gets fresh exchange rates from the internet
// It's like checking the latest prices before buying something online
export const fetchExchangeRates = async () => {
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
    // The API might return 100+ currencies, but we only need 4
    const rates = {
      USD: data.rates.USD || 1,      // Use API rate, or fallback to 1
      GBP: data.rates.GBP || 0.8,    // Use API rate, or fallback to 0.8
      EURO: data.rates.EUR || 0.85,  // Note: API uses "EUR", we use "EURO"
      ILS: data.rates.ILS || 3.5     // Use API rate, or fallback to 3.5
    };
    
    // Step 5: Update our app's exchange rates
    exchangeRates = rates;
    
    // Step 6: Share these rates with other parts of the app (like the database)
    // This is for backward compatibility with the old system
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
// Example: convertAmount(100, 'USD', 'ILS') converts $100 to Israeli Shekels
export const convertAmount = (amount, fromCurrency, toCurrency) => {
  // If it's the same currency, no conversion needed
  // Like converting $5 to $5 - it stays $5!
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Currency conversion always goes through USD (our base currency)
  // Step 1: Convert FROM currency to USD
  // Step 2: Convert USD to TO currency
  
  // Example: Converting ₪100 to €
  // Step 1: ₪100 ÷ 3.5 = $28.57 USD
  // Step 2: $28.57 × 0.85 = €24.29
  
  const usdAmount = amount / exchangeRates[fromCurrency];        // Convert to USD first
  const convertedAmount = usdAmount * exchangeRates[toCurrency]; // Then to target currency
  
  return convertedAmount;
};

// Convert a whole report to different currency
export const convertCurrency = async (report, targetCurrency) => {
  // Get fresh exchange rates first
  await fetchExchangeRates();
  
  const convertedCosts = report.costs.map(cost => ({
    ...cost,
    sum: convertAmount(cost.sum || 0, cost.currency, targetCurrency),
    currency: targetCurrency
  }));
  
  const convertedTotal = convertedCosts.reduce((sum, cost) => sum + cost.sum, 0);
  
  return {
    ...report,
    costs: convertedCosts,
    total: {
      currency: targetCurrency,
      total: convertedTotal
    }
  };
};

// Set the URL for getting exchange rates
export const setExchangeUrl = (url) => {
  exchangeUrl = url;
};

// Get the current exchange rates URL
export const getExchangeUrl = () => {
  return exchangeUrl;
};

// Get current exchange rates
export const getExchangeRates = () => {
  return { ...exchangeRates };
};

// Set exchange rates manually
export const setExchangeRates = (rates) => {
  exchangeRates = { ...rates };
  
  // Share with other parts of the app
  if (window) {
    window.app = window.app || {};
    window.app.exchangeRates = exchangeRates;
  }
};

// Format currency amount with symbol
export const formatCurrency = (amount, currency) => {
  if (typeof amount !== 'number') {
    return 'Invalid amount';
  }

  if (!CURRENCIES.includes(currency)) {
    return `${amount.toFixed(2)} ${currency}`;
  }

  const currencyInfo = CURRENCY_INFO[currency];
  const formattedAmount = amount.toFixed(2);
  
  if (currencyInfo.symbol) {
    return `${currencyInfo.symbol}${formattedAmount}`;
  }
  
  return `${formattedAmount} ${currency}`;
};

// Get currency display name
export const getCurrencyName = (currency) => {
  return CURRENCY_INFO[currency]?.name || currency;
};

// Get currency symbol
export const getCurrencySymbol = (currency) => {
  return CURRENCY_INFO[currency]?.symbol || currency;
};

// Check if currency is supported
export const isValidCurrency = (currency) => {
  return CURRENCIES.includes(currency);
};

// Get array of years for dropdowns (current year and 5 years back)
export const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= currentYear - 5; year--) {
    years.push(year);
  }
  return years;
};
