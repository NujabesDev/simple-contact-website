import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import newsletterImage from '../assets/imgs/newsletterImage.svg';

function Newsletter() {
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

  // Load Mailchimp validation script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize Mailchimp validation
      window.fnames = [];
      window.ftypes = [];
      window.fnames[0] = 'EMAIL';
      window.ftypes[0] = 'email';
    };

    // Cleanup
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="background">
      <div className="main-text">
        <h1>NASA Newsletter</h1>
        <h2>Get a beautiful picture handpicked by NASA daily.</h2>
      </div>

      <img 
        src={newsletterImage} 
        alt="NASA newsletter preview" 
        className="newsletter-image" 
        style={{ 
          width: isMobile ? '40%' : '20%',
          maxWidth: isMobile ? '200px' : '30rem'
        }}
      />

      <div className="newsletter-form">
        <p className="form-description">
          Sign up to receive daily emails for a stunning picture from NASA's collection. 
          Pictures are randomly selected from the archive of <a 
            href="https://apod.nasa.gov/apod/astropix.html" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="NASA Astronomy Picture of the Day website"
          >
            Astronomy Picture of the Day
          </a>.
        </p>
        
        <div id="mc_embed_signup">
          <form 
            action="https://mattheww.us13.list-manage.com/subscribe/post?u=9911ecda9191c30d933073fa2&amp;id=383d9bb83d&amp;f_id=00be48e1f0" 
            method="post" 
            id="mc-embedded-subscribe-form" 
            name="mc-embedded-subscribe-form" 
            className="validate" 
            target="_blank"
            noValidate
          >
            <div id="mc_embed_signup_scroll">
              <div className="mc-field-group">
                <label htmlFor="mce-EMAIL">Email Address</label>
                <input 
                  type="email" 
                  name="EMAIL" 
                  className="required email" 
                  id="mce-EMAIL" 
                  required 
                  aria-required="true"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="your@email.com"
                />
              </div>
              <div id="mce-responses" className="clear foot">
                <div className="response" id="mce-error-response" style={{ display: 'none' }}></div>
                <div className="response" id="mce-success-response" style={{ display: 'none' }}></div>
              </div>
              <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                <input type="text" name="b_9911ecda9191c30d933073fa2_383d9bb83d" tabIndex="-1" value="" readOnly />
              </div>
              <div className="optionalParent">
                <div className="clear foot">
                  <input 
                    type="submit" 
                    name="subscribe" 
                    id="mc-embedded-subscribe" 
                    className="button" 
                    value="Subscribe" 
                    style={{
                      minHeight: '44px', // Better touch target
                      width: isMobile ? '100%' : 'auto' // Full width on mobile
                    }}
                  />
                </div>
              </div>
            </div>
          </form>
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

export default Newsletter;