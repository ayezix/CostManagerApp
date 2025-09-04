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

import AddCostTab from './components/AddCostTab';
import ReportsTab from './components/ReportsTab';
import ChartsTab from './components/ChartsTab';
import SettingsTab from './components/SettingsTab';
import * as idb from './services/idb';

const theme = createTheme({
  palette: {
    primary: { 
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: { 
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#1565c0'
    },
    h6: {
      fontWeight: 500
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: 12
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
          minHeight: 64
        }
      }
    }
  }
});

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
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

  useEffect(() => {
    window.app = { exchangeRates };
  }, [exchangeRates]);

  useEffect(() => {
    const initDB = async () => {
      try {
        const db = await idb.openCostsDB('costsdb', 1);
        idb.setDatabase(db);
        setDatabase(db);
      } catch (error) {
        showMessage('Database error: ' + error.message, 'error');
      }
    };
    initDB();
  }, []);

  useEffect(() => {
    const savedUrl = localStorage.getItem('exchangeRateUrl');
    if (savedUrl) {
      setExchangeRateUrl(savedUrl);
      fetchExchangeRates(savedUrl);
    }
  }, []);

  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const showMessage = (message, severity = 'info') => setSnackbar({ open: true, message, severity });
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchExchangeRates = async (url) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const rates = await response.json();
      setExchangeRates(rates);
      showMessage('Exchange rates updated!', 'success');
    } catch (error) {
      showMessage('Failed to fetch rates: ' + error.message, 'error');
    }
  };

  const saveSettings = (url) => {
    if (url) {
      localStorage.setItem('exchangeRateUrl', url);
      setExchangeRateUrl(url);
      showMessage('Settings saved!', 'success');
      fetchExchangeRates(url);
    } else {
      showMessage('Invalid URL', 'error');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
          <Container maxWidth="lg">
            <Toolbar sx={{ py: 1 }}>
              <WalletIcon sx={{ mr: 2, fontSize: 32 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                  Cost Manager
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, color: 'white' }}>
                  Track expenses with React & Material-UI
                </Typography>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ 
            bgcolor: 'background.paper', 
            borderRadius: 2, 
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Tabs 
              value={tabValue} 
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

            <Box sx={{ p: 3, minHeight: 400 }}>
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
            </Box>
          </Box>
        </Container>

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
      </Box>
    </ThemeProvider>
  );
}

export default App;