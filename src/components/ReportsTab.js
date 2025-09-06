// ReportsTab.js - Simple Student Version
// This creates the monthly reports page where users can see their expenses

import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import { Assessment as ReportIcon } from '@mui/icons-material';

// The 4 currencies we support
const CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];

// All 12 months with their numbers (1-12)
const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

function ReportsTab({ showMessage, database }) {
  // What the user wants to see (which month, year, currency)
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),        // Current year
    month: new Date().getMonth() + 1,      // Current month
    currency: 'USD'                        // Default to US Dollars
  });
  
  // The report data we get from the database
  const [report, setReport] = useState(null);
  
  // Whether we're currently loading data
  const [loading, setLoading] = useState(false);

  // Function to update filters when user changes dropdowns
  const handleChange = (field) => (event) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

  // Function to get the report from the database
  const generateReport = async () => {
    // Check if database is ready
    if (!database) {
      showMessage('Database not ready yet', 'error');
      return;
    }

    setLoading(true);
    
    try {
      // Get expenses from database for the chosen month/year/currency
      const reportData = await database.getReport(filters.year, filters.month, filters.currency);
      setReport(reportData);
      
      // Tell user what we found
      if (reportData.costs.length === 0) {
        showMessage(`No expenses found for ${MONTHS.find(m => m.value === filters.month)?.label} ${filters.year}`, 'info');
      } else {
        showMessage(`Found ${reportData.costs.length} expenses, total: ${reportData.total.total.toFixed(2)} ${reportData.total.currency}`, 'success');
      }
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      showMessage('Failed to generate report: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to show money nicely (like "USD 25.50")
  const formatCurrency = (amount, currency) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  // Get a list of years for the dropdown (current year and 5 years back)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year);
    }
    return years;
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Monthly Report
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Generate a detailed report for a specific month and year in your preferred currency.
        </Typography>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Year"
              value={filters.year}
              onChange={handleChange('year')}
            >
              {getYearOptions().map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Month"
              value={filters.month}
              onChange={handleChange('month')}
            >
              {MONTHS.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Currency"
              value={filters.currency}
              onChange={handleChange('currency')}
            >
              {CURRENCIES.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ReportIcon />}
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {report && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Report for {MONTHS.find(m => m.value === report.month)?.label} {report.year}
          </Typography>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Expenses
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(report.total.total, report.total.currency)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Number of Items
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {report.costs.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Categories
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {new Set(report.costs.map(cost => cost.category)).size}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Table */}
          {report.costs.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Day</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell align="right"><strong>Amount ({filters.currency})</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.costs.map((cost, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{cost.Date.day}</TableCell>
                      <TableCell>{cost.description}</TableCell>
                      <TableCell>
                        <Chip label={cost.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(cost.sum, cost.currency)}</strong>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No expenses found for this period
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try selecting a different month or year, or add some expenses first.
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}

export default ReportsTab;
