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
  CardHeader,
  Alert
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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

function ChartsTab({ showMessage, idb }) {
  // Pie chart state
  const [pieYear, setPieYear] = useState(new Date().getFullYear());
  const [pieMonth, setPieMonth] = useState(new Date().getMonth() + 1);
  const [pieCurrency, setPieCurrency] = useState('USD');
  const [pieData, setPieData] = useState(null);
  const [pieLoading, setPieLoading] = useState(false);

  // Bar chart state
  const [barYear, setBarYear] = useState(new Date().getFullYear());
  const [barCurrency, setBarCurrency] = useState('USD');
  const [barData, setBarData] = useState(null);
  const [barLoading, setBarLoading] = useState(false);

  // Generate years
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push(i);
  }

  const getMonthName = (monthNum) => {
    return months.find(m => m.value === monthNum)?.name || '';
  };

  // Pie chart colors
  const pieColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
  ];

  const generatePieChart = async () => {
    if (!pieYear || !pieMonth || !pieCurrency) {
      showMessage('Please select year, month, and currency for pie chart', 'error');
      return;
    }

    setPieLoading(true);
    try {
      const report = await idb.getReport(pieYear, pieMonth, pieCurrency);
      
      if (report.costs.length === 0) {
        showMessage('No data available for the selected month and year', 'info');
        setPieData(null);
        return;
      }

      // Group costs by category
      const categoryTotals = {};
      report.costs.forEach(cost => {
        if (categoryTotals[cost.category]) {
          categoryTotals[cost.category] += cost.sum;
        } else {
          categoryTotals[cost.category] = cost.sum;
        }
      });

      const labels = Object.keys(categoryTotals);
      const data = Object.values(categoryTotals);

      const chartData = {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: pieColors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#ffffff',
        }]
      };

      setPieData(chartData);
      showMessage('Pie chart generated successfully!', 'success');
    } catch (error) {
      console.error('Failed to generate pie chart:', error);
      showMessage('Failed to generate pie chart: ' + error.message, 'error');
    } finally {
      setPieLoading(false);
    }
  };

  const generateBarChart = async () => {
    if (!barYear || !barCurrency) {
      showMessage('Please select year and currency for bar chart', 'error');
      return;
    }

    setBarLoading(true);
    try {
      const monthlyTotals = new Array(12).fill(0);
      
      const allCosts = await idb.getAllCosts();
      const yearCosts = allCosts.filter(cost => cost.year === barYear);
      
      yearCosts.forEach(cost => {
        // Convert to target currency
        const convertedAmount = idb.convertCurrency 
          ? idb.convertCurrency(cost.sum, cost.currency, barCurrency)
          : cost.sum;
        monthlyTotals[cost.month - 1] += convertedAmount;
      });

      const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: `Monthly Costs (${barCurrency})`,
          data: monthlyTotals,
          backgroundColor: '#64b5f6',
          borderColor: '#42a5f5',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        }]
      };

      setBarData(chartData);
      showMessage('Bar chart generated successfully!', 'success');
    } catch (error) {
      console.error('Failed to generate bar chart:', error);
      showMessage('Failed to generate bar chart: ' + error.message, 'error');
    } finally {
      setBarLoading(false);
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Costs by Category - ${getMonthName(pieMonth)} ${pieYear} (${pieCurrency})`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toFixed(2)} ${pieCurrency} (${percentage}%)`;
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
        text: `Monthly Costs for ${barYear} (${barCurrency})`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y.toFixed(2)} ${barCurrency}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: `Amount (${barCurrency})`,
          font: {
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <TrendingIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" component="h2" gutterBottom>
          Charts & Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualize your spending patterns with interactive charts
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Pie Chart Section */}
        <Grid item xs={12} lg={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PieChartIcon sx={{ mr: 1 }} />
                  Pie Chart - Monthly Categories
                </Box>
              }
              sx={{ bgcolor: 'primary.main', color: 'white' }}
            />
            <CardContent>
              {/* Pie Chart Controls */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={pieYear}
                      label="Year"
                      onChange={(e) => setPieYear(e.target.value)}
                    >
                      {years.map((y) => (
                        <MenuItem key={y} value={y}>
                          {y}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={pieMonth}
                      label="Month"
                      onChange={(e) => setPieMonth(e.target.value)}
                    >
                      {months.map((m) => (
                        <MenuItem key={m.value} value={m.value}>
                          {m.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={pieCurrency}
                      label="Currency"
                      onChange={(e) => setPieCurrency(e.target.value)}
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
                    onClick={generatePieChart}
                    disabled={pieLoading}
                    startIcon={<PieChartIcon />}
                    fullWidth
                  >
                    {pieLoading ? 'Generating...' : 'Generate Pie Chart'}
                  </Button>
                </Grid>
              </Grid>

              {/* Pie Chart Display */}
              <Box sx={{ height: 400, position: 'relative' }}>
                {pieData ? (
                  <Pie data={pieData} options={pieOptions} />
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Click "Generate Pie Chart" to view category breakdown
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart Section */}
        <Grid item xs={12} lg={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ mr: 1 }} />
                  Bar Chart - Monthly Totals
                </Box>
              }
              sx={{ bgcolor: 'primary.main', color: 'white' }}
            />
            <CardContent>
              {/* Bar Chart Controls */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={barYear}
                      label="Year"
                      onChange={(e) => setBarYear(e.target.value)}
                    >
                      {years.map((y) => (
                        <MenuItem key={y} value={y}>
                          {y}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={barCurrency}
                      label="Currency"
                      onChange={(e) => setBarCurrency(e.target.value)}
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
                    onClick={generateBarChart}
                    disabled={barLoading}
                    startIcon={<BarChartIcon />}
                    fullWidth
                  >
                    {barLoading ? 'Generating...' : 'Generate Bar Chart'}
                  </Button>
                </Grid>
              </Grid>

              {/* Bar Chart Display */}
              <Box sx={{ height: 400, position: 'relative' }}>
                {barData ? (
                  <Bar data={barData} options={barOptions} />
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Click "Generate Bar Chart" to view monthly trends
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ChartsTab;