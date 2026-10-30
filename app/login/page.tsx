import AuthForm from '@/components/AuthForm';

export default function Login() {
  return (
    <div className="mx-auto mt-4 max-w-md">
      <h1 className="text-3xl font-extrabold text-velvet">Log in</h1>
      <p className="mt-2 text-muted">Log in to go to Welcome browse homes, then My homes.</p>
      <div className="mt-5"><AuthForm mode="login" /></div>
    </div>
  );
}
