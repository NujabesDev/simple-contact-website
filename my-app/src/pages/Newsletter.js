import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import newsletterImage from '../assets/imgs/newsletterImage.svg';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Decode the Mailchimp URL from your .env file
  const MAILCHIMP_URL = "https://mattheww.us13.list-manage.com/subscribe/post?u=9911ecda9191c30d933073fa2&id=383d9bb83d&f_id=00be48e1f0";

  React.useEffect(() => {
    // Load Mailchimp validation script
    const script = document.createElement('script');
    script.src = '//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize Mailchimp validation
      if (window.fnames === undefined) window.fnames = [];
      if (window.ftypes === undefined) window.ftypes = [];
      window.fnames[0] = 'EMAIL';
      window.ftypes[0] = 'email';
    };

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setStatus('');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('EMAIL', email);
      formData.append('b_9911ecda9191c30d933073fa2_383d9bb83d', ''); // honeypot field

      // Submit to Mailchimp using fetch with no-cors mode
      const response = await fetch(MAILCHIMP_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // Required for Mailchimp cross-origin requests
      });

      // Since we're using no-cors, we can't read the response
      // But if we get here without error, it likely worked
      setStatus('Thank you for subscribing! Please check your email to confirm.');
      setEmail('');
      
    } catch (error) {
      console.error('Subscription error:', error);
      setStatus('There was an error. Please try again or contact me directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="background">
      <div className="main-text">
        <h1>NASA Newsletter</h1>
        <h2>Get a beautiful picture handpicked by NASA daily.</h2>
      </div>

      {/* Larger newsletter image for better mobile visibility */}
      <img src={newsletterImage} alt="snippet of newsletter" className="newsletter-image" />
      <p className="image-description">Example of Newsletter</p>

      <div className="newsletter-form">
        <p className="form-description">
          Do you live in a big city? Does the smog of our industrialization block out the stars for you? 
          Have you forgotten the beauty of our galaxy? 
          Sign up for this newsletter to get a different photograph of our universe, with a brief explanation written by a professional astronomer.
          Each photo is randomly chosen through the archive, so even those who actively check the <a href="https://apod.nasa.gov/apod/astropix.html" target="_blank" rel="noopener noreferrer">APOD</a> daily will still find this useful!  
          All copyright is respected.
        </p>
        
        <div id="mc_embed_signup">
          <form onSubmit={handleSubmit} id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form">
            <div id="mc_embed_signup_scroll">
              <div className="mc-field-group">
                <label htmlFor="mce-EMAIL">Email Address</label>
                <input 
                  type="email" 
                  name="EMAIL" 
                  id="mce-EMAIL" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  disabled={isSubmitting}
                  placeholder="Enter your email address"
                />
              </div>
              
              {/* Response messages */}
              {status && (
                <div className="response" style={{ 
                  display: 'block', 
                  color: status.includes('error') || status.includes('There was an error') ? '#ff6b6b' : '#63854f',
                  margin: '1rem 0',
                  textAlign: 'center'
                }}>
                  {status}
                </div>
              )}
              
              {/* Honeypot field */}
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
                    value={isSubmitting ? "Subscribing..." : "Subscribe"}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div className="social-icons">
        <Link to="/">
          <h2>Back to Home</h2>
        </Link>
      </div>
    </div>
  );
}

export default Newsletter;
