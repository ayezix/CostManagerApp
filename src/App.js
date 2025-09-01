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

// Import components
import AddCostTab from './components/AddCostTab';
import ReportsTab from './components/ReportsTab';
import ChartsTab from './components/ChartsTab';
import SettingsTab from './components/SettingsTab';

// Import IDB service functions
import * as idb from './services/idb';

// Create MUI theme with light blue color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#64b5f6', // Light blue
      dark: '#42a5f5',
    },
    secondary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
        },
      },
    },
  },
});

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cost-manager-tabpanel-${index}`}
      aria-labelledby={`cost-manager-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [database, setDatabase] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, GBP: 1.8, EURO: 0.7, ILS: 3.4 });
  const [exchangeRateUrl, setExchangeRateUrl] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Make app globally available for idb.js currency conversion
  useEffect(() => {
    window.app = { exchangeRates };
  }, [exchangeRates]);

  // Initialize database on component mount
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const db = await idb.openCostsDB('costsdb', 1);
        idb.setDatabase(db);
        setDatabase(db);
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
        showMessage('Failed to initialize database: ' + error.message, 'error');
      }
    };

    initializeDatabase();
  }, []);

  // Load settings on component mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('exchangeRateUrl');
    if (savedUrl) {
      setExchangeRateUrl(savedUrl);
      fetchExchangeRates(savedUrl);
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const showMessage = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchExchangeRates = async (url) => {
    if (!url) return;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rates = await response.json();
      setExchangeRates(rates);
      console.log('Exchange rates updated:', rates);
      showMessage('Exchange rates updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      showMessage('Failed to fetch exchange rates: ' + error.message, 'error');
    }
  };

  const saveSettings = (url) => {
    if (url) {
      localStorage.setItem('exchangeRateUrl', url);
      setExchangeRateUrl(url);
      showMessage('Settings saved successfully!', 'success');
      fetchExchangeRates(url);
    } else {
      showMessage('Please enter a valid URL', 'error');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* App Bar */}
        <AppBar position="static" sx={{ mb: 3, borderRadius: 2 }}>
          <Toolbar>
            <WalletIcon sx={{ mr: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div">
                Cost Manager
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Front-End Development Final Project - React & MUI Implementation
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="cost manager tabs"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
              },
            }}
          >
            <Tab
              icon={<WalletIcon />}
              label="Add Cost"
              id="cost-manager-tab-0"
              aria-controls="cost-manager-tabpanel-0"
            />
            <Tab
              icon={<ReportIcon />}
              label="Reports"
              id="cost-manager-tab-1"
              aria-controls="cost-manager-tabpanel-1"
            />
            <Tab
              icon={<ChartIcon />}
              label="Charts"
              id="cost-manager-tab-2"
              aria-controls="cost-manager-tabpanel-2"
            />
            <Tab
              icon={<SettingsIcon />}
              label="Settings"
              id="cost-manager-tab-3"
              aria-controls="cost-manager-tabpanel-3"
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <AddCostTab showMessage={showMessage} idb={idb} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ReportsTab showMessage={showMessage} idb={idb} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <ChartsTab showMessage={showMessage} idb={idb} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <SettingsTab
            showMessage={showMessage}
            exchangeRateUrl={exchangeRateUrl}
            exchangeRates={exchangeRates}
            onSaveSettings={saveSettings}
          />
        </TabPanel>

        {/* Snackbar for messages */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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