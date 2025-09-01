import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Language as ApiIcon,
  Storage as DatabaseIcon,
  Assessment as ChartsIcon,
  Security as SecurityIcon,
  Info as InfoIcon
} from '@mui/icons-material';

function SettingsTab({ showMessage, exchangeRateUrl, exchangeRates, onSaveSettings }) {
  const [url, setUrl] = useState(exchangeRateUrl || '');

  const handleSaveSettings = () => {
    if (url.trim()) {
      try {
        new URL(url.trim()); // Validate URL
        onSaveSettings(url.trim());
      } catch (error) {
        showMessage('Please enter a valid URL', 'error');
      }
    } else {
      showMessage('Please enter a valid URL', 'error');
    }
  };

  const formatRates = (rates) => {
    return Object.entries(rates)
      .map(([currency, rate]) => `${currency}: ${rate.toFixed(2)}`)
      .join(', ');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <SettingsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" component="h2" gutterBottom>
          Application Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure exchange rate API and view application information
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Exchange Rate API Settings */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ApiIcon sx={{ mr: 1 }} />
              Exchange Rate API Configuration
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Exchange Rate API URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/exchange-rates.json"
                  helperText="Enter the URL for getting currency exchange rates"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  size="large"
                  sx={{ mr: 2 }}
                >
                  Save Settings
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Expected JSON Format:</strong>
              </Typography>
              <Box sx={{ 
                fontFamily: 'monospace', 
                bgcolor: 'grey.100', 
                p: 1, 
                borderRadius: 1,
                fontSize: '0.875rem'
              }}>
                {"{"}"USD":1, "GBP":1.8, "EURO":0.7, "ILS":3.4{"}"}
              </Box>
            </Alert>

            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Requirements:</strong> The API must include CORS headers (Access-Control-Allow-Origin: *)
              </Typography>
            </Alert>
          </Paper>

          {/* Current Exchange Rates */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ApiIcon sx={{ mr: 1 }} />
              Current Exchange Rates
            </Typography>
            
            <Box sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '1rem'
            }}>
              {formatRates(exchangeRates)}
              {!exchangeRateUrl && (
                <Chip 
                  label="Default rates" 
                  size="small" 
                  color="info" 
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Application Information */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ mr: 1 }} />
                Application Information
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <DatabaseIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Database"
                    secondary="IndexedDB (costsdb v1)"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <ApiIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Supported Currencies"
                    secondary="USD, ILS, GBP, EURO"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <ChartsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Charts"
                    secondary="Chart.js with React integration"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Storage"
                    secondary="Local browser storage"
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Alert severity="success" variant="outlined">
                <Typography variant="body2">
                  <strong>React & MUI Implementation</strong><br />
                  Front-End Development Final Project<br />
                  Version 2.0 - Full requirements compliance
                </Typography>
              </Alert>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          <Card elevation={3} sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Technology Stack
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="React 18" color="primary" variant="outlined" />
                <Chip label="Material-UI v5" color="primary" variant="outlined" />
                <Chip label="Chart.js" color="secondary" variant="outlined" />
                <Chip label="IndexedDB" color="secondary" variant="outlined" />
                <Chip label="JavaScript ES6+" color="info" variant="outlined" />
                <Chip label="Responsive Design" color="success" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SettingsTab;
