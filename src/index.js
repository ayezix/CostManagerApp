/*
 * index.js - Application Entry Point
 * 
 * 🎯 What this does (for students):
 * This is the entry point that starts our React app.
 * It finds the div with id="root" in index.html and renders our App component there.
 * 
 * 📚 Key Learning Concepts:
 * - ReactDOM.createRoot(): Modern way to mount React apps
 * - React.StrictMode: Helps catch common mistakes during development
 * - Entry Point: Where the application starts executing
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import APP from './App';

// Find the div with id="root" in index.html and put our app there
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <APP />
  </React.StrictMode>
);
