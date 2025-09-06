// AddCostTab.js - Simple Student Version
// This creates the form where users can add new expenses

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
import { Add as AddIcon } from '@mui/icons-material';

// The 4 currencies we support (as required by the project)
const CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];

// Different types of expenses
const CATEGORIES = [
  'Food', 
  'Transportation', 
  'Entertainment', 
  'Education', 
  'Healthcare', 
  'Shopping', 
  'Utilities', 
  'Other'
];

function AddCostTab({ showMessage, database }) {
  // Variables to store what the user types in the form
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent page refresh
    
    // Check if database is available
    if (!database) {
      showMessage('Database not ready', 'error');
      return;
    }

    // Validate that all fields are filled
    if (!amount || !category || !description.trim()) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    // Validate that amount is a positive number
    const amountNumber = parseFloat(amount);
    if (amountNumber <= 0) {
      showMessage('Amount must be greater than 0', 'error');
      return;
    }

    // Show loading state
    setIsLoading(true);
    
    try {
      // Create cost object as specified in requirements
      const newCost = {
        sum: amountNumber,           // Convert string to number
        currency: currency,          // Selected currency
        category: category,          // Selected category  
        description: description.trim() // Remove extra spaces
      };

      // Add cost to database using idb.js library
      const result = await database.addCost(newCost);
      
      // Clear the form after successful addition
      setAmount('');
      setCurrency('USD');
      setCategory('');
      setDescription('');

      // Show success message
      showMessage(`✅ Added ${newCost.currency} ${newCost.sum.toFixed(2)} for ${newCost.category}`, 'success');
      
    } catch (error) {
      // Show error message if something went wrong
      console.error('Failed to add cost:', error);
      showMessage('Failed to add cost: ' + error.message, 'error');
    } finally {
      // Always hide loading state
      setIsLoading(false);
    }
  };

  // Render the component
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom color="primary">
        Add New Cost Item
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter the details of your expense. All fields are required.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          
          {/* Amount Input Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount *"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputProps={{
                step: "0.01",  // Allow decimal values
                min: "0",      // Minimum value
                max: "999999.99" // Maximum value
              }}
              helperText="Enter the cost amount"
              required
            />
          </Grid>

          {/* Currency Selection Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Currency *"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              helperText="Select the currency"
              required
            >
              {/* Loop through currencies and create menu items */}
              {CURRENCIES.map((currencyOption) => (
                <MenuItem key={currencyOption} value={currencyOption}>
                  {currencyOption} - {
                    currencyOption === 'USD' ? 'US Dollar' : 
                    currencyOption === 'ILS' ? 'Israeli Shekel' :
                    currencyOption === 'GBP' ? 'British Pound' : 'European Euro'
                  }
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Category Selection Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Category *"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              helperText="Choose the expense category"
              required
            >
              <MenuItem value="">Select Category</MenuItem>
              {/* Loop through categories and create menu items */}
              {CATEGORIES.map((categoryOption) => (
                <MenuItem key={categoryOption} value={categoryOption}>
                  {categoryOption}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Description Input Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Description *"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              inputProps={{ maxLength: 100 }} // Limit to 100 characters
              helperText={`Brief description (${description.length}/100)`}
              required
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              disabled={isLoading} // Disable while loading
              sx={{ mt: 2 }}
            >
              {isLoading ? 'Adding...' : 'Add Cost Item'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

export default AddCostTab;