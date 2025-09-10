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
  fetch_exchange_rates, 
  set_exchange_url, 
  get_exchange_url,
  get_exchange_rates,
  set_exchange_rates
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
  const [active_tab, set_active_tab] = useState(0);
  
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
    const initialize_database = async function() {
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
        show_message('Database error: ' + error.message, 'error');
      }
    }
    
    initialize_database();
  }, []); // This runs once when the app starts

  // Load saved URL from browser storage when app starts
  useEffect(() => {
    const savedUrl = localStorage.getItem('exchangeRateUrl');
    if (savedUrl) {
      set_exchange_url(savedUrl);
      fetch_exchange_rates();
    }
  }, []);

  // Function to change active tab
  const handle_tab_change = function(event, new_tab_value) {
    set_active_tab(new_tab_value);
  };

  // Function to show messages to user
  const show_message = function(message, severity = 'info') {
    setSnackbar({
      open: true,
      message: message,
      severity: severity
    });
  };

  // Function to hide message
  const handle_snackbar_close = function(event, reason) {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Function to save the exchange rate URL
  const save_settings = async function(url) {
    // Save to browser storage so we remember it next time
    localStorage.setItem('exchangeRateUrl', url);
    set_exchange_url(url);
    
    // Get new rates if user provided a URL
    if (url) {
      try {
        await fetch_exchange_rates();
        show_message('Settings saved! Exchange rates updated!', 'success');
      } catch (error) {
        show_message('Settings saved! But failed to get rates: ' + error.message, 'warning');
      }
    } else {
      show_message('Settings saved!', 'success');
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
              value={active_tab} 
              onChange={handle_tab_change} 
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
              <TabPanel value={active_tab} index={0}>
                <AddCostTab show_message={show_message} database={database} />
              </TabPanel>
              
              {/* Reports Tab */}
              <TabPanel value={active_tab} index={1}>
                <ReportsTab show_message={show_message} database={database} />
              </TabPanel>
              
              {/* Charts Tab */}
              <TabPanel value={active_tab} index={2}>
                <ChartsTab show_message={show_message} database={database} />
              </TabPanel>
              
              {/* Settings Tab */}
              <TabPanel value={active_tab} index={3}>
                <SettingsTab 
                  show_message={show_message}
                  exchange_rate_url={get_exchange_url()}
                  exchange_rates={get_exchange_rates()}
                  on_save_settings={save_settings}
                />
              </TabPanel>
            </Box>
          </Box>
        </Container>

        {/* Message Display (Snackbar) */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handle_snackbar_close}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handle_snackbar_close} 
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
