import React from 'react';
import { Container, Typography, Box, Paper, Alert } from '@mui/material';

const AcceptableUsePolicy = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Acceptable Use Policy
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Last Updated: {new Date().toLocaleDateString()}
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          This Acceptable Use Policy governs your use of VidZyme's AI-powered video generation services. 
          By using our platform, you agree to comply with these guidelines.
        </Alert>

        <Box sx={{ '& > *': { mb: 3 } }}>
          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              1. Purpose and Scope
            </Typography>
            <Typography variant="body1" paragraph>
              This Acceptable Use Policy ("AUP") defines the acceptable and prohibited uses of VidZyme's services, 
              including our AI video generation platform, website, and related services. This policy applies to all 
              users, including free and paid subscribers.
            </Typography>
            <Typography variant="body1" paragraph>
              VidZyme reserves the right to investigate violations of this policy and take appropriate action, 
              including suspension or termination of accounts.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              2. Acceptable Uses
            </Typography>
            <Typography variant="body1" paragraph>
              You may use VidZyme's services for legitimate purposes, including:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Creative Content:</strong> Educational videos, marketing materials, presentations, and artistic projects</li>
              <li><strong>Business Applications:</strong> Product demonstrations, training materials, and promotional content</li>
              <li><strong>Personal Projects:</strong> Social media content, personal storytelling, and hobby projects</li>
              <li><strong>Educational Content:</strong> Learning materials, tutorials, and academic presentations</li>
              <li><strong>Entertainment:</strong> Creative storytelling, animations, and artistic expressions</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              3. Prohibited Content and Activities
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              3.1 Illegal Content
            </Typography>
            <Typography variant="body1" paragraph>
              You may not create, upload, or generate content that:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Violates any applicable laws or regulations</li>
              <li>Infringes on intellectual property rights of others</li>
              <li>Contains or promotes illegal activities</li>
              <li>Facilitates fraud, scams, or deceptive practices</li>
              <li>Violates export control or sanctions laws</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              3.2 Harmful and Dangerous Content
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Violence:</strong> Content depicting, promoting, or instructing violence against people or animals</li>
              <li><strong>Self-Harm:</strong> Content promoting suicide, self-injury, or eating disorders</li>
              <li><strong>Dangerous Activities:</strong> Instructions for creating weapons, explosives, or dangerous substances</li>
              <li><strong>Terrorism:</strong> Content supporting or promoting terrorist organizations or activities</li>
              <li><strong>Extremism:</strong> Content promoting violent extremism or hate groups</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              3.3 Harassment and Abuse
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Harassment:</strong> Content targeting individuals with abuse, threats, or intimidation</li>
              <li><strong>Bullying:</strong> Content intended to humiliate, shame, or harm others</li>
              <li><strong>Doxxing:</strong> Sharing private personal information without consent</li>
              <li><strong>Stalking:</strong> Content used to track, monitor, or harass individuals</li>
              <li><strong>Hate Speech:</strong> Content promoting hatred based on race, religion, gender, sexuality, or other protected characteristics</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              3.4 Sexual and Adult Content
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Explicit Sexual Content:</strong> Pornographic or sexually explicit material</li>
              <li><strong>Non-Consensual Content:</strong> Intimate images shared without consent</li>
              <li><strong>Child Safety:</strong> Any content sexualizing or exploiting minors</li>
              <li><strong>Sexual Services:</strong> Content advertising or facilitating prostitution or escort services</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              3.5 Misinformation and Deepfakes
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Deepfakes:</strong> Creating realistic but false videos of real people without consent</li>
              <li><strong>Medical Misinformation:</strong> False health information that could cause harm</li>
              <li><strong>Election Interference:</strong> False information about voting processes or election results</li>
              <li><strong>Conspiracy Theories:</strong> Promoting harmful conspiracy theories or false information</li>
              <li><strong>Impersonation:</strong> Creating content that falsely represents others</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              3.6 Spam and Abuse
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Spam:</strong> Excessive, repetitive, or unsolicited content</li>
              <li><strong>Malware:</strong> Content containing or linking to malicious software</li>
              <li><strong>Phishing:</strong> Attempts to steal personal information or credentials</li>
              <li><strong>System Abuse:</strong> Attempting to circumvent platform limitations or security measures</li>
              <li><strong>Resource Abuse:</strong> Excessive use that degrades service for other users</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              4. Content Moderation
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              4.1 Automated Detection
            </Typography>
            <Typography variant="body1" paragraph>
              VidZyme employs automated systems to detect potentially violating content, including:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>AI-powered content analysis for text, images, and video</li>
              <li>Hash-based detection of known violating content</li>
              <li>Pattern recognition for spam and abuse</li>
              <li>Real-time monitoring of generation requests</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              4.2 Human Review
            </Typography>
            <Typography variant="body1" paragraph>
              Our content moderation team reviews:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Flagged content from automated systems</li>
              <li>User reports of policy violations</li>
              <li>Appeals from content removal decisions</li>
              <li>Edge cases requiring human judgment</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              4.3 User Reporting
            </Typography>
            <Typography variant="body1" paragraph>
              Users can report violations through:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>In-platform reporting tools</li>
              <li>Email to abuse@vidzyme.com</li>
              <li>Contact forms on our website</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              5. Enforcement Actions
            </Typography>
            
            <Typography variant="body1" paragraph>
              Violations of this policy may result in the following actions:
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              5.1 Content Removal
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Immediate removal of violating content</li>
              <li>Prevention of content distribution</li>
              <li>Blocking of similar content generation attempts</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              5.2 Account Restrictions
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Warning:</strong> Notification of policy violation</li>
              <li><strong>Temporary Suspension:</strong> Limited access for a specified period</li>
              <li><strong>Feature Restrictions:</strong> Removal of specific platform features</li>
              <li><strong>Generation Limits:</strong> Reduced content creation capabilities</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              5.3 Account Termination
            </Typography>
            <Typography variant="body1" paragraph>
              Severe or repeated violations may result in:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Permanent account suspension</li>
              <li>Deletion of all user content</li>
              <li>Forfeiture of paid subscriptions</li>
              <li>IP address or device blocking</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              6. Appeals Process
            </Typography>
            
            <Typography variant="body1" paragraph>
              If you believe your content was incorrectly removed or your account was wrongly restricted:
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              6.1 Filing an Appeal
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Submit appeals through our support system</li>
              <li>Provide detailed explanation of why the action was incorrect</li>
              <li>Include relevant evidence or context</li>
              <li>Appeals must be filed within 30 days of the action</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              6.2 Review Process
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Appeals are reviewed by a different team member</li>
              <li>Review typically completed within 5-7 business days</li>
              <li>You will receive notification of the decision</li>
              <li>Decisions may include content restoration or account reinstatement</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              7. Technical Restrictions
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              7.1 Usage Limits
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Rate Limits:</strong> Maximum number of generation requests per time period</li>
              <li><strong>Content Length:</strong> Restrictions on video duration and file size</li>
              <li><strong>Concurrent Requests:</strong> Limits on simultaneous processing</li>
              <li><strong>Storage Limits:</strong> Maximum storage space for generated content</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              7.2 Prohibited Technical Activities
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Attempting to reverse engineer our AI models</li>
              <li>Using automated tools to exceed usage limits</li>
              <li>Attempting to access unauthorized areas of the platform</li>
              <li>Interfering with the platform's security measures</li>
              <li>Creating multiple accounts to circumvent restrictions</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              8. Intellectual Property Compliance
            </Typography>
            
            <Typography variant="body1" paragraph>
              Users must respect intellectual property rights:
            </Typography>
            
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>Copyright:</strong> Do not use copyrighted material without permission</li>
              <li><strong>Trademarks:</strong> Avoid unauthorized use of trademarks or brand names</li>
              <li><strong>Likeness Rights:</strong> Do not create content using someone's likeness without consent</li>
              <li><strong>Fair Use:</strong> Understand and comply with fair use limitations</li>
              <li><strong>Attribution:</strong> Provide proper attribution when required</li>
            </Typography>
            
            <Typography variant="body1" paragraph>
              For copyright infringement claims, please see our DMCA Policy.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              9. Reporting Violations
            </Typography>
            
            <Typography variant="body1" paragraph>
              Help us maintain a safe platform by reporting violations:
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              9.1 How to Report
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li><strong>In-Platform:</strong> Use the report button on content</li>
              <li><strong>Email:</strong> Send details to abuse@vidzyme.com</li>
              <li><strong>Emergency:</strong> For immediate safety concerns, contact local authorities first</li>
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
              9.2 Information to Include
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>URL or identifier of the violating content</li>
              <li>Description of the policy violation</li>
              <li>Your relationship to the content (if applicable)</li>
              <li>Any supporting evidence or documentation</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              10. Policy Updates
            </Typography>
            
            <Typography variant="body1" paragraph>
              This Acceptable Use Policy may be updated to address new challenges and technologies:
            </Typography>
            
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Updates will be posted on our website</li>
              <li>Significant changes will be communicated via email</li>
              <li>Continued use constitutes acceptance of updates</li>
              <li>Users are responsible for staying informed of policy changes</li>
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              11. Contact Information
            </Typography>
            
            <Typography variant="body1" paragraph>
              For questions about this Acceptable Use Policy:
            </Typography>
            
            <Typography variant="body1">
              <strong>General Inquiries:</strong> support@vidzyme.com<br />
              <strong>Policy Violations:</strong> abuse@vidzyme.com<br />
              <strong>Legal Matters:</strong> legal@vidzyme.com<br />
              <strong>Appeals:</strong> appeals@vidzyme.com
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              <strong>Mailing Address:</strong><br />
              VidZyme Inc.<br />
              [Your Business Address]<br />
              [City, State, ZIP Code]
            </Typography>
          </section>

          <Alert severity="warning" sx={{ mt: 4 }}>
            <Typography variant="body2">
              <strong>Important:</strong> This policy is part of our Terms of Service. 
              Violations may result in account suspension or termination. 
              When in doubt about whether content complies with this policy, please contact our support team.
            </Typography>
          </Alert>
        </Box>
      </Paper>
    </Container>
  );
};

export default AcceptableUsePolicy;