export default function About() {
  return (
    <div className="max-w-3xl">
      <h1 className="mt-4 text-3xl font-extrabold text-velvet">About HOUZQORA</h1>
      <p className="mt-3 text-muted">HOUZQORA is a rental and property inspection platform for the Netherlands. We list available homes, make the inspection fee clear before you pay, and keep the next steps simple after payment.</p>
      <p className="mt-3 text-muted">We do not claim certifications or affiliations that are not in place. If a claim is not verified, it is not shown here.</p>
      <h2 className="mt-6 text-xl font-extrabold text-velvet">What we aim to do well</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
        <li>Show the full price picture before payment: rent, inspection fee, and securing amount.</li>
        <li>Keep inspection and reservation as two separate things.</li>
        <li>Give signed in visitors a streamlined view of only their homes.</li>
      </ul>
    </div>
  );
}
