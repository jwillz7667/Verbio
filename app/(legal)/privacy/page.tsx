export const metadata = {
  title: 'Privacy Policy | Verbio',
  description: 'How Verbio collects, uses, and protects your data.'
};

export default function PrivacyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 prose prose-invert">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h2>Overview</h2>
      <p>
        This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you
        use Verbio’s web application and services.
      </p>
      <h2>Information We Collect</h2>
      <ul>
        <li>Account: email and basic profile metadata via Supabase Auth.</li>
        <li>Usage: translation requests, timestamps, client metrics for reliability.</li>
        <li>Audio: microphone streams processed transiently for realtime translation; not stored unless you enable history.</li>
      </ul>
      <h2>How We Use Information</h2>
      <ul>
        <li>Provide and improve translation services and voice output.</li>
        <li>Protect against abuse, fraud, and misuse (rate limiting, anomaly detection).</li>
        <li>Compliance and safety obligations.</li>
      </ul>
      <h2>Data Sharing</h2>
      <p>
        We share data with processors essential to the service (e.g., OpenAI for model inference, Supabase for auth & storage).
        We do not sell personal data.
      </p>
      <h2>Retention</h2>
      <p>
        Audio is processed ephemerally for realtime mode. Optional conversation history is retained only if enabled by you,
        and can be deleted from your profile. Aggregated metrics are retained for service reliability.
      </p>
      <h2>Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may request access, correction, deletion, or portability of your personal data.
        Contact support to exercise these rights.
      </p>
      <h2>Contact</h2>
      <p>Email: privacy@verbio.app</p>
    </main>
  );
}


