# Cost Manager - React & MUI Final Project

A cost management web application built with **React** and **Material-UI** for the Front-End Development Final Project.

## Features

✅ **All Requirements Met:**
- Add cost items (amount, currency, category, description)
- Monthly reports with currency conversion
- Pie charts (category breakdown)
- Bar charts (12-month view)
- Multi-currency support (USD, ILS, GBP, EURO)
- Exchange rate API configuration
- IndexedDB local storage

## Technology Stack

- **React 18** - UI framework
- **Material-UI v5** - Component library
- **IndexedDB** - Local database
- **Chart.js** - Charts and visualization

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── App.js                 # Main application
├── components/            # React components
│   ├── AddCostTab.js      # Add expenses
│   ├── ReportsTab.js      # Monthly reports
│   ├── ChartsTab.js       # Data visualization
│   └── SettingsTab.js     # Configuration
└── services/
    └── idb.js             # IndexedDB operations
```

## Database

Uses IndexedDB with:
- Database: `costsdb`
- Object Store: `costs`
- Indexes: year, month, category, currency, date

## Testing

Open `test-idb.html` in browser to test the vanilla idb.js library.

## Requirements Compliance

This project fully implements all specifications from the Front-End Development Final Project requirements:

1. ✅ React + MUI implementation
2. ✅ IndexedDB with idb.js library (React + vanilla versions)
3. ✅ Add cost functionality
4. ✅ Monthly reports with currency conversion
5. ✅ Pie charts by category
6. ✅ Bar charts by month
7. ✅ Multi-currency support (USD, ILS, GBP, EURO)
8. ✅ Exchange rate API integration
9. ✅ Settings configuration
