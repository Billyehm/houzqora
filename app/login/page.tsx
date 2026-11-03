import AuthForm from '@/components/AuthForm';

export default function Login({ searchParams }: { searchParams?: { email?: string } }) {
  // After email confirmation Supabase lands here with ?email=, so
  // the email box is already filled and only the password is left.
  const initialEmail = typeof searchParams?.email === 'string' ? searchParams.email : undefined;
  return (
    <div className="mx-auto mt-4 max-w-md">
      <h1 className="text-3xl font-extrabold text-velvet">Log in</h1>
      <p className="mt-2 text-muted">Log in to go to Dashboard.</p>
      <div className="mt-5"><AuthForm mode="login" initialEmail={initialEmail} /></div>
    </div>
  );
}
