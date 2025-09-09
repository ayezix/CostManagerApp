# 💰 Cost Manager - Student Project

A **beginner-friendly** expense tracker app built with React! Perfect for students learning web development.

## 🎓 What You'll Learn

This project teaches you:
- **React** - Modern JavaScript framework for building user interfaces
- **Material-UI** - Professional-looking components and styling
- **IndexedDB** - Browser database for storing data locally
- **Chart.js** - Creating beautiful charts and graphs
- **API Integration** - Fetching exchange rates from external services
- **State Management** - Managing data in React applications

## ✨ Features

✅ **What the app can do:**
- ➕ Add new expenses with amount, currency, category, and description
- 📊 View monthly expense reports in any currency
- 🥧 See pie charts showing spending by category
- 📈 View bar charts showing spending by month
- 💱 Support for 4 currencies: USD, ILS, GBP, EURO
- ⚙️ Configure exchange rate API in settings
- 💾 All data stored in your browser (no server needed!)

## 🛠️ Technologies Used

- **React 18** - The main framework for building the user interface
- **Material-UI (MUI)** - Pre-built components for beautiful design
- **IndexedDB** - Browser database for storing expenses locally
- **Chart.js** - Library for creating interactive charts
- **JavaScript ES6+** - Modern JavaScript features

## 🚀 How to Run the Project

### Step 1: Install Dependencies
```bash
npm install
```
This downloads all the packages the project needs (React, Material-UI, Chart.js, etc.)

### Step 2: Start the Development Server
```bash
npm start
```
This starts the React development server. Your app will automatically open in the browser!

### Step 3: Open in Browser
The app will automatically open at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure (What Each File Does)

```
📁 cost-manager-app/
├── 📁 src/                          # Main source code folder
│   ├── 📄 App.js                    # Main app component (creates the tabs)
│   ├── 📄 index.js                  # Entry point (starts React)
│   ├── 📁 components/               # All our React components
│   │   ├── 📄 AddCostTab.js         # Form to add new expenses
│   │   ├── 📄 ReportsTab.js         # Shows monthly expense reports
│   │   ├── 📄 ChartsTab.js          # Creates pie and bar charts
│   │   └── 📄 SettingsTab.js        # Settings for exchange rates
│   └── 📁 services/                 # Helper services
│       ├── 📄 currencyService.js    # Handles currency conversion
│       └── 📄 idb.js                # Database functions for React
├── 📁 public/                       # Public files
│   ├── 📄 index.html                # Main HTML file
│   ├── 📄 idb.js                    # Database library (vanilla JS)
│   └── 📄 sample-rates.json         # Example exchange rates
├── 📄 idb.js                        # Vanilla JS database library (for testing)
├── 📄 test-idb.html                 # Test page for database functions
└── 📄 README.md                     # This file!
```

## 💾 How the Database Works

The app uses **IndexedDB** (a browser database) to store your expenses:
- **Database Name**: `costsdb`
- **Table Name**: `costs` 
- **What we store**: Each expense with amount, currency, category, description, and date
- **Why IndexedDB**: Works offline, stores lots of data, built into all browsers

## 🧪 Testing the Database

Open `test-idb.html` in your browser to test the database functions. This helps make sure everything works correctly!

## 🎓 Student Learning Features

This project is designed to help you learn step by step:

### ✅ **Code Quality**
- 📝 **Lots of comments** - Every function and complex line explained
- 🔤 **Simple variable names** - Easy to understand what each variable does
- 📚 **Educational structure** - Code organized to help you learn
- 🎯 **Beginner-friendly patterns** - No advanced JavaScript tricks

### ✅ **React Concepts You'll Practice**
- 🎣 **React Hooks** - `useState` for managing data, `useEffect` for side effects
- 🧩 **Components** - Breaking UI into reusable pieces
- 📊 **State Management** - How to store and update data in React
- 🔄 **Props** - Passing data between components
- 🎨 **Material-UI** - Using pre-built professional components

### ✅ **Database Skills**
- 💾 **IndexedDB** - Browser database for storing data
- 🔍 **CRUD Operations** - Create, Read, Update, Delete data
- 📋 **Promises** - Handling asynchronous database operations
- 🔧 **Two versions** - React version + vanilla JavaScript version

### ✅ **API Integration**
- 🌐 **Fetch API** - Getting data from external services
- 💱 **Exchange Rates** - Working with real financial data
- ⚙️ **Configuration** - Letting users customize API endpoints

## 💱 Currency Exchange Rates

The app can get live exchange rates from any API that returns this format:

```json
{
  "USD": 1,
  "GBP": 1.8,
  "EURO": 0.7,
  "ILS": 3.4
}
```

**Try it out**: Use `http://localhost:3000/sample-rates.json` in the settings!

## 🤔 Common Student Questions

**Q: Why do we have two idb.js files?**
A: One works with React imports (`src/services/idb.js`), one works in plain HTML (`idb.js`). This shows you both ways to write JavaScript!

**Q: What's the difference between state and props?**
A: State is data that belongs to a component. Props are data passed from a parent component to a child.

**Q: Why use IndexedDB instead of localStorage?**
A: IndexedDB can store much more data and complex objects. localStorage is limited and only stores strings.

**Q: How do the charts work?**
A: We use Chart.js library to create beautiful charts from our expense data. The data comes from our IndexedDB database!

## 🎯 Next Steps for Learning

After understanding this project, try:
1. 🎨 **Customize the styling** - Change colors, fonts, layout
2. 📊 **Add new chart types** - Line charts, doughnut charts
3. 📱 **Make it responsive** - Work better on mobile devices
4. 🔍 **Add search functionality** - Find specific expenses
5. 📤 **Export data** - Download expenses as CSV or PDF
6. 🔔 **Add notifications** - Remind users to add expenses
