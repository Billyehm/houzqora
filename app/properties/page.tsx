import FilterGrid from '@/components/FilterGrid';
import { properties } from '@/lib/properties';

export default function PropertiesPage() {
  return (
    <div>
      <h1 className="mt-4 text-3xl font-extrabold text-velvet">All properties</h1>
      <p className="mt-2 text-muted">Available homes in the Netherlands. Prices are monthly rent in euros. Only available homes are shown by default in this seed set.</p>
      <div className="mt-5"><FilterGrid properties={properties} /></div>
    </div>
  );
}
