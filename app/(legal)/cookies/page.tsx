export const metadata = {
  title: 'Cookie Policy | Verbio',
  description: 'How Verbio uses cookies and similar technologies.'
};

export default function CookiesPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 prose prose-invert">
      <h1>Cookie Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>
        We use strictly necessary cookies for authentication and security, and minimal analytics in compliance with privacy standards.
      </p>
      <h2>Types of Cookies</h2>
      <ul>
        <li>Essential: session and CSRF tokens.</li>
        <li>Preferences: theme (light/dark).</li>
        <li>Analytics (optional): page views and performance (Plausible/PostHog).</li>
      </ul>
      <h2>Managing Cookies</h2>
      <p>You can control cookies via your browser settings. Disabling essential cookies may impact functionality.</p>
      <h2>Contact</h2>
      <p>Email: privacy@verbio.app</p>
    </main>
  );
}


