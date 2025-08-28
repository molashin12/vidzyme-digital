import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Privacy Policy
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Last Updated: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ '& > *': { mb: 3 } }}>
          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              1. Introduction
            </Typography>
            <Typography variant="body1" paragraph>
              VidZyme ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered video generation service.
            </Typography>
            <Typography variant="body1" paragraph>
              This policy applies to all users of our website, mobile applications, and related services (collectively, the "Service").
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              2. Information We Collect
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              2.1 Personal Information
            </Typography>
            <Typography variant="body1" paragraph>
              We may collect the following personal information:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Name and contact information (email address, phone number)</li>
              <li>Account credentials (username, password)</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Profile information and preferences</li>
              <li>Communication records with our support team</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              2.2 Content and Usage Data
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Text prompts, images, and other inputs you provide</li>
              <li>Generated videos and content</li>
              <li>Usage patterns and feature interactions</li>
              <li>Device information and technical specifications</li>
              <li>IP address and location data</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              2.3 Automatically Collected Information
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Cookies and similar tracking technologies</li>
              <li>Log files and server data</li>
              <li>Analytics and performance metrics</li>
              <li>Browser type and operating system</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              3. How We Use Your Information
            </Typography>
            <Typography variant="body1" paragraph>
              We use your information for the following purposes:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Service Provision:</strong> To provide, maintain, and improve our video generation services</li>
              <li><strong>AI Training:</strong> To train and improve our AI models (using anonymized data)</li>
              <li><strong>Account Management:</strong> To create and manage your account</li>
              <li><strong>Communication:</strong> To send service updates, support responses, and marketing communications</li>
              <li><strong>Payment Processing:</strong> To process transactions and manage subscriptions</li>
              <li><strong>Security:</strong> To detect fraud, abuse, and security threats</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
              <li><strong>Analytics:</strong> To understand usage patterns and improve user experience</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              4. Legal Basis for Processing (GDPR)
            </Typography>
            <Typography variant="body1" paragraph>
              For users in the European Union, we process your personal data based on:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Contract:</strong> Processing necessary to provide our services</li>
              <li><strong>Legitimate Interest:</strong> For service improvement, security, and analytics</li>
              <li><strong>Consent:</strong> For marketing communications and optional features</li>
              <li><strong>Legal Obligation:</strong> For compliance with applicable laws</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              5. Information Sharing and Disclosure
            </Typography>
            <Typography variant="body1" paragraph>
              We do not sell your personal information. We may share your information in the following circumstances:
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              5.1 Service Providers
            </Typography>
            <Typography variant="body1" paragraph>
              We work with trusted third-party service providers for:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Cloud hosting and storage (Google Cloud, AWS)</li>
              <li>Payment processing (Stripe, PayPal)</li>
              <li>Analytics and monitoring</li>
              <li>Customer support tools</li>
              <li>Email and communication services</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              5.2 Legal Requirements
            </Typography>
            <Typography variant="body1" paragraph>
              We may disclose information when required by law, court order, or to:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Comply with legal processes</li>
              <li>Protect our rights and property</li>
              <li>Ensure user safety and security</li>
              <li>Investigate fraud or abuse</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              5.3 Business Transfers
            </Typography>
            <Typography variant="body1" paragraph>
              In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              6. Data Security
            </Typography>
            <Typography variant="body1" paragraph>
              We implement industry-standard security measures to protect your information:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Encryption in transit and at rest</li>
              <li>Regular security audits and assessments</li>
              <li>Access controls and authentication</li>
              <li>Secure data centers and infrastructure</li>
              <li>Employee training on data protection</li>
            </Typography>
            <Typography variant="body1" paragraph>
              However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              7. Data Retention
            </Typography>
            <Typography variant="body1" paragraph>
              We retain your information for as long as necessary to:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Provide our services to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Improve our services and AI models</li>
            </Typography>
            <Typography variant="body1" paragraph>
              Account information is typically retained for 3 years after account closure. Generated content may be retained longer for service improvement purposes (in anonymized form).
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              8. Your Rights and Choices
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              8.1 General Rights
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              8.2 EU Residents (GDPR Rights)
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Right to object to processing</li>
              <li>Right to restrict processing</li>
              <li>Right to withdraw consent</li>
              <li>Right to lodge a complaint with supervisory authorities</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              8.3 California Residents (CCPA Rights)
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Right to know what personal information is collected</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of sale (we do not sell personal information)</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              9. Cookies and Tracking Technologies
            </Typography>
            <Typography variant="body1" paragraph>
              We use cookies and similar technologies to:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Remember your preferences and settings</li>
              <li>Analyze website traffic and usage</li>
              <li>Provide personalized content and features</li>
              <li>Ensure security and prevent fraud</li>
            </Typography>
            <Typography variant="body1" paragraph>
              You can control cookie settings through your browser preferences. However, disabling cookies may affect service functionality.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              10. International Data Transfers
            </Typography>
            <Typography variant="body1" paragraph>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Adequacy decisions by relevant authorities</li>
              <li>Certification schemes and codes of conduct</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              11. Children's Privacy
            </Typography>
            <Typography variant="body1" paragraph>
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              12. Changes to This Privacy Policy
            </Typography>
            <Typography variant="body1" paragraph>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Posting the updated policy on our website</li>
              <li>Sending email notifications to registered users</li>
              <li>Displaying prominent notices in our Service</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              13. Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </Typography>
            <Typography variant="body1">
              <strong>Data Protection Officer:</strong><br />
              Email: privacy@vidzyme.com<br />
              Address: [Your Business Address]<br />
              Phone: [Your Phone Number]
            </Typography>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              <strong>EU Representative:</strong> [If applicable]<br />
              <strong>UK Representative:</strong> [If applicable]
            </Typography>
          </section>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;