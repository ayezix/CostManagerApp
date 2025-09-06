// index.js - Simple Student Version
// This is the entry point that starts our React app

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Find the div with id="root" in index.html and put our app there
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: measure how fast our app loads (for performance)
reportWebVitals();
