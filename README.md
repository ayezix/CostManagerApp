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
├── main.js                # Application entry point
├── styles.css             # Clean, modern styling
└── services/
    ├── idb.js             # IndexedDB operations
    ├── currency.js        # Currency conversion
    └── charts.js          # Chart.js wrapper
public/
└── sample-rates.json      # Sample exchange rates
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

1. ✅ **Pure JavaScript** - No complex frameworks to learn
2. ✅ **Modular code** - Clear separation of concerns
3. ✅ **Extensive comments** - Every function explained
4. ✅ **Error handling** - Proper try/catch blocks
5. ✅ **Console logging** - Easy debugging
6. ✅ **Simple HTML/CSS** - Clean, readable structure
7. ✅ **Modern ES6+** - Current JavaScript best practices

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

Example: `http://localhost:5173/sample-rates.json`

