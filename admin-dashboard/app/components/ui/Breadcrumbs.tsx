import { Link } from 'react-router';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/dashboard"
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <HomeIcon className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRightIcon className="h-5 w-5 text-gray-400 mx-2" />
              {item.href ? (
                <Link
                  to={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm font-medium text-gray-900" aria-current="page">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

