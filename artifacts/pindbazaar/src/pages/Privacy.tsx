import React from 'react';

export default function Privacy() {
  return (
    <div className="flex-1 bg-background py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg prose-emerald max-w-none text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-foreground font-serif">1. Introduction</h2>
          <p>
            Welcome to PindBazaar. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
          </p>

          <h2 className="text-foreground font-serif">2. The Data We Collect</h2>
          <p>
            When you place an order via Cash on Delivery, we collect the following information:
          </p>
          <ul>
            <li>Identity Data: First name, last name.</li>
            <li>Contact Data: Delivery address, email address, and telephone numbers.</li>
            <li>Transaction Data: Details about products you have purchased from us.</li>
          </ul>
          <p>We do not collect or store any credit card or banking information as we operate purely on a Cash on Delivery model.</p>

          <h2 className="text-foreground font-serif">3. How We Use Your Data</h2>
          <p>We will only use your personal data for the following purposes:</p>
          <ul>
            <li>To process and deliver your order.</li>
            <li>To manage our relationship with you (e.g., notifying you of order status via phone or WhatsApp).</li>
            <li>To improve our website, products/services, marketing, and customer experiences.</li>
          </ul>

          <h2 className="text-foreground font-serif">4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.
          </p>

          <h2 className="text-foreground font-serif">5. Your Legal Rights</h2>
          <p>
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, or erasure of your personal data.
          </p>

          <h2 className="text-foreground font-serif">Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us via the details provided on our Contact Us page.
          </p>
        </div>
      </div>
    </div>
  );
}
