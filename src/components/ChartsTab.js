// ChartsTab.js - Charts page with pie and bar charts

import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Grid
} from '@mui/material';
import { BarChart as BarChartIcon, PieChart as PieChartIcon } from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { CURRENCIES, MONTHS, getYearOptions } from '../services/currencyService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);


function ChartsTab({ showMessage, database }) {
  // Pie chart settings
  const [pieFilters, setPieFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    currency: 'USD'
  });
  
  // Bar chart settings
  const [barFilters, setBarFilters] = useState({
    year: new Date().getFullYear(),
    currency: 'USD'
  });
  
  // Chart data
  const [pieData, setPieData] = useState(null);
  const [barData, setBarData] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState({ pie: false, bar: false });

  // Function to update pie chart filters when user changes dropdowns
  const handlePieChange = (field) => (event) => {
    setPieFilters({ ...pieFilters, [field]: event.target.value });
  };

  // Function to update bar chart filters when user changes dropdowns
  const handleBarChange = (field) => (event) => {
    setBarFilters({ ...barFilters, [field]: event.target.value });
  };

  const generatePieChart = async () => {
    if (!database) {
      showMessage('Database not initialized', 'error');
      return;
    }

    setLoading({ ...loading, pie: true });
    
    try {
      // Get report data for the selected month
      const report = await database.getReport(pieFilters.year, pieFilters.month, pieFilters.currency);
      
      if (report.costs.length === 0) {
        showMessage(`No data available for ${MONTHS.find(m => m.value === pieFilters.month)?.label} ${pieFilters.year}`, 'info');
        setPieData(null);
        return;
      }

      // Group by category
      const categoryTotals = {};
      report.costs.forEach(cost => {
        if (!categoryTotals[cost.category]) {
          categoryTotals[cost.category] = 0;
        }
        categoryTotals[cost.category] += cost.sum;
      });

      const labels = Object.keys(categoryTotals);
      const data = Object.values(categoryTotals);
      
      // Generate colors
      const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
      ];

      setPieData({
        labels,
        datasets: [{
          label: `Expenses (${pieFilters.currency})`,
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(color => color.replace('0.6', '1')),
          borderWidth: 2
        }]
      });

      showMessage(`Pie chart generated: ${labels.length} categories, total: ${report.total.total.toFixed(2)} ${pieFilters.currency}`, 'success');
      
    } catch (error) {
      console.error('Failed to generate pie chart:', error);
      showMessage('Failed to generate pie chart: ' + error.message, 'error');
    } finally {
      setLoading({ ...loading, pie: false });
    }
  };

  const generateBarChart = async () => {
    if (!database) {
      showMessage('Database not initialized', 'error');
      return;
    }

    setLoading({ ...loading, bar: true });
    
    try {
      // Get all costs for the year and group by month
      const monthlyTotals = {};
      MONTHS.forEach(month => {
        monthlyTotals[month.label] = 0;
      });

      // Get data for each month
      for (let monthNum = 1; monthNum <= 12; monthNum++) {
        try {
          const report = await database.getReport(barFilters.year, monthNum, barFilters.currency);
          const monthLabel = MONTHS.find(m => m.value === monthNum)?.label;
          if (monthLabel) {
            monthlyTotals[monthLabel] = report.total.total;
          }
        } catch (error) {
          console.warn(`Failed to get data for month ${monthNum}:`, error);
        }
      }

      const labels = MONTHS.map(m => m.label);
      const data = labels.map(label => monthlyTotals[label]);

      setBarData({
        labels,
        datasets: [{
          label: `Monthly Expenses (${barFilters.currency})`,
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false
        }]
      });

      const totalYear = data.reduce((sum, val) => sum + val, 0);
      showMessage(`Bar chart generated for ${barFilters.year}: ${totalYear.toFixed(2)} ${barFilters.currency} total`, 'success');
      
    } catch (error) {
      console.error('Failed to generate bar chart:', error);
      showMessage('Failed to generate bar chart: ' + error.message, 'error');
    } finally {
      setLoading({ ...loading, bar: false });
    }
  };


  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Expenses by Category - ${MONTHS.find(m => m.value === pieFilters.month)?.label} ${pieFilters.year}`,
        font: { size: 16, weight: 'bold' }
      },
      legend: {
        position: 'bottom',
        labels: { padding: 15, usePointStyle: true }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${pieFilters.currency} ${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Monthly Expenses - ${barFilters.year}`,
        font: { size: 16, weight: 'bold' }
      },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${barFilters.currency} ${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: `Amount (${barFilters.currency})`
        },
        ticks: {
          callback: function(value) {
            return `${barFilters.currency} ${value.toFixed(0)}`;
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    }
  };

  return (
    <Box>
      {/* Pie Chart Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Pie Chart - Monthly Categories
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Shows the distribution of expenses by category for a selected month and year.
        </Typography>

        <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Year"
              value={pieFilters.year}
              onChange={handlePieChange('year')}
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
              value={pieFilters.month}
              onChange={handlePieChange('month')}
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
              value={pieFilters.currency}
              onChange={handlePieChange('currency')}
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
              startIcon={<PieChartIcon />}
              onClick={generatePieChart}
              disabled={loading.pie}
            >
              {loading.pie ? 'Generating...' : 'Generate Pie Chart'}
            </Button>
          </Grid>
        </Grid>

        {pieData && (
          <Box sx={{ height: 400 }}>
            <Pie data={pieData} options={pieOptions} />
          </Box>
        )}
      </Paper>

      {/* Bar Chart Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Bar Chart - Monthly Totals
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Shows the total expenses for each month in a selected year.
        </Typography>

        <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Year"
              value={barFilters.year}
              onChange={handleBarChange('year')}
            >
              {getYearOptions().map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Currency"
              value={barFilters.currency}
              onChange={handleBarChange('currency')}
            >
              {CURRENCIES.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<BarChartIcon />}
              onClick={generateBarChart}
              disabled={loading.bar}
            >
              {loading.bar ? 'Generating...' : 'Generate Bar Chart'}
            </Button>
          </Grid>
        </Grid>

        {barData && (
          <Box sx={{ height: 400 }}>
            <Bar data={barData} options={barOptions} />
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default ChartsTab;
