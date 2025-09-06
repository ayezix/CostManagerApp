// App.js - Simple Student Version
// This is the main file for our Cost Manager app
// It creates the tabs and handles the database connection

import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Assessment as ReportIcon,
  BarChart as ChartIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

// Import our tab components
import AddCostTab from './components/AddCostTab';
import ReportsTab from './components/ReportsTab';
import ChartsTab from './components/ChartsTab';
import SettingsTab from './components/SettingsTab';

// Create a simple blue theme for our app
const theme = createTheme({
  palette: {
    primary: { 
      main: '#1976d2' // Blue color
    },
    secondary: { 
      main: '#dc004e' // Pink color
    }
  }
});

// Simple component to show the right tab content
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  // State for currently active tab (0=Add Cost, 1=Reports, 2=Charts, 3=Settings)
  const [activeTab, setActiveTab] = useState(0);
  
  // State for database connection
  const [database, setDatabase] = useState(null);
  
  // State for exchange rates (default rates as per requirements)
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1,
    GBP: 1.8,
    EURO: 0.7,
    ILS: 3.4
  });
  
  // State for exchange rate URL setting
  const [exchangeRateUrl, setExchangeRateUrl] = useState('');
  
  // State for showing messages to user
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Set up the database when the app starts
  useEffect(() => {
    async function initializeDatabase() {
      try {
        // Check if our idb.js library is loaded
        if (window.idb) {
          // Open the database (like opening a file)
          const db = await window.idb.openCostsDB('costsdb', 1);
          setDatabase(db);
          console.log('✅ Database is ready!');
        } else {
          throw new Error('idb.js library not loaded');
        }
      } catch (error) {
        console.error('❌ Database failed to start:', error);
        showMessage('Database error: ' + error.message, 'error');
      }
    }
    
    initializeDatabase();
  }, []); // This runs once when the app starts

  // Share exchange rates with the idb.js library
  useEffect(() => {
    window.app = { exchangeRates };
  }, [exchangeRates]);

  // Load saved URL from browser storage when app starts
  useEffect(() => {
    const savedUrl = localStorage.getItem('exchangeRateUrl');
    if (savedUrl) {
      setExchangeRateUrl(savedUrl);
      fetchExchangeRates(savedUrl);
    }
  }, []);

  // Function to change active tab
  function handleTabChange(event, newTabValue) {
    setActiveTab(newTabValue);
  }

  // Function to show messages to user
  function showMessage(message, severity = 'info') {
    setSnackbar({
      open: true,
      message: message,
      severity: severity
    });
  }

  // Function to hide message
  function handleSnackbarClose(event, reason) {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  }

  // Function to get exchange rates from a URL
  async function fetchExchangeRates(url) {
    if (!url) return;
    
    try {
      // Get data from the URL using fetch (as required by project)
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Convert the response to JavaScript object
      const rates = await response.json();
      setExchangeRates(rates);
      showMessage('Exchange rates updated!', 'success');
      
    } catch (error) {
      showMessage('Failed to get rates: ' + error.message, 'error');
    }
  }

  // Function to save the exchange rate URL
  function saveSettings(url) {
    // Save to browser storage so we remember it next time
    localStorage.setItem('exchangeRateUrl', url);
    setExchangeRateUrl(url);
    
    // Get new rates if user provided a URL
    if (url) {
      fetchExchangeRates(url);
    }
    
    showMessage('Settings saved!', 'success');
  }

  // Render the main application
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} disableGutters>
        
        {/* Top Navigation Bar */}
        <AppBar position="static" elevation={0}>
          <Container maxWidth="lg">
            <Toolbar>
              <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                💰 Cost Manager
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
              <TabPanel value={activeTab} index={0}>
                <AddCostTab showMessage={showMessage} database={database} />
              </TabPanel>
              
              {/* Reports Tab */}
              <TabPanel value={activeTab} index={1}>
                <ReportsTab showMessage={showMessage} database={database} />
              </TabPanel>
              
              {/* Charts Tab */}
              <TabPanel value={activeTab} index={2}>
                <ChartsTab showMessage={showMessage} database={database} />
              </TabPanel>
              
              {/* Settings Tab */}
              <TabPanel value={activeTab} index={3}>
                <SettingsTab 
                  showMessage={showMessage}
                  exchangeRateUrl={exchangeRateUrl}
                  exchangeRates={exchangeRates}
                  onSaveSettings={saveSettings}
                />
              </TabPanel>
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

export default App;
