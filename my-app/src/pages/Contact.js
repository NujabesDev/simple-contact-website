import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ParticleBackground from '../ParticleBackground';

function Contact() {
  // Add state for image/particle color state (matching Home component)
  const [imageState, setImageState] = useState(0);
  // Add state for copy notification
  const [copied, setCopied] = useState(false);
  
  // Function to copy email to clipboard and show notification
  const copyEmail = () => {
    const email = "me@mattheww.org";
    navigator.clipboard.writeText(email)
      .then(() => {
        // Show the copied notification
        setCopied(true);
        
        // Hide notification after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy email: ', err);
      });
  };
  
  return (
    <div className="background">
      {/* Add the ParticleBackground component */}
      <ParticleBackground imageState={imageState} />
      
      <div className="main-text">
        <h1>Contact Me</h1>
      </div>
      
      <div className="contact-container">
        <h2 className="contact-description">
          Feel free to reach out with questions, collaboration opportunities, or just to say hello.
        </h2>
        
        <div className="contact-email" style={{ position: 'relative' }}>
          {/* Email with click handler */}
          <span 
            onClick={copyEmail}
            style={{ 
              position: 'relative',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              border: copied ? '1px solid #63854f' : '1px solid transparent',
              backgroundColor: copied ? 'rgba(99, 133, 79, 0.1)' : 'transparent',
              cursor: 'pointer',
              color: '#872e1b'
            }}
          >
            me@mattheww.org
            
            {/* Copied message */}
            {copied && (
              <span style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#63854f',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.9rem',
                opacity: copied ? '1' : '0',
                transition: 'opacity 0.3s ease',
                whiteSpace: 'nowrap'
              }}>
                Copied!
              </span>
            )}
          </span>
        </div>
      </div>
      
      <div className="social-icons">
        <Link to="/">
          <h2>Back to Home</h2>
        </Link>
      </div>
      
      {/* Optional: Add a hidden button that toggles the particle color state */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          width: '20px', 
          height: '20px', 
          cursor: 'pointer',
          opacity: 0.3,
          borderRadius: '50%',
          backgroundColor: imageState === 0 ? '#63854f' : '#872e1b'
        }}
        onClick={() => setImageState(prev => prev === 0 ? 1 : 0)}
      />
    </div>
  );
}

export default Contact;