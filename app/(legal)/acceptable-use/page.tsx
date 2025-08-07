export const metadata = {
  title: 'Acceptable Use Policy | Verbio',
  description: 'Rules governing acceptable use of Verbio.'
};

export default function AcceptableUsePage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 prose prose-invert">
      <h1>Acceptable Use Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <ul>
        <li>No unlawful, abusive, or harassing behavior.</li>
        <li>No attempts to bypass security, reverse engineer, or misuse the Service.</li>
        <li>No infringement of third-party rights or privacy.</li>
      </ul>
      <h2>Enforcement</h2>
      <p>We may suspend or terminate accounts that violate this policy.</p>
    </main>
  );
}


