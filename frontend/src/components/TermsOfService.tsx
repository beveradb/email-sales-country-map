import './LegalPages.css'

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <img src="/logo.svg" alt="Email Sales Map Logo" className="legal-logo" />
          <div>
            <h1>Terms of Service</h1>
            <p className="last-updated">Last updated: August 17, 2025</p>
          </div>
        </div>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Email Sales Map ("the Service"), you accept and agree to be bound by the terms 
            and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            Email Sales Map is a data visualization tool that:
          </p>
          <ul>
            <li>Authenticates users through Google OAuth</li>
            <li>Reads emails matching your configured criteria in your Gmail account</li>
            <li>Extracts country information from sales notification emails</li>
            <li>Displays aggregated sales data on an interactive world map</li>
          </ul>
        </section>

        <section>
          <h2>3. User Accounts and Authentication</h2>
          <ul>
            <li>You must have a valid Google account to use this service</li>
            <li>You are responsible for maintaining the security of your Google account</li>
            <li>You grant us permission to access your Gmail with read-only privileges</li>
            <li>You may revoke access at any time through your Google Account settings</li>
          </ul>
        </section>

        <section>
          <h2>4. Permitted Use</h2>
          <p>You may use Email Sales Map to:</p>
          <ul>
            <li>Visualize your own sales data from any supported platform</li>
            <li>View aggregated country statistics from your sales</li>
            <li>Export or share anonymized visualizations</li>
          </ul>
        </section>

        <section>
          <h2>5. Prohibited Use</h2>
          <p>You may not:</p>
          <ul>
            <li>Use the service for any illegal or unauthorized purpose</li>
            <li>Attempt to gain unauthorized access to other users' data</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Use automated tools to access the service without permission</li>
            <li>Reverse engineer or attempt to extract the source code</li>
          </ul>
        </section>

        <section>
          <h2>6. Data and Privacy</h2>
          <p>
            Your use of Email Sales Map is also governed by our Privacy Policy. By using the service, 
            you consent to the collection and use of information as outlined in our Privacy Policy.
          </p>
        </section>

        <section>
          <h2>7. Intellectual Property</h2>
          <p>
            The Email Sales Map application, including its design, code, and functionality, is owned by 
            the developer. You are granted a limited, non-exclusive license to use the service.
          </p>
        </section>

        <section>
          <h2>8. Service Availability</h2>
          <ul>
            <li>We strive to maintain high availability but do not guarantee uninterrupted service</li>
            <li>We may temporarily suspend the service for maintenance or updates</li>
            <li>We reserve the right to modify or discontinue the service with reasonable notice</li>
          </ul>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>
            Email Sales Map is provided "as is" without warranties of any kind. We are not liable for:
          </p>
          <ul>
            <li>Any direct, indirect, incidental, or consequential damages</li>
            <li>Loss of data or interruption of service</li>
            <li>Any damages resulting from unauthorized access to your account</li>
            <li>Inaccuracies in data visualization or country mapping</li>
          </ul>
        </section>

        <section>
          <h2>10. Google API Compliance</h2>
          <p>
            This service uses Google APIs and complies with Google's API Services User Data Policy. 
            By using Email Sales Map, you acknowledge that your use is subject to Google's terms and policies.
          </p>
        </section>

        <section>
          <h2>11. Data Accuracy</h2>
          <p>
            While we strive for accuracy, we cannot guarantee that:
          </p>
          <ul>
            <li>All sales emails will be correctly parsed</li>
            <li>Country information extracted from emails is completely accurate</li>
            <li>The world map visualization is error-free</li>
          </ul>
        </section>

        <section>
          <h2>12. Termination</h2>
          <p>
            Either party may terminate access to the service at any time. Upon termination:
          </p>
          <ul>
            <li>Your access to the service will be immediately revoked</li>
            <li>Any cached data will be automatically purged according to our retention policy</li>
            <li>You may revoke Gmail access through your Google Account settings</li>
          </ul>
        </section>

        <section>
          <h2>13. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Material changes will be 
            communicated by updating the "Last updated" date. Continued use of the service 
            constitutes acceptance of the modified terms.
          </p>
        </section>

        <section>
          <h2>14. Governing Law</h2>
          <p>
            These terms are governed by the laws of the United Kingdom. Any disputes will be 
            resolved in the appropriate courts of the United Kingdom.
          </p>
        </section>

        <section>
          <h2>15. Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact:
            <br />
            Email: andrew.d.beveridge@gmail.com
          </p>
        </section>

        <div className="legal-footer">
          <a href="/">← Back to Email Sales Map</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
    </div>
  )
}
