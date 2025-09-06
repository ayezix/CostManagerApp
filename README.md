# 💰 Cost Manager - Student Project

A simple expense tracker built with **React + Material-UI** and **IndexedDB** - perfect for students learning modern web development!

## Features

✅ **Core Functionality:**
- Add cost items (amount, currency, category, description)
- Monthly reports with currency conversion
- Pie charts (category breakdown)
- Bar charts (monthly totals)
- Multi-currency support (USD, ILS, GBP, EURO)
- Exchange rate API configuration
- IndexedDB local storage

## Technology Stack

- **React 18** - Modern JavaScript framework
- **Material-UI (MUI)** - Beautiful React components
- **Create React App** - Easy project setup
- **IndexedDB** - Browser database storage
- **Chart.js** - Charts and visualization

## Quick Start

1. Install all the packages we need:
   ```bash
   npm install
   ```

2. Start the React app:
   ```bash
   npm start
   ```

3. Open [http://localhost:3001](http://localhost:3001) in your browser

## Project Structure

```
src/
├── App.js                 # Main React component with tabs
├── index.js               # React entry point
├── reportWebVitals.js     # Performance monitoring
└── components/
    ├── AddCostTab.js      # Add expense form
    ├── ReportsTab.js      # Monthly reports
    ├── ChartsTab.js       # Pie and bar charts
    └── SettingsTab.js     # Settings configuration
public/
├── idb.js                 # React-compatible IndexedDB library
└── sample-rates.json      # Sample exchange rates
idb.js                     # Vanilla IndexedDB library (for submission)
test-idb.html             # Comprehensive testing suite
```

## Database

Uses IndexedDB with:
- Database: `costsdb`
- Object Store: `costs`
- Indexes: year, month, category, currency, date

## Testing

Open `test-idb.html` in browser to test the vanilla idb.js library.

## Student-Friendly Features

This implementation focuses on **clarity and learning**:

1. ✅ **React + MUI implementation** - Modern, professional UI framework
2. ✅ **IndexedDB with idb.js library** - Both React + vanilla versions
3. ✅ **Add cost functionality** - Complete form with validation
4. ✅ **Monthly reports** - With currency conversion
5. ✅ **Pie charts by category** - Visual expense breakdown
6. ✅ **Bar charts by month** - 12-month overview
7. ✅ **Multi-currency support** - USD, ILS, GBP, EURO
8. ✅ **Exchange rate API integration** - Configurable URL
9. ✅ **Settings configuration** - Easy customization
10. ✅ **Extensive comments** - Every function explained
11. ✅ **Student-friendly code** - Clear, simple patterns

## Exchange Rates

Configure a JSON endpoint with this format:
```json
{
  "USD": 1,
  "GBP": 1.8,
  "EURO": 0.7,
  "ILS": 3.4
}
```

Example: `http://localhost:3001/sample-rates.json`
