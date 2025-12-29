import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTimezoneAbbreviation } from '../utils/timezone';

export function Header() {
  const { appUser, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string, mobile = false) =>
    `${mobile ? 'block w-full px-4 py-3' : 'px-3 py-2'} rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-700 text-white'
        : 'text-blue-100 hover:bg-blue-500 hover:text-white'
    }`;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
            <img className="h-8 w-auto" src="/logo.png" alt="Timesheet" />
            <span className="text-white text-xl font-bold hidden sm:block">Timesheet</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
              My Timesheet
            </Link>
            {isAdmin && (
              <>
                <Link to="/admin" className={navLinkClass('/admin')}>
                  All Timesheets
                </Link>
                <Link to="/users" className={navLinkClass('/users')}>
                  Users
                </Link>
              </>
            )}
          </nav>

          {/* Desktop User Info */}
          <div className="hidden md:flex items-center space-x-3">
            <span className="text-blue-200 text-xs px-2 py-1 bg-blue-800/50 rounded">
              {getTimezoneAbbreviation()}
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                {(appUser?.displayName || appUser?.email || '?')[0].toUpperCase()}
              </div>
              <div className="hidden lg:block">
                <p className="text-white text-sm font-medium leading-tight">
                  {appUser?.displayName || appUser?.email}
                </p>
                <p className="text-blue-200 text-xs capitalize">{appUser?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="ml-2 px-3 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-500 rounded-md"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-500"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 space-y-1 bg-blue-700/50 border-t border-blue-500/30">
          {/* Mobile User Info */}
          <div className="flex items-center space-x-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {(appUser?.displayName || appUser?.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">
                {appUser?.displayName || appUser?.email}
              </p>
              <p className="text-blue-200 text-sm capitalize">{appUser?.role} &middot; {getTimezoneAbbreviation()}</p>
            </div>
          </div>

          {/* Mobile Nav Links */}
          <Link
            to="/dashboard"
            className={navLinkClass('/dashboard', true)}
            onClick={closeMobileMenu}
          >
            My Timesheet
          </Link>
          {isAdmin && (
            <>
              <Link
                to="/admin"
                className={navLinkClass('/admin', true)}
                onClick={closeMobileMenu}
              >
                All Timesheets
              </Link>
              <Link
                to="/users"
                className={navLinkClass('/users', true)}
                onClick={closeMobileMenu}
              >
                Users
              </Link>
            </>
          )}

          {/* Mobile Logout */}
          <button
            onClick={() => {
              closeMobileMenu();
              logout();
            }}
            className="block w-full text-left px-4 py-3 text-sm font-medium text-red-200 hover:bg-red-500/20 rounded-md mt-2"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
