import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import teaImage from '../assets/imgs/tea.webp';
import gteaImage from '../assets/imgs/gtea.webp';
import ParticleBackground from '../ParticleBackground';

function Home() {
  const [imageState, setImageState] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Prevent right-click context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
  };
  
  // Handle image click/tap
  const handleImageClick = () => {
    setImageState(prev => prev === 0 ? 1 : 0);
  };

  return (
    <div
      className="background"
      onContextMenu={handleContextMenu}
    >
      <ParticleBackground imageState={imageState} />
     
      {/* Content Container */}
      <div
        className={`main-text ${imageState === 0 ? 'main-text-inverse' : ''}`}
        style={{ pointerEvents: 'none' }}
      >
        <h1>Matthew Witkowski</h1>
      </div>
      
      {/* Social Icons with selective pointer events */}
      <div
        className="social-icons"
        style={{ pointerEvents: 'auto' }} // Allow clicking links
      >
        <a 
          href="https://github.com/NujabesDev" 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="GitHub Profile"
        >
          <h2>GitHub</h2>
        </a>
        <h2 className="no-copy">•</h2>
        <Link to="/newsletter" aria-label="NASA Newsletter">
          <h2>NASA Newsletter</h2>
        </Link>
        <h2 className="no-copy">•</h2>
        <Link to="/contact" aria-label="Contact Page">
          <h2>Contact Me</h2>
        </Link>
      </div>
      
      {/* Clickable Image - Now with accessibility and touch support */}
      <div
        className="main-text"
        style={{ pointerEvents: 'auto' }} // Allow image interaction
      >
        <img
          src={imageState === 0 ? gteaImage : teaImage}
          id="middle-image"
          alt={imageState === 0 ? "Green Tea (Click to change)" : "Tea (Click to change)"}
          onClick={handleImageClick}
          onTouchEnd={handleImageClick}
          role="button"
          tabIndex="0"
          aria-label="Toggle between green tea and regular tea"
          style={{ 
            border: '1px solid transparent',
            touchAction: 'manipulation' // Better touch handling
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleImageClick();
              e.preventDefault();
            }
          }}
        />
      </div>
    </div>
  );
}

export default Home;