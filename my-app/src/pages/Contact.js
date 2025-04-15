import React from 'react';
import { Link } from 'react-router-dom';

function Contact() {
  return (
    <div className="background">
      <div className="main-text">
        <h1>Contact Me</h1>
      </div>
      
      <div className="contact-container">
        <p className="contact-description">
          Feel free to reach out with questions, collaboration opportunities, or just to say hello.
        </p>
        
        <div className="contact-email">
          <a 
            href="mailto:me@mattheww.org"
            aria-label="Email Me"
          >
            me@mattheww.org
          </a>
        </div>
      </div>
      
      <div className="social-icons">
        <Link 
          to="/"
          aria-label="Back to Home Page"
        >
          <h2>Back to Home</h2>
        </Link>
      </div>
    </div>
  );
}

export default Contact;