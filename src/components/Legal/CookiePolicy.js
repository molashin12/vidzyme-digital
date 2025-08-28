import React from 'react';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const CookiePolicy = () => {
  const cookieData = [
    {
      name: 'Essential Cookies',
      purpose: 'Required for basic website functionality, user authentication, and security',
      duration: 'Session / 1 year',
      examples: '_session, _auth, _csrf'
    },
    {
      name: 'Analytics Cookies',
      purpose: 'Help us understand how visitors interact with our website',
      duration: '2 years',
      examples: '_ga, _gid, _gtag'
    },
    {
      name: 'Functional Cookies',
      purpose: 'Remember your preferences and settings',
      duration: '1 year',
      examples: '_preferences, _theme, _language'
    },
    {
      name: 'Performance Cookies',
      purpose: 'Monitor website performance and user experience',
      duration: '30 days',
      examples: '_performance, _speed, _errors'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Cookie Policy
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Last Updated: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ '& > *': { mb: 3 } }}>
          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              1. What Are Cookies?
            </Typography>
            <Typography variant="body1" paragraph>
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, analyzing how you use our site, and ensuring our services work properly.
            </Typography>
            <Typography variant="body1" paragraph>
              Similar technologies include web beacons, pixels, and local storage, which serve similar purposes to cookies.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              2. How We Use Cookies
            </Typography>
            <Typography variant="body1" paragraph>
              VidZyme uses cookies and similar technologies for several purposes:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Essential Operations:</strong> To provide core functionality and security</li>
              <li><strong>User Experience:</strong> To remember your preferences and settings</li>
              <li><strong>Analytics:</strong> To understand how our service is used and improve it</li>
              <li><strong>Performance:</strong> To monitor and optimize our website's performance</li>
              <li><strong>Security:</strong> To detect and prevent fraudulent activity</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              3. Types of Cookies We Use
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Cookie Type</strong></TableCell>
                    <TableCell><strong>Purpose</strong></TableCell>
                    <TableCell><strong>Duration</strong></TableCell>
                    <TableCell><strong>Examples</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cookieData.map((cookie, index) => (
                    <TableRow key={index}>
                      <TableCell><strong>{cookie.name}</strong></TableCell>
                      <TableCell>{cookie.purpose}</TableCell>
                      <TableCell>{cookie.duration}</TableCell>
                      <TableCell><code>{cookie.examples}</code></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              4. Third-Party Cookies
            </Typography>
            <Typography variant="body1" paragraph>
              We may use third-party services that set their own cookies. These include:
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              4.1 Google Analytics
            </Typography>
            <Typography variant="body1" paragraph>
              We use Google Analytics to understand how visitors use our website. Google Analytics uses cookies to collect information about your use of our site.
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Cookies: _ga, _gid, _gat</li>
              <li>Purpose: Website analytics and performance measurement</li>
              <li>Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
              <li>Opt-out: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a></li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              4.2 Payment Processors
            </Typography>
            <Typography variant="body1" paragraph>
              Our payment partners (Stripe, PayPal) may set cookies for fraud prevention and payment processing.
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              4.3 Content Delivery Networks (CDN)
            </Typography>
            <Typography variant="body1" paragraph>
              We use CDNs to deliver content efficiently, which may set performance-related cookies.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              5. Managing Your Cookie Preferences
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              5.1 Browser Settings
            </Typography>
            <Typography variant="body1" paragraph>
              You can control cookies through your browser settings:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Chrome:</strong> Settings > Privacy and Security > Cookies and other site data</li>
              <li><strong>Firefox:</strong> Options > Privacy & Security > Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences > Privacy > Cookies and website data</li>
              <li><strong>Edge:</strong> Settings > Cookies and site permissions</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              5.2 Cookie Consent Management
            </Typography>
            <Typography variant="body1" paragraph>
              When you first visit our website, you'll see a cookie consent banner where you can:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Accept all cookies</li>
              <li>Reject non-essential cookies</li>
              <li>Customize your cookie preferences</li>
              <li>Learn more about each cookie category</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              5.3 Opting Out of Analytics
            </Typography>
            <Typography variant="body1" paragraph>
              You can opt out of Google Analytics by:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a></li>
              <li>Enabling "Do Not Track" in your browser</li>
              <li>Using our cookie preference center</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              6. Impact of Disabling Cookies
            </Typography>
            <Typography variant="body1" paragraph>
              While you can disable cookies, please note that this may affect your experience:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Essential Cookies:</strong> Disabling these may prevent core functionality</li>
              <li><strong>Functional Cookies:</strong> You may need to re-enter preferences each visit</li>
              <li><strong>Analytics Cookies:</strong> We won't be able to improve our service based on usage data</li>
              <li><strong>Performance Cookies:</strong> The website may load slower or have issues</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              7. Mobile App Data Collection
            </Typography>
            <Typography variant="body1" paragraph>
              Our mobile applications may use similar technologies to cookies, including:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Device identifiers and advertising IDs</li>
              <li>Local storage and app preferences</li>
              <li>Analytics SDKs and crash reporting tools</li>
              <li>Push notification tokens</li>
            </Typography>
            <Typography variant="body1" paragraph>
              You can manage these through your device settings and app permissions.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              8. Data Retention
            </Typography>
            <Typography variant="body1" paragraph>
              Different types of cookies are retained for different periods:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain until expiration or manual deletion</li>
              <li><strong>Analytics Data:</strong> Typically retained for 26 months</li>
              <li><strong>Performance Data:</strong> Usually retained for 30-90 days</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              9. Legal Basis for Cookie Use
            </Typography>
            <Typography variant="body1" paragraph>
              Our legal basis for using cookies depends on the type:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Essential Cookies:</strong> Legitimate interest (necessary for service provision)</li>
              <li><strong>Functional Cookies:</strong> Consent or legitimate interest</li>
              <li><strong>Analytics Cookies:</strong> Consent</li>
              <li><strong>Marketing Cookies:</strong> Consent (we currently don't use these)</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              10. International Transfers
            </Typography>
            <Typography variant="body1" paragraph>
              Some of our third-party cookie providers may transfer data internationally. We ensure appropriate safeguards are in place, including:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Adequacy decisions</li>
              <li>Privacy Shield certification (where applicable)</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              11. Updates to This Policy
            </Typography>
            <Typography variant="body1" paragraph>
              We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Updating the "Last Updated" date</li>
              <li>Displaying a notice on our website</li>
              <li>Sending email notifications for significant changes</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              12. Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </Typography>
            <Typography variant="body1">
              Email: privacy@vidzyme.com<br />
              Address: [Your Business Address]<br />
              Phone: [Your Phone Number]
            </Typography>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              You can also manage your cookie preferences at any time through our cookie preference center or your browser settings.
            </Typography>
          </section>
        </Box>
      </Paper>
    </Container>
  );
};

export default CookiePolicy;