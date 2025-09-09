// App.js - This is the MAIN file that controls the entire app
// Think of this as the "control center" that:
// 1. Creates the tab navigation (Add Cost, Reports, Charts, Settings)
// 2. Connects to the database when the app starts
// 3. Shows messages to the user (success, error, etc.)
// 4. Manages the overall app theme and appearance

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
import AddCostTab from './components/AddCostTab';
import ReportsTab from './components/ReportsTab';
import ChartsTab from './components/ChartsTab';
import SettingsTab from './components/SettingsTab';

// Import currency service
import { 
  fetchExchangeRates, 
  setExchangeUrl, 
  getExchangeUrl,
  getExchangeRates,
  setExchangeRates
} from './services/currencyService';

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

  // Load saved URL from browser storage when app starts
  useEffect(() => {
    const savedUrl = localStorage.getItem('exchangeRateUrl');
    if (savedUrl) {
      setExchangeUrl(savedUrl);
      fetchExchangeRates();
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

  // Function to save the exchange rate URL
  async function saveSettings(url) {
    // Save to browser storage so we remember it next time
    localStorage.setItem('exchangeRateUrl', url);
    setExchangeUrl(url);
    
    // Get new rates if user provided a URL
    if (url) {
      try {
        await fetchExchangeRates();
        showMessage('Settings saved! Exchange rates updated!', 'success');
      } catch (error) {
        showMessage('Settings saved! But failed to get rates: ' + error.message, 'warning');
      }
    } else {
      showMessage('Settings saved!', 'success');
    }
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
                  exchangeRateUrl={getExchangeUrl()}
                  exchangeRates={getExchangeRates()}
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
