import React, { useEffect } from 'react';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy - UBC | United Brothers Company';
  }, []);

  return (
    <main className="privacy-policy-page">
      <div className="container">
        <div className="privacy-policy-content">
          <span className="tag">
            <span className="privacy-tag-star">★</span>
            <span className="privacy-tag-text">PRIVACY POLICY</span>
          </span>
          
          <h1 className="privacy-policy-heading">Privacy Policy</h1>
          <p className="privacy-policy-subtitle">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="privacy-policy-text">
            <section className="privacy-section">
              <h2>1. Introduction</h2>
              <p>
                United Brothers Company ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website and use our services.
              </p>
            </section>

            <section className="privacy-section">
              <h2>2. Information We Collect</h2>
              <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
              <ul>
                <li><strong>Personal Data:</strong> Name, email address, phone number, postal address, and other contact information you provide when contacting us or using our services.</li>
                <li><strong>Usage Data:</strong> Information about how you access and use our website, including your IP address, browser type, pages visited, and time spent on pages.</li>
                <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies to track activity on our website and store certain information.</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>3. How We Use Your Information</h2>
              <p>We use the information we collect for various purposes, including:</p>
              <ul>
                <li>To provide, maintain, and improve our services</li>
                <li>To respond to your inquiries, comments, and requests</li>
                <li>To send you marketing communications (with your consent)</li>
                <li>To analyze usage patterns and improve user experience</li>
                <li>To comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>4. Information Sharing and Disclosure</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              <ul>
                <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf, such as hosting, analytics, and customer service.</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid requests by public authorities.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over 
                the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="privacy-section">
              <h2>6. Your Rights</h2>
              <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
              <ul>
                <li>The right to access and receive a copy of your personal data</li>
                <li>The right to rectify inaccurate or incomplete data</li>
                <li>The right to request deletion of your personal data</li>
                <li>The right to object to processing of your personal data</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent at any time</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>7. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our website and hold certain information. 
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you 
                do not accept cookies, you may not be able to use some portions of our website.
              </p>
            </section>

            <section className="privacy-section">
              <h2>8. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or 
                content of these external sites. We encourage you to review the privacy policies of any third-party sites 
                you visit.
              </p>
            </section>

            <section className="privacy-section">
              <h2>9. Children's Privacy</h2>
              <p>
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information 
                from children. If you become aware that a child has provided us with personal information, please contact us, 
                and we will take steps to delete such information.
              </p>
            </section>

            <section className="privacy-section">
              <h2>10. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy 
                periodically for any changes.
              </p>
            </section>

            <section className="privacy-section">
              <h2>11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="privacy-contact-info">
                <p><strong>Email:</strong> marketing@soilkingfoods.com</p>
                <p><strong>Phone:</strong> +91 8143150953 | 04023399533</p>
                <p><strong>Address:</strong> H.No. 8-2-334/60 & 61, Road No. 5, Banjara Hills, Hyderabad-500034, Telangana.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

