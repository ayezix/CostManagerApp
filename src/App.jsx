/*
 * App.js - The Main Application File
 * 
 * 🎯 What this file does (for students):
 * 1. Creates the main app with 4 tabs: Add Cost, Reports, Charts, Settings
 * 2. Connects to the database when the app starts (like opening a file)
 * 3. Shows success/error messages to the user
 * 4. Makes the app look nice with Material-UI theme
 * 
 * 📚 Key Learning Concepts:
 * - React useState: Remembers things (like which tab is active)
 * - React useEffect: Does things when the app starts
 * - Props: Passing data between components (like giving information to a friend)
 * - Event Handlers: Functions that run when user clicks buttons
 */

import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,  // Allows us to customize the app's colors and fonts
  createTheme,    // Creates a custom theme (color scheme)
  CssBaseline,    // Resets default browser styles for consistency
  Container,      // Centers content and adds margins
  AppBar,         // Top navigation bar
  Toolbar,        // Container for items in the AppBar
  Typography,     // For text and headings
  Tabs,           // Tab navigation (Add Cost, Reports, etc.)
  Tab,            // Individual tab button
  Box,            // Generic container for layout
  Alert,          // Colored message boxes
  Snackbar        // Popup notifications (success, error messages)
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Assessment as ReportIcon,
  BarChart as ChartIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

// Import our tab components
import ADDCOSTTAB from './components/AddCostTab.jsx';
import REPORTSTAB from './components/ReportsTab.jsx';
import CHARTSTAB from './components/ChartsTab.jsx';
import SETTINGSTAB from './components/SettingsTab.jsx';

// Import cost manager service
import {
  fetchExchangeRates, 
  setExchangeUrl, 
  getExchangeUrl,
  getExchangeRates,
  setExchangeRates
} from './services/costManagerService';
// Use React service-layer IndexedDB wrapper (not window.idb)
import { openCostsDB as openCostsDBService } from './services/idb.js';

// Create a dark theme with olive green colors and heavier fonts
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { 
      main: '#6b7c32', // Olive green
      light: '#8fa652',
      dark: '#4a5622'
    },
    secondary: { 
      main: '#8b4513' // Dark brown for accents
    },
    background: {
      default: '#1a1a1a',
      paper: '#2d2d2d'
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0'
    }
  },
  typography: {
    fontWeightLight: 500,
    fontWeightRegular: 600,
    fontWeightMedium: 700,
    fontWeightBold: 800,
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 700 }
  }
});

// 📋 Simple component to show the right tab content
// This is like having 4 different pages, but only showing 1 at a time
// For example: if user clicks "Reports" tab, only show the Reports content
function TABPANEL({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {/* Only show content if this is the active tab */}
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function APP() {
  // 📊 React State Variables (these "remember" things for us)
  
  // Which tab is currently active? (0=Add Cost, 1=Reports, 2=Charts, 3=Settings)
  // Think of this like having 4 buttons, and remembering which one was clicked
  const [activeTab, setActiveTab] = useState(0);
  
  // Database connection - like having a connection to a file
  // null means "not connected yet", object means "ready to use"
  const [database, setDatabase] = useState(null);
  
  // Messages to show the user (success, error, info)
  // This is like having a notification popup
  const [snackbar, setSnackbar] = useState({
    open: false,        // Should we show the message? (true/false)
    message: '',        // What message to show? (text)
    severity: 'info'    // What type? ('success', 'error', 'info', 'warning')
  });

  // 🚀 Set up the database when the app starts
  // useEffect with empty [] means "run this code once when app starts"
  useEffect(() => {
    // Step 1: Create a function to set up the database
    const initializeDatabase = async function() {
      try {
        // Open the database using the React service layer
        const db = await openCostsDBService('costsdb', 1);
        setDatabase(db); // Save the database connection
        console.log('✅ Database is ready to use!');
      } catch (error) {
        console.error('❌ Database failed to start:', error);
        showMessage('Database error: ' + error.message, 'error');
      }
    }
    
    // Step 4: Actually run the database setup
    initializeDatabase();
  }, []); // Empty array [] means "only run this once when app starts"

  // 💾 Load saved settings when app starts
  // This is like remembering user preferences from last time
  useEffect(() => {
    // Check if user saved a custom exchange rate URL before
    const savedUrl = localStorage.getItem('exchangeRateUrl');
    if (savedUrl) {
      setExchangeUrl(savedUrl);    // Use their saved URL
      fetchExchangeRates();        // Get fresh exchange rates
    }
  }, []); // Run once when app starts

  // 🔄 Event Handler Functions (these run when user does something)
  
  // When user clicks a different tab, switch to that tab
  const handleTabChange = function(event, newTabValue) {
    setActiveTab(newTabValue); // Update which tab is active
  };

  // Show a message to the user (success, error, info, warning)
  // This is like showing a popup notification
  const showMessage = function(message, severity = 'info') {
    setSnackbar({
      open: true,           // Show the message
      message: message,     // What to say
      severity: severity    // What type (green=success, red=error, etc.)
    });
  };

  // Hide the message when user clicks X or it times out
  const handleSnackbarClose = function(event, reason) {
    if (reason === 'clickaway') return; // Don't close if user clicked elsewhere
    setSnackbar({ ...snackbar, open: false }); // Hide the message
  };

  // 💾 Save user settings (like exchange rate URL)
  const saveSettings = async function(url) {
    // Step 1: Persist or remove URL so we remember next time
    if (url) {
      localStorage.setItem('exchangeRateUrl', url);
      setExchangeUrl(url);
    } else {
      localStorage.removeItem('exchangeRateUrl');
      setExchangeUrl('');
    }

    // Step 2: Refresh exchange rates immediately to reflect on screen
    try {
      await fetchExchangeRates();
      showMessage('Settings saved! Exchange rates updated!', 'success');
    } catch (error) {
      showMessage('Settings saved! Using default exchange rates', 'warning');
    }
  }

  // 🔄 Refresh database connection (for debugging sync issues)
  const refreshDatabase = async function() {
    try {
      // Step 1: Close existing connection if it exists
      if (database && database._database) {
        database._database.close();
      }
      
      // Step 2: Clear the database state
      setDatabase(null);
      
      // Step 3: Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Step 4: Reopen database with fresh connection via React service layer
      const db = await openCostsDBService('costsdb', 1);
      setDatabase(db);
      
      showMessage('Database connection refreshed!', 'success');
      console.log('🔄 Database refreshed successfully');
    } catch (error) {
      showMessage('Failed to refresh database: ' + error.message, 'error');
      console.error('❌ Database refresh failed:', error);
    }
  }

  // 🗑️ Clear all database data (for testing/debugging)
  const clearDatabase = async function() {
    try {
      if (!database) {
        showMessage('Database not ready', 'error');
        return;
      }
      
      // Step 1: Clear all data
      await database.clearAllCosts();
      
      // Step 2: Refresh connection to ensure sync
      await refreshDatabase();
      
      showMessage('Database cleared and refreshed!', 'success');
      console.log('🗑️ Database cleared successfully');
    } catch (error) {
      showMessage('Failed to clear database: ' + error.message, 'error');
      console.error('❌ Database clear failed:', error);
    }
  }

  // 🎨 Render the main application (this creates the visual interface)
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} disableGutters>
        
        {/* Top Navigation Bar */}
        <AppBar position="static" elevation={0}>
          <Container maxWidth="lg">
            <Toolbar>
              <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                Cost Manager
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                React + MUI + IndexedDB Implementation
              </Typography>
            </Toolbar>
          </Container>
        </AppBar>

        {/* Main Content Area */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ 
            bgcolor: 'background.paper', 
            borderRadius: 2, 
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            
            {/* Tab Navigation */}
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="fullWidth"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                bgcolor: 'background.paper'
              }}
            >
              <Tab 
                icon={<WalletIcon />} 
                label="Add Cost" 
                sx={{ py: 2 }}
              />
              <Tab 
                icon={<ReportIcon />} 
                label="Reports" 
                sx={{ py: 2 }}
              />
              <Tab 
                icon={<ChartIcon />} 
                label="Charts" 
                sx={{ py: 2 }}
              />
              <Tab 
                icon={<SettingsIcon />} 
                label="Settings" 
                sx={{ py: 2 }}
              />
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ p: 3, minHeight: 400 }}>
              
              {/* Add Cost Tab */}
              <TABPANEL value={activeTab} index={0}>
                <ADDCOSTTAB showMessage={showMessage} database={database} />
              </TABPANEL>
              
              {/* Reports Tab */}
              <TABPANEL value={activeTab} index={1}>
                <REPORTSTAB showMessage={showMessage} database={database} />
              </TABPANEL>
              
              {/* Charts Tab */}
              <TABPANEL value={activeTab} index={2}>
                <CHARTSTAB showMessage={showMessage} database={database} />
              </TABPANEL>
              
              {/* Settings Tab */}
              <TABPANEL value={activeTab} index={3}>
                <SETTINGSTAB 
                  showMessage={showMessage}
                  exchangeRateUrl={getExchangeUrl()}
                  exchangeRates={getExchangeRates()}
                  onSaveSettings={saveSettings}
                  onRefreshDatabase={refreshDatabase}
                  onClearDatabase={clearDatabase}
                />
              </TABPANEL>
            </Box>
          </Box>
        </Container>

        {/* Message Display (Snackbar) */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default APP;