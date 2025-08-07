export const metadata = {
  title: 'Terms of Service | Verbio',
  description: 'The terms and conditions for using Verbio.'
};

export default function TermsPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 prose prose-invert">
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h2>Agreement</h2>
      <p>
        By accessing or using Verbio, you agree to be bound by these Terms. If you do not agree, do not use the Service.
      </p>
      <h2>Use of Service</h2>
      <ul>
        <li>You must comply with applicable laws and our Acceptable Use Policy.</li>
        <li>You are responsible for the content you input and the outputs you choose to rely on.</li>
        <li>Verbio provides AI-generated translations without warranties; verify accuracy for critical use cases.</li>
      </ul>
      <h2>Accounts</h2>
      <p>You are responsible for securing your account and promptly notifying us of unauthorized use.</p>
      <h2>Subscription and Fees</h2>
      <p>Future paid features may require fees; separate terms will apply.</p>
      <h2>Disclaimers</h2>
      <p>The Service is provided “as is” without warranties of any kind, express or implied.</p>
      <h2>Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, Verbio shall not be liable for indirect, incidental, special, or consequential damages.</p>
      <h2>Governing Law</h2>
      <p>These Terms are governed by the laws of Minnesota, USA.</p>
      <h2>Contact</h2>
      <p>Email: legal@verbio.app</p>
    </main>
  );
}


