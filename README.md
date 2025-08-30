# Cost Manager Front End Application

A comprehensive cost management web application built with vanilla JavaScript and IndexedDB for local data storage.

## Features

- **Add Cost Items**: Track expenses with amount, currency, category, and description
- **Monthly Reports**: Generate detailed reports for specific months and years
- **Pie Charts**: Visualize costs by category for selected months
- **Bar Charts**: View monthly cost trends throughout the year
- **Multi-Currency Support**: USD, ILS, GBP, and EURO with exchange rate conversion
- **Local Storage**: Data stored locally using IndexedDB
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
cost-manager-app/
├── index.html          # Main application HTML file
├── styles.css          # Application styling
├── app.js             # Main application logic
├── idb.js             # IndexedDB wrapper library
├── test-idb.html      # Test file for idb.js library
└── README.md          # This file
```

## Setup Instructions

### 1. Local Development

1. **Clone or download** the project files to your local machine
2. **Open** `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
3. **No build process required** - the application runs directly in the browser

### 2. Testing the idb.js Library

1. **Open** `test-idb.html` in your browser
2. **Click** the test buttons to verify IndexedDB functionality
3. **Check** the browser console for detailed logs

### 3. Web Deployment

1. **Upload** all project files to your web server
2. **Ensure** the server supports CORS for exchange rate API calls
3. **Test** the application in Google Chrome (latest version)

## Technical Requirements

- **Browser Support**: Modern browsers with IndexedDB support
- **JavaScript**: ES6+ features (async/await, classes, arrow functions)
- **Charts**: Chart.js library (loaded via CDN)
- **Storage**: IndexedDB for local data persistence

## Database Schema

The application uses IndexedDB with the following structure:

- **Database Name**: `costsdb`
- **Version**: 1
- **Object Store**: `costs`
- **Indexes**: year, month, category, currency, date

## API Integration

### Exchange Rate API

The application supports custom exchange rate APIs. Configure the URL in the Settings tab:

**Expected Response Format:**
```json
{
  "USD": 1,
  "GBP": 1.8,
  "EURO": 0.7,
  "ILS": 3.4
}
```

**Requirements:**
- Must return JSON data
- Must include CORS headers (`Access-Control-Allow-Origin: *`)
- Should provide rates relative to USD

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

## Development Notes

### Code Style

The application follows JavaScript style guidelines:
- Consistent indentation (2 spaces)
- Descriptive variable and function names
- Comprehensive error handling
- Async/await for asynchronous operations
- ES6+ syntax throughout

### Architecture

- **Modular Design**: Separated concerns between UI, data, and business logic
- **Promise-based**: All database operations return promises
- **Event-driven**: UI interactions handled through event listeners
- **Responsive**: CSS Grid and Flexbox for layout

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
2. **Charts Not Displaying**: Ensure Chart.js CDN is accessible
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

## License

This project is created for educational purposes as part of a Front-End Development course.

## Support

For technical issues or questions, refer to the course forum or documentation provided with the assignment.
