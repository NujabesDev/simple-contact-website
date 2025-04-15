import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.js';
import Contact from './pages/Contact.js';
import Newsletter from './pages/Newsletter.js';
import './App.css';

function App() {
  // Set viewport meta tag with proper settings for mobile
  useEffect(() => {
    // Get the existing viewport meta tag or create one if it doesn't exist
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    
    // Set optimal viewport settings for mobile
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover';
    
    // Add theme color for mobile browsers
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = '#131313';
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/newsletter" element={<Newsletter />} />
      </Routes>
    </Router>
  );
}

export default App;