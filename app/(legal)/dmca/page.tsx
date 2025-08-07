export const metadata = {
  title: 'DMCA Policy | Verbio',
  description: 'How to submit copyright infringement notices.'
};

export default function DMCAPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 prose prose-invert">
      <h1>DMCA Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>
        If you believe content accessible through the Service infringes your copyright, please submit a notice containing:
      </p>
      <ul>
        <li>Your contact information.</li>
        <li>Identification of the copyrighted work and the infringing material.</li>
        <li>A statement of good-faith belief and accuracy under penalty of perjury.</li>
        <li>Your or your agent’s signature.</li>
      </ul>
      <p>Email: dmca@verbio.app</p>
    </main>
  );
}


