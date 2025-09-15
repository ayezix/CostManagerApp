/*
 * SettingsTab.js - Settings Configuration Page
 * 
 * 🎯 What this does (for students):
 * This creates a settings page where users can configure the exchange rate URL.
 * It shows current exchange rates and lets users enter a custom API URL.
 * 
 * 📚 Key Learning Concepts:
 * - Form Input Handling: Managing text input with controlled components
 * - URL Validation: Checking if user entered a valid web address
 * - Conditional Rendering: Showing different content based on conditions
 * - Props Usage: Receiving data and functions from parent component
 */

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
  Chip,
  Alert,
  Divider
} from '@mui/material';
import { Save as SaveIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { Refresh as RefreshIcon, Delete as DeleteIcon } from '@mui/icons-material';

function SETTINGSTAB({ showMessage, exchangeRateUrl, exchangeRates, onSaveSettings, onRefreshDatabase, onClearDatabase }) {
  // 📊 State to remember what URL the user types
  // We start with the current URL (or empty string if none)
  const [url, setUrl] = useState(exchangeRateUrl || '');

  // 💾 Function to save the URL when user clicks Save button
  const handleSave = function() {
    // Step 1: Check if URL is valid (if user entered one)
    if (url && !isValidUrl(url)) {
      showMessage('Please enter a valid URL', 'error');
      return; // Stop here if URL is invalid
    }
    // Step 2: Save the URL using the function from parent component
    onSaveSettings(url);
  };

  // 🔍 Helper function to check if URL is valid
  // This tries to create a URL object - if it fails, the URL is invalid
  const isValidUrl = function(string) {
    try {
      new URL(string); // Try to create URL object
      return true;     // Success = valid URL
    } catch (_) {
      return false;    // Error = invalid URL
    }
  };

  // 🎨 Helper function to show exchange rates nicely (4 decimal places)
  // This makes numbers like 3.456789 display as 3.4568
  const formatRate = function(rate) {
    return typeof rate === 'number' ? rate.toFixed(4) : rate;
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          ⚙️ Application Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure the exchange rate API URL and view current rates.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Exchange Rate API URL"
              placeholder="https://api.example.com/exchange-rates.json"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              helperText='URL should return JSON with format: {"USD":1, "GBP":1.8, "EURO":0.7, "ILS":3.4}'
              type="url"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{ mr: 2 }}
            >
              💾 Save Settings
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => { setUrl(''); onSaveSettings(''); }}
            >
              Clear URL
            </Button>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>Expected JSON Format:</strong>
          </Typography>
          <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', mt: 1 }}>
            {`{"USD": 1, "GBP": 1.8, "EURO": 0.7, "ILS": 3.4}`}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Requirements:</strong> Must include CORS headers (Access-Control-Allow-Origin: *)
          </Typography>
        </Alert>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Exchange Rates
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          These are the exchange rates currently being used for currency conversion.
        </Typography>

        <Grid container spacing={2}>
          {exchangeRates && Object.entries(exchangeRates).map(([currency, rate]) => (
            <Grid item key={currency}>
              <Chip
                label={`${currency}: ${formatRate(rate)}`}
                variant="outlined"
                color="primary"
                sx={{ fontSize: '0.9rem', px: 1 }}
              />
            </Grid>
          ))}
        </Grid>

        {exchangeRateUrl && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Source:</strong> {exchangeRateUrl}
            </Typography>
          </Alert>
        )}

        {!exchangeRateUrl && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Using default rates.</strong> Configure an API URL above to get live exchange rates.
            </Typography>
          </Alert>
        )}
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📋 Application Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Database
                </Typography>
                <Typography variant="body1">
                  IndexedDB (costsdb)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Supported Currencies
                </Typography>
                <Typography variant="body1">
                  USD, ILS, GBP, EURO
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Charts
                </Typography>
                <Typography variant="body1">
                  Chart.js Library
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Storage
                </Typography>
                <Typography variant="body1">
                  Local browser storage
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎓 Project Information
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This is the Cost Manager Final Project for Front-End Development course.
        </Typography>
        
        <Divider sx={{ my: 2 }} />

        <Alert severity="success" variant="outlined">
          <Typography variant="body2">
            <strong>React + MUI Implementation</strong><br />
            Front-End Development Final Project<br />
            Version 2.0 - Full requirements compliance
          </Typography>
        </Alert>

        {/* Technology Stack */}
        <Card variant="outlined" sx={{ mt: 2 }}>
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
      </Paper>

      {/* Database Management Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🗄️ Database Management
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          If you're experiencing issues with old data appearing after clearing the database, 
          use the refresh button to reconnect to the database.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefreshDatabase}
          >
            Refresh Database Connection
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onClearDatabase}
          >
            Clear Database
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default SETTINGSTAB;
