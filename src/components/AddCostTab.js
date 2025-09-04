import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Grid,
  InputAdornment
} from '@mui/material';
import { AddCard as AddIcon, AttachMoney as MoneyIcon } from '@mui/icons-material';

const categories = [
  { value: 'Food', label: '🍕 Food & Dining' },
  { value: 'Transportation', label: '🚗 Transportation' },
  { value: 'Entertainment', label: '🎬 Entertainment' },
  { value: 'Education', label: '📚 Education' },
  { value: 'Healthcare', label: '🏥 Healthcare' },
  { value: 'Shopping', label: '🛍️ Shopping' },
  { value: 'Utilities', label: '⚡ Utilities' },
  { value: 'Other', label: '📝 Other' }
];

const currencies = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'ILS', label: 'ILS - Israeli Shekel' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'EURO', label: 'EURO - European Euro' }
];

function AddCostTab({ showMessage, idb }) {
  const [formData, setFormData] = useState({
    sum: '', currency: 'USD', category: '', description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sum || parseFloat(formData.sum) <= 0) newErrors.sum = 'Enter valid amount';
    if (!formData.currency) newErrors.currency = 'Select currency';
    if (!formData.category) newErrors.category = 'Select category';
    if (!formData.description.trim()) newErrors.description = 'Enter description';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await idb.addCost({
        sum: parseFloat(formData.sum),
        currency: formData.currency,
        category: formData.category,
        description: formData.description.trim()
      });
      showMessage('Cost added successfully!', 'success');
      setFormData({ sum: '', currency: 'USD', category: '', description: '' });
    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ 
          width: 80, 
          height: 80, 
          borderRadius: '50%', 
          bgcolor: 'primary.light', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mx: 'auto',
          mb: 2
        }}>
          <AddIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography variant="h4" gutterBottom>
          Add New Expense
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your spending with detailed information
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 4, bgcolor: 'grey.50', borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount *"
                type="number"
                value={formData.sum}
                onChange={handleChange('sum')}
                error={!!errors.sum}
                helperText={errors.sum || 'Enter the cost amount'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon color="primary" />
                    </InputAdornment>
                  ),
                  inputProps: { min: 0, step: 0.01 }
                }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.currency}>
                <InputLabel>Currency *</InputLabel>
                <Select 
                  value={formData.currency} 
                  label="Currency *" 
                  onChange={handleChange('currency')}
                  sx={{ bgcolor: 'white' }}
                >
                  {currencies.map(c => (
                    <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel>Category *</InputLabel>
                <Select 
                  value={formData.category} 
                  label="Category *" 
                  onChange={handleChange('category')}
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="">
                    <em>Select Category</em>
                  </MenuItem>
                  {categories.map(c => (
                    <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description *"
                value={formData.description}
                onChange={handleChange('description')}
                error={!!errors.description}
                helperText={errors.description || `${formData.description.length}/100 characters`}
                multiline
                rows={3}
                inputProps={{ maxLength: 100 }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={<AddIcon />}
                sx={{ 
                  py: 1.5,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                  }
                }}
              >
                {loading ? 'Adding Expense...' : 'Add Expense'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

export default AddCostTab;