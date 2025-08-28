import React from 'react';
import { Container, Typography, Box, Paper, Alert, Divider } from '@mui/material';

const DMCAPolicy = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          DMCA Copyright Policy
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Last Updated: {new Date().toLocaleDateString()}
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          VidZyme respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA). 
          This policy outlines our procedures for handling copyright infringement claims.
        </Alert>

        <Box sx={{ '& > *': { mb: 3 } }}>
          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              1. Overview
            </Typography>
            <Typography variant="body1" paragraph>
              VidZyme, Inc. ("VidZyme," "we," "us," or "our") respects the intellectual property rights of others and expects our users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), we have implemented procedures for receiving written notification of claimed copyright infringement and for processing such claims.
            </Typography>
            <Typography variant="body1" paragraph>
              This policy applies to all content generated, uploaded, or shared through VidZyme's AI-powered video generation platform and related services.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              2. Designated Copyright Agent
            </Typography>
            <Typography variant="body1" paragraph>
              VidZyme has designated the following agent to receive notifications of claimed copyright infringement:
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mt: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="body1">
                <strong>DMCA Copyright Agent</strong><br />
                VidZyme, Inc.<br />
                Attn: Copyright Agent<br />
                [Your Business Address]<br />
                [City, State, ZIP Code]<br />
                Email: dmca@vidzyme.com<br />
                Phone: [Your Phone Number]
              </Typography>
            </Paper>
            
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              Please note that this contact information is exclusively for reporting copyright infringement claims. 
              For other inquiries, please use our general contact information.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              3. Filing a DMCA Takedown Notice
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              3.1 Required Elements
            </Typography>
            <Typography variant="body1" paragraph>
              To file a valid DMCA takedown notice, you must provide a written communication that includes all of the following elements:
            </Typography>
            
            <Typography component="ol" sx={{ pl: 3 }}>
              <li><strong>Identification of the copyrighted work:</strong> A description of the copyrighted work that you claim has been infringed, including:
                <ul>
                  <li>Title of the work</li>
                  <li>Copyright registration number (if available)</li>
                  <li>Description of the work if no title exists</li>
                  <li>If multiple works are involved, a representative list</li>
                </ul>
              </li>
              
              <li><strong>Identification of the infringing material:</strong> A description of the material you claim is infringing and information sufficient to locate it, including:
                <ul>
                  <li>URL(s) where the infringing content is located</li>
                  <li>Video ID or content identifier</li>
                  <li>Specific description of the infringing content</li>
                  <li>Timestamp or location within longer content</li>
                </ul>
              </li>
              
              <li><strong>Contact information:</strong> Your contact information, including:
                <ul>
                  <li>Full legal name</li>
                  <li>Mailing address</li>
                  <li>Telephone number</li>
                  <li>Email address</li>
                </ul>
              </li>
              
              <li><strong>Good faith statement:</strong> A statement that you have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law.</li>
              
              <li><strong>Accuracy statement:</strong> A statement that the information in the notification is accurate and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner.</li>
              
              <li><strong>Signature:</strong> Your physical or electronic signature (or that of a person authorized to act on behalf of the copyright owner).</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              3.2 How to Submit
            </Typography>
            <Typography variant="body1" paragraph>
              DMCA takedown notices should be sent to our designated copyright agent:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Email:</strong> dmca@vidzyme.com (preferred method)</li>
              <li><strong>Mail:</strong> Send to the address listed above</li>
              <li><strong>Fax:</strong> [Your Fax Number] (if available)</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              3.3 Processing Timeline
            </Typography>
            <Typography variant="body1" paragraph>
              Upon receipt of a valid DMCA takedown notice:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>We will acknowledge receipt within 24-48 hours</li>
              <li>We will remove or disable access to the allegedly infringing content promptly</li>
              <li>We will notify the user who posted the content</li>
              <li>We will provide the user with a copy of the takedown notice</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              4. Filing a DMCA Counter-Notice
            </Typography>
            
            <Typography variant="body1" paragraph>
              If you believe your content was removed in error or as a result of misidentification, you may file a counter-notice.
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              4.1 Required Elements
            </Typography>
            <Typography variant="body1" paragraph>
              A valid DMCA counter-notice must include:
            </Typography>
            
            <Typography component="ol" sx={{ pl: 3 }}>
              <li><strong>Identification of the removed content:</strong> Description of the material that was removed and its location before removal</li>
              
              <li><strong>Contact information:</strong> Your name, address, telephone number, and email address</li>
              
              <li><strong>Consent to jurisdiction:</strong> A statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located (or the Northern District of California if outside the US)</li>
              
              <li><strong>Service of process:</strong> A statement that you will accept service of process from the person who provided the original takedown notice</li>
              
              <li><strong>Good faith statement:</strong> A statement under penalty of perjury that you have a good faith belief that the material was removed as a result of mistake or misidentification</li>
              
              <li><strong>Signature:</strong> Your physical or electronic signature</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              4.2 Counter-Notice Process
            </Typography>
            <Typography variant="body1" paragraph>
              Upon receipt of a valid counter-notice:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>We will provide a copy to the original complainant</li>
              <li>We will inform them that we will restore the content in 10-14 business days</li>
              <li>We will restore the content unless the complainant files a court action seeking an injunction</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              5. Repeat Infringer Policy
            </Typography>
            
            <Typography variant="body1" paragraph>
              VidZyme has adopted a policy of terminating accounts of users who are repeat infringers in appropriate circumstances.
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              5.1 Three-Strike Policy
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>First Strike:</strong> Warning and content removal</li>
              <li><strong>Second Strike:</strong> Temporary account suspension (7-30 days)</li>
              <li><strong>Third Strike:</strong> Permanent account termination</li>
            </Typography>
            
            <Typography variant="body1" paragraph>
              Strikes may be removed after 6 months of good standing, and we consider successful counter-notices when evaluating repeat infringer status.
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              5.2 Factors Considered
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Number and frequency of infringement claims</li>
              <li>Whether counter-notices were filed and successful</li>
              <li>Severity and nature of the infringement</li>
              <li>User's response to takedown notices</li>
              <li>Evidence of willful infringement</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              6. Safe Harbor Compliance
            </Typography>
            
            <Typography variant="body1" paragraph>
              VidZyme qualifies for safe harbor protection under the DMCA by:
            </Typography>
            
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Designating an agent to receive infringement notifications</li>
              <li>Implementing a repeat infringer policy</li>
              <li>Not having actual knowledge of infringing activity</li>
              <li>Not receiving financial benefit directly attributable to infringing activity</li>
              <li>Responding expeditiously to remove infringing content upon notification</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              7. Misrepresentation and Penalties
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> Making false claims in a DMCA notice or counter-notice may result in legal liability.
              </Typography>
            </Alert>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              7.1 False DMCA Claims
            </Typography>
            <Typography variant="body1" paragraph>
              Under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material is infringing may be liable for damages, including:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Attorney's fees and costs</li>
              <li>Damages suffered by the alleged infringer</li>
              <li>Damages suffered by the service provider</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              7.2 Abuse Prevention
            </Typography>
            <Typography variant="body1" paragraph>
              To prevent abuse of the DMCA process:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>We may require additional verification for repeat complainants</li>
              <li>We reserve the right to ignore notices that appear to be automated or frivolous</li>
              <li>We may report suspected abuse to appropriate authorities</li>
              <li>We may terminate accounts that repeatedly file false claims</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              8. Content Identification and Prevention
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              8.1 Proactive Measures
            </Typography>
            <Typography variant="body1" paragraph>
              VidZyme employs various technologies to prevent copyright infringement:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Content ID Systems:</strong> Automated detection of copyrighted material</li>
              <li><strong>Hash Matching:</strong> Identification of known infringing content</li>
              <li><strong>Audio Fingerprinting:</strong> Detection of copyrighted music and audio</li>
              <li><strong>Image Recognition:</strong> Identification of copyrighted images and artwork</li>
              <li><strong>Text Analysis:</strong> Detection of copyrighted text and scripts</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              8.2 User Education
            </Typography>
            <Typography variant="body1" paragraph>
              We provide resources to help users understand copyright:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Copyright education materials</li>
              <li>Fair use guidelines</li>
              <li>Public domain resources</li>
              <li>Licensed content libraries</li>
              <li>Attribution requirements</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              9. International Copyright
            </Typography>
            
            <Typography variant="body1" paragraph>
              VidZyme respects international copyright laws and treaties:
            </Typography>
            
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Berne Convention:</strong> Recognition of international copyright protection</li>
              <li><strong>WIPO Treaties:</strong> Compliance with World Intellectual Property Organization standards</li>
              <li><strong>Local Laws:</strong> Respect for copyright laws in users' jurisdictions</li>
              <li><strong>Cross-Border Enforcement:</strong> Cooperation with international enforcement efforts</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              10. Transparency Reporting
            </Typography>
            
            <Typography variant="body1" paragraph>
              VidZyme publishes regular transparency reports including:
            </Typography>
            
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Number of DMCA takedown notices received</li>
              <li>Number of counter-notices filed</li>
              <li>Content removal statistics</li>
              <li>Account termination data</li>
              <li>Response time metrics</li>
            </Typography>
            
            <Typography variant="body1" paragraph>
              These reports are available on our website and updated quarterly.
            </Typography>
          </section>

          <Divider sx={{ my: 4 }} />

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              11. Contact Information
            </Typography>
            
            <Typography variant="body1" paragraph>
              For DMCA-related inquiries:
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'grey.50' }}>
              <Typography variant="body1">
                <strong>DMCA Copyright Agent</strong><br />
                Email: dmca@vidzyme.com<br />
                Phone: [Your Phone Number]<br />
                Address: VidZyme, Inc.<br />
                Attn: Copyright Agent<br />
                [Your Business Address]<br />
                [City, State, ZIP Code]
              </Typography>
            </Paper>
            
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              For general inquiries: support@vidzyme.com<br />
              For legal matters: legal@vidzyme.com
            </Typography>
          </section>

          <Alert severity="info" sx={{ mt: 4 }}>
            <Typography variant="body2">
              <strong>Note:</strong> This DMCA policy is part of our Terms of Service. 
              By using VidZyme's services, you agree to comply with this policy and respect the intellectual property rights of others.
            </Typography>
          </Alert>
        </Box>
      </Paper>
    </Container>
  );
};

export default DMCAPolicy;