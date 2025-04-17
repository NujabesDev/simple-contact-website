import React from 'react';
import { Link } from 'react-router-dom';
import newsletterImage from '../assets/imgs/newsletterImage.svg';

function Newsletter() {
  React.useEffect(() => {
    // Load Mailchimp validation script
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

    return () => {
      // Cleanup
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

      {/* Larger newsletter image for better mobile visibility */}
      <img src={newsletterImage} alt="snippet of newsletter" className="newsletter-image" />
      <p className= "image-description">Example of Newsletter</p>

      <div className="newsletter-form">
        <p className="form-description">
        Do you live in a big city? Does the smog of our industrialization block out the stars for you? 
        Have you forgotten the beauty of our galaxy? 
        Sign up for this newsletter to get a different photograph of our universe, with a brief explanation written by a professional astronomer.
        Each photo is randomly chosen through the archive, so even those who actively check the <a href="https://apod.nasa.gov/apod/astropix.html" target="_blank" rel="noopener noreferrer">APOD</a> daily will still find this useful!  
        All copyright is respected.</p>
        
        <div id="mc_embed_signup">
          <form 
            action="https://mattheww.us13.list-manage.com/subscribe/post?u=9911ecda9191c30d933073fa2&amp;id=383d9bb83d&amp;f_id=00be48e1f0" 
            method="post" 
            id="mc-embedded-subscribe-form" 
            name="mc-embedded-subscribe-form" 
            className="validate" 
            target="_blank"
          >
            <div id="mc_embed_signup_scroll">
              <div className="mc-field-group">
                <label htmlFor="mce-EMAIL">Email Address</label>
                <input type="email" name="EMAIL" className="required email" id="mce-EMAIL" required />
              </div>
              <div id="mce-responses" className="clear foot">
                <div className="response" id="mce-error-response" style={{ display: 'none' }}></div>
                <div className="response" id="mce-success-response" style={{ display: 'none' }}></div>
              </div>
              <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                <input type="text" name="b_9911ecda9191c30d933073fa2_383d9bb83d" tabIndex="-1" value="" />
              </div>
              <div className="optionalParent">
                <div className="clear foot">
                  <input type="submit" name="subscribe" id="mc-embedded-subscribe" className="button" value="Subscribe" />
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