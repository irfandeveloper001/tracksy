import { useLocation } from 'react-router';
import Breadcrumbs from '../ui/Breadcrumbs';

export default function BreadcrumbWrapper() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const items = pathnames.map((value, index) => {
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
    const label = value
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      label,
      href: index < pathnames.length - 1 ? to : undefined,
    };
  });

  // Don't show breadcrumbs on dashboard
  if (location.pathname === '/dashboard' || location.pathname === '/') {
    return null;
  }

  return (
    <div className="mb-4">
      <Breadcrumbs items={items} />
    </div>
  );
}

