const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter with the provided email credentials
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.privateemail.com', // Common SMTP server for private email providers
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'info@vidzyme.digital',
      pass: 'Molashin.12.90.34.78'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send waitlist confirmation email
 * @param {string} email - Recipient email address
 */
const sendWaitlistConfirmationEmail = async (email) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'VidZyme Team',
        address: 'info@vidzyme.digital'
      },
      to: email,
      subject: 'Welcome to VidZyme - Early Access Confirmed',
      replyTo: 'info@vidzyme.digital',
      headers: {
        'X-Mailer': 'VidZyme Notification System',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'List-Unsubscribe': '<mailto:info@vidzyme.digital?subject=Unsubscribe>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      },
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to VidZyme Waitlist</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333333;
              max-width: 600px;
              margin: 0 auto;
              padding: 0;
              background-color: #f7fcfb;
            }
            .container {
              background-color: #ffffff;
              margin: 20px;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #071946 0%, #286986 100%);
              color: #ffffff;
              text-align: center;
              padding: 40px 30px;
            }
            .logo {
              font-size: 2.2em;
              font-weight: bold;
              margin-bottom: 10px;
              letter-spacing: 1px;
            }
            .welcome-text {
              font-size: 1.3em;
              margin: 0;
              opacity: 0.95;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 1.1em;
              margin-bottom: 25px;
              color: #071946;
            }
            .feature-section {
              margin: 30px 0;
            }
            .feature-title {
              color: #071946;
              font-size: 1.2em;
              font-weight: 600;
              margin-bottom: 20px;
            }
            .feature {
              background-color: #f1f4f9;
              padding: 20px;
              margin: 15px 0;
              border-left: 4px solid #286986;
              border-radius: 6px;
            }
            .feature-name {
              font-weight: 600;
              color: #071946;
              margin-bottom: 8px;
            }
            .feature-desc {
              color: #555555;
              margin: 0;
            }
            .cta-section {
              background-color: #f7fcfb;
              padding: 25px;
              text-align: center;
              margin: 30px 0;
              border-radius: 6px;
              border: 1px solid #e0f2fe;
            }
            .cta-text {
              font-size: 1.1em;
              color: #071946;
              font-weight: 600;
              margin: 0 0 10px 0;
            }
            .footer {
              background-color: #f1f4f9;
              padding: 30px;
              text-align: center;
              color: #666666;
              font-size: 0.9em;
            }
            .footer-brand {
              font-weight: 600;
              color: #071946;
            }
            .unsubscribe {
              margin-top: 20px;
              font-size: 0.8em;
              color: #888888;
            }
            .unsubscribe a {
              color: #286986;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">VidZyme</div>
              <h1 class="welcome-text">Welcome to Early Access</h1>
            </div>
            
            <div class="content">
              <p class="greeting">Hello,</p>
              <p>Thank you for joining the VidZyme waitlist. You're now part of an exclusive group that will receive early access to our revolutionary video creation platform.</p>
              
              <div class="feature-section">
                <h2 class="feature-title">What You Can Expect:</h2>
                
                <div class="feature">
                  <div class="feature-name">Instant Video Creation</div>
                  <p class="feature-desc">Transform your product photos into engaging UGC videos in seconds</p>
                </div>
                
                <div class="feature">
                  <div class="feature-name">Professional Quality</div>
                  <p class="feature-desc">Create influencer-style content without the cost of hiring creators</p>
                </div>
                
                <div class="feature">
                  <div class="feature-name">Business Ready</div>
                  <p class="feature-desc">Perfect for e-commerce, social media marketing, and content creation</p>
                </div>
              </div>
              
              <div class="cta-section">
                <p class="cta-text">We'll notify you immediately when VidZyme launches</p>
                <p style="margin: 0; color: #555555;">Get ready to revolutionize your content creation process.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Best regards,<br><span class="footer-brand">The VidZyme Team</span></p>
              <div class="unsubscribe">
                <p>This email was sent to ${email} because you joined our waitlist.<br>
                VidZyme - Transform Images into Viral Videos</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to VidZyme - Early Access Confirmed
        
        Hello,
        
        Thank you for joining the VidZyme waitlist. You're now part of an exclusive group that will receive early access to our revolutionary video creation platform.
        
        What You Can Expect:
        
        Instant Video Creation
        Transform your product photos into engaging UGC videos in seconds
        
        Professional Quality
        Create influencer-style content without the cost of hiring creators
        
        Business Ready
        Perfect for e-commerce, social media marketing, and content creation
        
        We'll notify you immediately when VidZyme launches. Get ready to revolutionize your content creation process.
        
        Best regards,
        The VidZyme Team
        
        This email was sent to ${email} because you joined our waitlist.
        VidZyme - Transform Images into Viral Videos
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return result;

  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

/**
 * Send notification email to waitlist users when launching
 * @param {string} email - Recipient email address
 */
const sendLaunchNotificationEmail = async (email) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'VidZyme Team',
        address: 'info@vidzyme.digital'
      },
      to: email,
      subject: '🚀 VidZyme is LIVE! Your Early Access is Ready',
      replyTo: 'info@vidzyme.digital',
      headers: {
        'X-Mailer': 'VidZyme Notification System',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'List-Unsubscribe': '<mailto:info@vidzyme.digital?subject=Unsubscribe>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      },
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>VidZyme is Live!</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 15px;
              padding: 40px;
              text-align: center;
              color: white;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .cta {
              background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 25px;
              display: inline-block;
              margin: 20px 0;
              font-weight: bold;
              font-size: 1.2em;
              box-shadow: 0 4px 15px rgba(254, 107, 139, 0.4);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 VidZyme is LIVE!</h1>
            <p>The wait is over! VidZyme is now available and ready to transform your content creation process.</p>
            <a href="https://vidzyme.digital" class="cta">Start Creating Videos Now!</a>
            <p>Thank you for being part of our journey from the beginning.</p>
            <p>Best regards,<br>The VidZyme Team</p>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Launch notification sent successfully:', result.messageId);
    return result;

  } catch (error) {
    console.error('❌ Launch notification failed:', error.message);
    throw error;
  }
};

module.exports = {
  sendWaitlistConfirmationEmail,
  sendLaunchNotificationEmail
};