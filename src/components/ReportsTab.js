import React, { useState } from 'react';
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  Assessment as ReportIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as CurrencyIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

const months = [
  { value: 1, name: 'January' },
  { value: 2, name: 'February' },
  { value: 3, name: 'March' },
  { value: 4, name: 'April' },
  { value: 5, name: 'May' },
  { value: 6, name: 'June' },
  { value: 7, name: 'July' },
  { value: 8, name: 'August' },
  { value: 9, name: 'September' },
  { value: 10, name: 'October' },
  { value: 11, name: 'November' },
  { value: 12, name: 'December' }
];

const currencies = ['USD', 'ILS', 'GBP', 'EURO'];

function ReportsTab({ showMessage, idb }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [currency, setCurrency] = useState('USD');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate years (current year - 5 to current year + 5)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push(i);
  }

  const handleGenerateReport = async () => {
    if (!year || !month || !currency) {
      showMessage('Please select year, month, and currency', 'error');
      return;
    }

    setLoading(true);
    try {
      const reportData = await idb.getReport(year, month, currency);
      setReport(reportData);
      
      if (reportData.costs.length === 0) {
        showMessage('No costs found for the selected month and year', 'info');
      } else {
        showMessage('Report generated successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      showMessage('Failed to generate report: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNum) => {
    return months.find(m => m.value === monthNum)?.name || '';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food': '#ff9800',
      'Transportation': '#2196f3',
      'Entertainment': '#e91e63',
      'Education': '#4caf50',
      'Healthcare': '#f44336',
      'Shopping': '#9c27b0',
      'Utilities': '#607d8b',
      'Other': '#795548'
    };
    return colors[category] || '#9e9e9e';
  };

  return (
    <Box>
      {/* Controls */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <ReportIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" component="h2" gutterBottom>
            Monthly Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate detailed expense reports for specific months and years
          </Typography>
        </Box>

        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={year}
                label="Year"
                onChange={(e) => setYear(e.target.value)}
                startAdornment={<CalendarIcon sx={{ mr: 1, color: 'action.active' }} />}
              >
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={month}
                label="Month"
                onChange={(e) => setMonth(e.target.value)}
                startAdornment={<CalendarIcon sx={{ mr: 1, color: 'action.active' }} />}
              >
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={currency}
                label="Currency"
                onChange={(e) => setCurrency(e.target.value)}
                startAdornment={<CurrencyIcon sx={{ mr: 1, color: 'action.active' }} />}
              >
                {currencies.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerateReport}
              disabled={loading}
              startIcon={<ReportIcon />}
              fullWidth
              sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
            >
              {loading ? 'Generating Report...' : 'Generate Report'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Report Results */}
      {report && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ReceiptIcon sx={{ mr: 1 }} />
            Report for {getMonthName(report.month)} {report.year}
          </Typography>

          {report.costs.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No costs found for the selected month and year.
            </Alert>
          ) : (
            <>
              {/* Cost Items */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {report.costs.map((cost, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        borderLeft: 3,
                        borderLeftColor: getCategoryColor(cost.category),
                        '&:hover': {
                          boxShadow: 2,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                            {cost.sum.toFixed(2)} {cost.currency}
                          </Typography>
                          <Chip
                            label={cost.category}
                            size="small"
                            sx={{
                              backgroundColor: getCategoryColor(cost.category),
                              color: 'white',
                              fontWeight: 500
                            }}
                          />
                        </Box>
                        <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                          {cost.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Day: {cost.Date.day}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Total */}
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <CardContent sx={{ py: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
                    {report.total.total.toFixed(2)} {report.total.currency}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                    Total expenses for {getMonthName(report.month)} {report.year}
                  </Typography>
                </CardContent>
              </Card>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
}

export default ReportsTab;