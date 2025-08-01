/**
 * @fileoverview Main entry point for the development/demo application
 * 
 * This file initializes the React application for development and testing
 * of the CLA Calendar component. It renders the demo App component which
 * showcases various calendar configurations and features.
 * 
 * The application runs in React's StrictMode to help identify potential
 * problems and ensure best practices during development.
 * 
 * @module main
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
