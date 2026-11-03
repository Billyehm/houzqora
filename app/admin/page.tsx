import AdminLoginForm from '@/components/AdminLoginForm';
import AdminPanel from '@/components/AdminPanel';
import { isAdmin } from '@/lib/admin-auth';
import { fetchProperties } from '@/lib/queries';

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <AdminLoginForm />;
  }
  const properties = await fetchProperties();
  return <AdminPanel initialProperties={properties} />;
}
