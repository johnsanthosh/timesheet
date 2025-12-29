import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTimezoneAbbreviation } from '../utils/timezone';

interface HeaderProps {
  logo?: string;
}

export function Header({ logo }: HeaderProps) {
  const { appUser, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-700 text-white'
        : 'text-blue-100 hover:bg-blue-500 hover:text-white'
    }`;

  return (
    <header className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {logo ? (
              <img className="h-8 w-auto" src={logo} alt="Logo" />
            ) : (
              <span className="text-white text-xl font-bold">Timesheet</span>
            )}
            <nav className="ml-10 flex items-baseline space-x-4">
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                My Timesheet
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className={navLinkClass('/admin')}
                  >
                    All Timesheets
                  </Link>
                  <Link
                    to="/users"
                    className={navLinkClass('/users')}
                  >
                    Users
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-blue-100 text-sm">
              {getTimezoneAbbreviation()}
            </span>
            <span className="text-white text-sm">
              {appUser?.displayName || appUser?.email}
            </span>
            <span className="text-blue-200 text-xs px-2 py-1 bg-blue-700 rounded">
              {appUser?.role}
            </span>
            <button
              onClick={logout}
              className="text-blue-100 hover:text-white text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
