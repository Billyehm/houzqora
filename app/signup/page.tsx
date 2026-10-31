import AuthForm from '@/components/AuthForm';

export default function Signup() {
  return (
    <div className="mx-auto mt-4 max-w-md">
      <h1 className="text-3xl font-extrabold text-velvet">Sign up to book</h1>
      <p className="mt-2 text-muted">Create your account, then you will go to Dashboard.</p>
      <div className="mt-5"><AuthForm mode="signup" /></div>
    </div>
  );
}
