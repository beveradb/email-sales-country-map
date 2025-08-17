import './LegalPages.css'

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: August 17, 2025</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>
            Email Sales Map ("we," "our," or "us") collects the following information when you use our service:
          </p>
          <ul>
            <li><strong>Google Account Information:</strong> Your email address and basic profile information through Google OAuth</li>
            <li><strong>Gmail Data:</strong> We read emails from clips4sale.com with the subject "You've made a sale" to extract country information</li>
            <li><strong>Usage Data:</strong> Basic analytics about how you interact with our application</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use your information solely to:</p>
          <ul>
            <li>Authenticate you through Google OAuth</li>
            <li>Scan your Gmail for sales notification emails from clips4sale.com</li>
            <li>Extract country data from these emails</li>
            <li>Display aggregated sales data on an interactive world map</li>
            <li>Provide session management for your account</li>
          </ul>
        </section>

        <section>
          <h2>3. Data Storage and Security</h2>
          <ul>
            <li><strong>Session Data:</strong> Stored temporarily in Cloudflare KV storage for authentication</li>
            <li><strong>Cache Data:</strong> Aggregated sales counts cached for 1 hour to improve performance</li>
            <li><strong>No Email Storage:</strong> We do not store your email content - only extract and aggregate country data</li>
            <li><strong>Encryption:</strong> All data transmission is encrypted using HTTPS</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Sharing</h2>
          <p>
            We do not sell, trade, or share your personal information with third parties. Your data is used exclusively for the functionality described in this application.
          </p>
        </section>

        <section>
          <h2>5. Google API Services</h2>
          <p>
            This application uses Google APIs and is subject to Google's API Services User Data Policy, including the Limited Use requirements. We:
          </p>
          <ul>
            <li>Only request the minimum necessary Gmail permissions (gmail.readonly)</li>
            <li>Use your Gmail data solely for the stated purpose of extracting sales country data</li>
            <li>Do not store or cache your email content</li>
            <li>Comply with Google's Limited Use Policy</li>
          </ul>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <ul>
            <li><strong>Session Data:</strong> Automatically expires after 7 days</li>
            <li><strong>Cache Data:</strong> Automatically expires after 1 hour</li>
            <li><strong>Access Tokens:</strong> Refreshed as needed and not permanently stored</li>
          </ul>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Revoke access to your Gmail account at any time through your Google Account settings</li>
            <li>Request deletion of your session data by signing out</li>
            <li>Contact us with questions about your data</li>
          </ul>
        </section>

        <section>
          <h2>8. Third-Party Services</h2>
          <p>
            Our application is hosted on Cloudflare Pages and uses Cloudflare Workers for backend processing. 
            These services are governed by Cloudflare's privacy policy.
          </p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            Our service is not intended for users under 13 years of age. We do not knowingly collect 
            personal information from children under 13.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify users of any material 
            changes by updating the "Last updated" date at the top of this policy.
          </p>
        </section>

        <section>
          <h2>11. Contact Information</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            Email: andrew.d.beveridge@gmail.com
          </p>
        </section>

        <div className="legal-footer">
          <a href="/">← Back to Email Sales Map</a>
          <a href="/tos">Terms of Service</a>
        </div>
      </div>
    </div>
  )
}
