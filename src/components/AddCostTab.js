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
  InputAdornment,
  FormHelperText
} from '@mui/material';
import {
  AddCard as AddIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const categories = [
  { value: 'Food', label: '🍕 Food & Dining', icon: '🍕' },
  { value: 'Transportation', label: '🚗 Transportation', icon: '🚗' },
  { value: 'Entertainment', label: '🎬 Entertainment', icon: '🎬' },
  { value: 'Education', label: '📚 Education', icon: '📚' },
  { value: 'Healthcare', label: '🏥 Healthcare', icon: '🏥' },
  { value: 'Shopping', label: '🛍️ Shopping', icon: '🛍️' },
  { value: 'Utilities', label: '⚡ Utilities', icon: '⚡' },
  { value: 'Other', label: '📝 Other', icon: '📝' }
];

const currencies = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'ILS', label: 'ILS - Israeli Shekel' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'EURO', label: 'EURO - European Euro' }
];

function AddCostTab({ showMessage, idb }) {
  const [formData, setFormData] = useState({
    sum: '',
    currency: 'USD',
    category: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sum || parseFloat(formData.sum) <= 0) {
      newErrors.sum = 'Please enter a valid amount greater than 0';
    }

    if (!formData.currency) {
      newErrors.currency = 'Please select a currency';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    } else if (formData.description.length > 100) {
      newErrors.description = 'Description must be 100 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      showMessage('Please fix the errors in the form', 'error');
      return;
    }

    setLoading(true);

    try {
      const costData = {
        sum: parseFloat(formData.sum),
        currency: formData.currency,
        category: formData.category,
        description: formData.description.trim()
      };

      const result = await idb.addCost(costData);
      showMessage('Cost item added successfully!', 'success');
      
      // Reset form
      setFormData({
        sum: '',
        currency: 'USD',
        category: '',
        description: ''
      });
      
      console.log('Added cost item:', result);
    } catch (error) {
      console.error('Failed to add cost item:', error);
      showMessage('Failed to add cost item: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <AddIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" component="h2" gutterBottom>
          Add New Cost Item
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your expenses with detailed information and automatic date recording
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Amount Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount *"
              type="number"
              value={formData.sum}
              onChange={handleChange('sum')}
              error={!!errors.sum}
              helperText={errors.sum || 'Enter the cost amount with up to 2 decimal places'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon />
                  </InputAdornment>
                ),
                inputProps: {
                  min: 0,
                  step: 0.01,
                  max: 999999.99
                }
              }}
              placeholder="25.50"
              required
            />
          </Grid>

          {/* Currency Field */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.currency}>
              <InputLabel>Currency *</InputLabel>
              <Select
                value={formData.currency}
                label="Currency *"
                onChange={handleChange('currency')}
                required
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.currency || 'Select the currency for this expense'}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* Category Field */}
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Category *</InputLabel>
              <Select
                value={formData.category}
                label="Category *"
                onChange={handleChange('category')}
                required
              >
                <MenuItem value="">
                  <em>Select Category</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.category || 'Choose the expense category'}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* Description Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description *"
              value={formData.description}
              onChange={handleChange('description')}
              error={!!errors.description}
              helperText={errors.description || `Brief description of the expense (${formData.description.length}/100 characters)`}
              placeholder="Enter expense description (e.g., 'Lunch at restaurant')"
              inputProps={{
                maxLength: 100
              }}
              multiline
              rows={2}
              required
            />
          </Grid>

          {/* Submit Button */}
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
                fontWeight: 600
              }}
            >
              {loading ? 'Adding Cost Item...' : 'Add Cost Item'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

export default AddCostTab;