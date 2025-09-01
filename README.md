# Cost Manager Front End Application

A comprehensive cost management web application built with **React**, **Material-UI (MUI)**, and **IndexedDB** for local data storage. This project fulfills all requirements for the Front-End Development Final Project with modern React architecture, MUI components, and enhanced user experience.

## Features

✅ **All Final Project Requirements Implemented:**

- **React & MUI**: Complete implementation using React 18 and Material-UI v5 components
- **Add Cost Items**: Track expenses with amount, currency, category, and description (auto-dated)
- **Monthly Reports**: Generate detailed reports for specific months and years in selected currency
- **Pie Charts**: Interactive charts using React-Chart.js for category breakdown
- **Bar Charts**: Dynamic monthly trends visualization with Chart.js integration
- **Multi-Currency Support**: USD, ILS, GBP, and EURO with real-time exchange rate conversion
- **Exchange Rate API**: Configurable API endpoint for live exchange rate data
- **IndexedDB Storage**: Professional database implementation with React service layer
- **Testing Interface**: Vanilla idb.js library for testing (as required by specification)
- **Modern UI**: Material Design with light blue theme and responsive layout
- **Enhanced UX**: MUI components, snackbar notifications, form validation, loading states

## Project Structure

```
cost-manager-app/
├── public/
│   ├── index.html              # React app entry point
│   ├── manifest.json           # PWA manifest
│   └── robots.txt             # SEO configuration
├── src/
│   ├── components/
│   │   ├── AddCostTab.js      # Add cost form component (MUI)
│   │   ├── ReportsTab.js      # Monthly reports component (MUI)
│   │   ├── ChartsTab.js       # Charts with React-Chart.js
│   │   └── SettingsTab.js     # Settings component (MUI)
│   ├── services/
│   │   └── idb.js             # React module-compatible IndexedDB service
│   ├── App.js                 # Main React application component
│   ├── index.js               # React DOM entry point
│   └── reportWebVitals.js     # Performance monitoring
├── idb.js                     # Vanilla idb.js for testing (required)
├── test-idb.html              # Test file for vanilla idb.js library
├── exchange-rates-sample.json  # Sample exchange rate data
├── package.json               # React dependencies and scripts
├── .gitignore                 # Git ignore configuration
└── README.md                  # This documentation
```

## Two Versions of idb.js (As Required)

As specified in the requirements document, this project includes **two versions of idb.js**:

### 1. React Module Version (`src/services/idb.js`)
- **Purpose**: Compatible with ES6 modules for React development
- **Format**: ES6 module exports with named and default exports
- **Usage**: `import * as idb from './services/idb'` or `import { addCost, getReport } from './services/idb'`
- **Features**: 
  - Module-compatible function exports
  - Proper ES6 import/export syntax
  - Integrated with React application state

**Example Usage in React:**
```javascript
import * as idb from './services/idb';

// Initialize database
const db = await idb.openCostsDB('costsdb', 1);
idb.setDatabase(db);

// Add cost
const result = await idb.addCost({
  sum: 100,
  currency: 'USD', 
  category: 'Food',
  description: 'Lunch'
});
```

### 2. Vanilla Version (`idb.js`)
- **Purpose**: For testing and compatibility with simple HTML files
- **Format**: Global `window.db` and `window.idb` objects
- **Usage**: Direct function calls on global objects
- **Features**:
  - Global scope functions
  - Compatible with vanilla HTML/JavaScript
  - Used by `test-idb.html` for testing

**Example Usage in Vanilla JS:**
```javascript
// Initialize database
const db = await idb.openCostsDB('costsdb', 1);
idb.setDatabase(db);

// Add cost  
const result = await idb.addCost({
  sum: 100,
  currency: 'USD',
  category: 'Food', 
  description: 'Lunch'
});
```

### Function Specifications (Both Versions)

Both versions implement the exact same function signatures as required:

- **`openCostsDB(databaseName, databaseVersion)`**: Opens/creates database
- **`addCost(cost)`**: Adds new cost item
- **`getReport(year, month, currency)`**: Generates monthly report
- **`setDatabase(database)`**: Sets database instance
- **`getAllCosts()`**: Utility function for all costs
- **`clearAllCosts()`**: Testing utility for clearing data

## Setup Instructions

### 1. Development Setup

1. **Install Node.js** (version 16 or higher)
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start development server**:
   ```bash
   npm start
   ```
4. **Open** [http://localhost:3000](http://localhost:3000) in your browser

### 2. Production Build

1. **Create production build**:
   ```bash
   npm run build
   ```
2. **Serve static files**:
   ```bash
   npm run serve-static
   ```
3. **Deploy** the `build` folder to your web server

### 3. Testing the idb.js Library

1. **Open** `test-idb.html` in your browser (vanilla version for testing)
2. **Click** the test buttons to verify IndexedDB functionality
3. **Check** the browser console for detailed logs

### 4. Web Deployment

1. **Build** the application using `npm run build`
2. **Upload** the `build` folder contents to your web server
3. **Ensure** the server supports CORS for exchange rate API calls
4. **Test** the application in Google Chrome (latest version)

## Technical Requirements

- **Node.js**: Version 16 or higher
- **React**: Version 18.2.0
- **Material-UI**: Version 5.14.20
- **Browser Support**: Modern browsers with React support and IndexedDB
- **JavaScript**: ES6+ features (React JSX, async/await, classes, arrow functions)
- **Charts**: Chart.js with React-Chart.js integration
- **Storage**: IndexedDB for local data persistence

## Database Schema

The application uses IndexedDB with the following structure:

- **Database Name**: `costsdb`
- **Version**: 1
- **Object Store**: `costs`
- **Indexes**: year, month, category, currency, date

## Requirements Compliance

### Final Project Requirements ✅

This application fully implements all requirements from the Front-End Development Final Project specification:

1. **✅ Add Cost Items**: Users can add new cost items with sum, currency, category, and description
2. **✅ Monthly Reports**: Generate detailed reports for specific month/year in selected currency  
3. **✅ Pie Charts**: Show total costs by category for selected month/year
4. **✅ Bar Charts**: Display monthly totals for all 12 months in selected year
5. **✅ Multi-Currency**: Support for USD, ILS, GBP, EURO with conversion
6. **✅ Exchange Rate API**: Configurable URL for getting currency exchange rates
7. **✅ IndexedDB**: Complete database implementation with proper schema
8. **✅ idb.js Library**: Promise-based wrapper with exact function specifications
9. **✅ Testing**: HTML test file matching requirements document sample
10. **✅ Two idb.js Versions**: React module version + vanilla version for testing

### Exchange Rate API Integration

The application supports custom exchange rate APIs. Configure the URL in the Settings tab:

**Expected Response Format (as per requirements):**
```json
{
  "USD": 1,
  "GBP": 1.8,
  "EURO": 0.7,
  "ILS": 3.4
}
```

**Requirements:**
- Must return JSON data in exact format above
- Must include CORS headers (`Access-Control-Allow-Origin: *`)
- Rates are relative to USD (USD = 1)

## Usage Guide

### Adding Costs

1. Navigate to the "Add Cost" tab
2. Fill in the amount, select currency and category
3. Add a description for the expense
4. Click "Add Cost Item"

### Generating Reports

1. Go to the "Reports" tab
2. Select year, month, and target currency
3. Click "Generate Report"
4. View detailed breakdown of costs

### Creating Charts

#### Pie Chart (Category Breakdown)
1. Navigate to "Charts" tab
2. Select year, month, and currency for pie chart
3. Click "Generate Pie Chart"

#### Bar Chart (Monthly Trends)
1. In the "Charts" tab
2. Select year and currency for bar chart
3. Click "Generate Bar Chart"

### Settings Configuration

1. Go to "Settings" tab
2. Enter your exchange rate API URL
3. Click "Save Settings"

## Browser Compatibility

- **Chrome**: 60+ (Recommended)
- **Firefox**: 55+
- **Safari**: 11+
- **Edge**: 79+

## Theme and Design

### Light Blue Theme 🎨

The application features a modern light blue color scheme:
- **Primary Color**: #64b5f6 (Light Blue)
- **Secondary Color**: #42a5f5 (Darker Blue)
- **Gradient Background**: Linear gradient from light to dark blue
- **Accent Elements**: Consistent blue theme throughout all UI components

### UI Enhancements

- **Modern Icons**: Material Design icons for better visual appeal
- **Enhanced Forms**: Improved validation, placeholders, and help text
- **Accessibility**: Proper ARIA labels and semantic HTML
- **Responsive Design**: Mobile-friendly layout with MUI Grid system
- **Professional Styling**: Cards, shadows, and smooth transitions

## Development Notes

### Code Style

The application follows React and JavaScript best practices:
- **React Functional Components**: Using React Hooks (useState, useEffect)
- **Material-UI Components**: Consistent MUI design system implementation
- **Component Structure**: Modular, reusable React components
- **Service Layer**: Separated business logic in service files
- **Error Handling**: Comprehensive try-catch blocks with user feedback
- **Modern JavaScript**: ES6+ syntax with JSX, async/await, destructuring
- **TypeScript Ready**: Structured for easy TypeScript migration

### Architecture

- **React Component Architecture**: Clean separation of concerns
- **MUI Theme System**: Consistent design tokens and theming
- **Service Layer Pattern**: Database operations in dedicated service
- **State Management**: React hooks for local state management
- **Promise-based**: All database operations return promises
- **Responsive Design**: MUI breakpoints and responsive components

## Testing

### Manual Testing

1. **Database Operations**: Use the test interface in `test-idb.html`
2. **UI Functionality**: Test all tabs and form submissions
3. **Data Persistence**: Verify data remains after page refresh
4. **Chart Generation**: Test with various data sets

### Automated Testing

The `idb.js` library can be tested using the provided test file or integrated into automated testing frameworks.

## Troubleshooting

### Common Issues

1. **Database Errors**: Clear browser data or use the "Clear Database" function
2. **Charts Not Displaying**: Ensure Chart.js is properly loaded
3. **Exchange Rate Issues**: Verify API URL and CORS configuration
4. **Performance Issues**: Large datasets may affect chart rendering

### Debug Mode

Open browser developer tools and check the console for detailed error messages and operation logs.

## Deployment Checklist

- [ ] All files uploaded to web server
- [ ] CORS properly configured for exchange rate API
- [ ] Application tested in Google Chrome
- [ ] IndexedDB permissions enabled
- [ ] HTTPS enabled (recommended for production)

## Recent Updates 🚀

### Version 3.0 - React & MUI Implementation

**Major Architecture Change:**
- ✅ **Complete React Implementation**: Migrated from vanilla JavaScript to React 18
- ✅ **Material-UI Integration**: Full MUI v5 component library implementation
- ✅ **Modern React Patterns**: Functional components with hooks (useState, useEffect)
- ✅ **Component Architecture**: Modular, reusable React components

**Requirements Compliance:**
- ✅ **React & MUI Required**: Now fully compliant with specification requirements
- ✅ **Dual idb.js Versions**: React ES6 module version + vanilla version for testing
- ✅ **Enhanced Charts**: React-Chart.js integration for interactive charts
- ✅ **Professional UI**: Material Design with light blue theme

**Technical Improvements:**
- ✅ **React Ecosystem**: Modern build tools with Create React App
- ✅ **MUI Components**: Consistent design system implementation
- ✅ **Better State Management**: React hooks for clean state handling
- ✅ **Enhanced UX**: Snackbar notifications, loading states, form validation

## Final Project Submission Ready ✅

This application is fully prepared for final project submission with:
- **✅ React & MUI**: Complete implementation as required by specification
- **✅ Complete functionality** meeting all 9 core requirements
- **✅ Two idb.js Versions**: React module version + vanilla testing version
- **✅ Professional code quality** with modern React architecture
- **✅ Material Design** with light blue theme and responsive layout
- **✅ Comprehensive testing** suite with vanilla idb.js included
- **✅ Production ready** with optimized build configuration

## License

This project is created for educational purposes as part of a Front-End Development course final project.