/*
 * AddCostTab.js - Add New Expense Form
 * 
 * 🎯 What this does (for students):
 * This creates a form where users can add new expenses, like writing a digital receipt.
 * The user enters: amount, currency, category, and description.
 * When they click "Add Cost", it saves to the database.
 * 
 * 📚 Key Learning Concepts:
 * - React Forms: Collecting user input with controlled components
 * - State Management: Using useState to remember what user typed
 * - Event Handlers: Functions that run when user submits form
 * - Validation: Checking if user entered valid data
 * - Database Operations: Saving data to IndexedDB
 */

import React, { useState } from 'react';
import {
  Paper,      // Creates a card-like container with shadow
  Typography, // For text and headings
  TextField,  // Input fields for typing
  MenuItem,   // Options in dropdown menus
  Button,     // Clickable buttons
  Box,        // Container for layout
  Grid        // Helps arrange items in rows and columns
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material'; // Plus icon for the button
import { CURRENCIES, getCurrencyName } from '../services/currencyService'; // Import currency data

// 📝 List of expense categories (types of things you spend money on)
// Students can easily understand and modify this list
const CATEGORIES = [
  'Food',           // 🍕 Groceries, restaurants, snacks
  'Transportation', // 🚗 Bus, taxi, gas, parking
  'Entertainment',  // 🎬 Movies, games, concerts
  'Education',      // 📚 Books, courses, school supplies
  'Healthcare',     // 🏥 Medicine, doctor visits
  'Shopping',       // 🛍️ Clothes, electronics, gifts
  'Utilities',      // 📱 Phone, internet, electricity
  'Other'          // ❓ Anything else that doesn't fit above
];

function ADDCOSTTAB({ showMessage, database }) {
  // 📊 React State Variables (these "remember" what the user types)
  // Think of these like having a notepad that remembers information
  
  const [amount, setAmount] = useState('');        // 💰 How much money was spent
  const [currency, setCurrency] = useState('USD'); // 💱 What currency (starts with USD)
  const [category, setCategory] = useState('');    // 📂 What type of expense
  const [description, setDescription] = useState(''); // 📝 Details about the purchase
  const [isLoading, setIsLoading] = useState(false);  // ⏳ Shows "Adding..." when saving

  // 📤 This function runs when user clicks "Add Cost Item" button
  // It's like submitting a form - we validate data, then save to database
  const handleSubmit = async function(event) {
    // Step 1: Prevent page from refreshing (default form behavior)
    event.preventDefault();
    
    // Step 1: Check if database is ready
    if (!database) {
      showMessage('Database not ready', 'error');
      return; // Stop here if database isn't working
    }

    // Step 2: Make sure user filled in all required fields
    if (!amount || !category || !description.trim()) {
      showMessage('Please fill in all fields', 'error');
      return; // Stop here if any field is empty
    }

    // Step 3: Check if the amount is a valid positive number
    const amountNumber = parseFloat(amount); // Convert text to number
    if (amountNumber <= 0) {
      showMessage('Amount must be greater than 0', 'error');
      return; // Stop here if amount is 0 or negative
    }

    // Step 4: Show loading state (button says "Adding..." instead of "Add Cost Item")
    setIsLoading(true);
    
    try {
      // Step 5: Create the expense object to save
      const newCost = {
        sum: amountNumber,                  // Amount as a number
        currency: currency,                 // Selected currency (USD, ILS, etc.)
        category: category,                 // Selected category (Food, Transport, etc.)
        description: description.trim()     // Remove extra spaces from description
      };

      // Step 6: Save to database (this might take a moment)
      await database.addCost(newCost);
      
      // Step 7: Clear the form so user can add another expense
      setAmount('');
      setCurrency('USD');
      setCategory('');
      setDescription('');

      // Step 8: Show success message
      showMessage(`✅ Added ${newCost.currency} ${newCost.sum.toFixed(2)} for ${newCost.category}`, 'success');
      
    } catch (error) {
      // Step 9: If something went wrong, show error message
      console.error('Failed to add cost:', error);
      showMessage('Failed to add cost: ' + error.message, 'error');
    } finally {
      // Step 10: Always turn off loading state (whether success or error)
      setIsLoading(false);
    }
  };

  // This is what the user sees - the actual form on the screen
  return (
    // Paper creates a card with shadow - like a piece of paper on a desk
    <Paper elevation={2} sx={{ p: 3 }}>
      {/* Main heading */}
      <Typography variant="h5" gutterBottom color="primary">
        Add New Cost Item
      </Typography>
      {/* Subtitle explaining what to do */}
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter the details of your expense. All fields are required.
      </Typography>

      {/* The actual form - when submitted, it runs handleSubmit function */}
      <Box component="form" onSubmit={handleSubmit}>
        {/* Grid makes things line up nicely in rows and columns */}
        <Grid container spacing={3}>
          
          {/* Amount input field - where user types how much they spent */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth                    // Takes up full width of its container
              label="Amount"               // Text that appears above the input
              type="number"                // Only allows numbers to be typed
              value={amount}               // Current value (from our state)
              onChange={(event) => setAmount(event.target.value)} // Update state when user types
              inputProps={{
                step: "0.01",              // Allows cents (like 5.99)
                min: "0",                  // Can't enter negative numbers
                max: "999999.99"           // Maximum amount allowed
              }}
              helperText="Enter the cost amount"  // Small text below the input
              required                     // This field must be filled
            />
          </Grid>

          {/* Currency dropdown - user picks USD, ILS, GBP, or EURO */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select                       // Makes it a dropdown menu
              label="Currency"
              value={currency}             // Currently selected currency
              onChange={(event) => setCurrency(event.target.value)} // Update when user selects
              helperText="Select the currency"
              required
            >
              {/* Loop through all available currencies and create menu options */}
              {CURRENCIES.map((currencyOption) => (
                <MenuItem key={currencyOption} value={currencyOption}>
                  {currencyOption} - {getCurrencyName(currencyOption)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Category dropdown - user picks what type of expense this is */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              helperText="Choose the expense category"
              required
            >
              {/* Empty option at the top */}
              <MenuItem value="">Select Category</MenuItem>
              {/* Loop through all categories and create menu options */}
              {CATEGORIES.map((categoryOption) => (
                <MenuItem key={categoryOption} value={categoryOption}>
                  {categoryOption}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Description field - user describes what they bought */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              inputProps={{ maxLength: 100 }}  // Can't type more than 100 characters
              helperText={`Brief description (${description.length}/100)`} // Shows character count
              required
            />
          </Grid>

          {/* Submit button - saves the expense when clicked */}
          <Grid item xs={12}>
            <Button
              type="submit"                // This makes it submit the form
              variant="contained"          // Filled button style
              size="large"                 // Bigger button
              startIcon={<AddIcon />}      // Plus icon on the left
              disabled={isLoading}         // Can't click while saving
              sx={{ mt: 2 }}              // Margin top for spacing
            >
              {/* Text changes based on whether we're saving or not */}
              {isLoading ? 'Adding...' : 'Add Cost Item'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

export default ADDCOSTTAB;