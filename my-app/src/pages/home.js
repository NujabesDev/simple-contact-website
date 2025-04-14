import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import teaImage from '../assets/imgs/tea.webp';
import gteaImage from '../assets/imgs/gtea.webp';
import BouncingShapes from '../BouncingShapes';

function Home() {
  const [imageState, setImageState] = useState(0);

  // Prevent right-click context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <div 
      className="background"
      onContextMenu={handleContextMenu}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
    >
      <BouncingShapes />
      
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
        <a href="https://github.com/NujabesDev" target="_blank" rel="noopener noreferrer">
          <h2>GitHub</h2>
        </a>
        <h2 className="no-copy">•</h2>
        <Link to="/newsletter">
          <h2>NASA Newsletter</h2>
        </Link>
        <h2 className="no-copy">•</h2>
        <Link to="/contact">
          <h2>Contact Me</h2>
        </Link>
      </div>

      {/* Clickable Image */}
      <div 
        className="main-text"
        style={{ pointerEvents: 'auto' }} // Allow image interaction
      >
        <img 
          src={imageState === 1 ? teaImage : gteaImage} 
          id="middle-image" 
          alt="Tea"
          onClick={() => setImageState(prev => prev === 1 ? 0 : 1)}
        />
      </div>
    </div>
  );
}

export default Home;