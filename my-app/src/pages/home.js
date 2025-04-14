import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import teaImage from '../assets/imgs/tea.webp';
import gteaImage from '../assets/imgs/gtea.webp';
import SymmetricPendulum from '../SymmetricPendulum';

function Home() {
  const [imageState, setImageState] = useState(0);

  const toggleContent = () => {
    setImageState(imageState === 1 ? 0 : 1);
  };

  return (
    <div className="background">
      <SymmetricPendulum />
      <div className={`main-text ${imageState === 0 ? 'main-text-inverse' : ''}`}>
        <h1>Matthew Witkowski</h1>
      </div>
      <div className="social-icons">
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
      <div className="main-text">
        <img 
          src={imageState === 1 ? teaImage : gteaImage} 
          id="middle-image" 
          alt="Tea"
          onClick={toggleContent}
        />
      </div>
    </div>
  );
}

export default Home;