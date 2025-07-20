
import React, { useState, useEffect, forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';


const Header = forwardRef((props, ref) => {
  const { user, userRole, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);



  // Helper function to get dashboard link based on user role
  const getDashboardLink = () => {
    switch (userRole) {
      case "admin":
      case "super_admin":
        return { path: "/dashboard", label: "Admin Dashboard" };
      case "teacher":
        return { path: "/teacher", label: "Your Dashboard" };
      case "student":
        return { path: "/student", label: "Your Portal" };
      default:
        return null;
    }
  };

  const dashboardLink = getDashboardLink();
  const navigate = useNavigate();


  // Handle scroll effect to change header style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    navigate('/')
  };

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const toggleUserMenu = () => setIsUserMenuOpen(prev => !prev);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header
      ref={ref} // Add the ref here
      className={`
        fixed top-0 left-0 right-0 z-[9999]
        transition-all duration-200 ease-in-out
        ${isScrolled ? 'bg-green-800/95 backdrop-blur-md shadow-lg py-2' : 'bg-green-800 py-3'}
        text-white
      `}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo and School Name */}
          <div className="flex items-center space-x-3">
            {/* School Logo */}
            <div className="bg-white/10 p-2 rounded-lg hidden min-[350px]:block" aria-label="Greenfield Secondary School Logo" role="img">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <Link to="/" className="flex flex-col">
              <h1
                className={`font-bold transition-all duration-300 select-none ${
                  isScrolled ? 'text-lg' : 'text-xl'
                } hover:text-green-200`}
              >
                Greenfield College
              </h1>
            </Link>
          </div>

          {/* Main Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8" aria-label="Primary Navigation">
            <Link
              to="/about"
              className="hover:text-green-200 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 rounded px-2 py-1"
            >
              About Us
            </Link>
            <Link
              to="/academics"
              className="hover:text-green-200 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 rounded px-2 py-1"
            >
              Academics
            </Link>
            <Link
              to="/admissions"
              className="hover:text-green-200 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 rounded px-2 py-1"
            >
              Admissions
            </Link>
            <Link
              to="/news"
              className="hover:text-green-200 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 rounded px-2 py-1"
            >
              News & Events
            </Link>
            <Link
              to="/contact"
              className="hover:text-green-200 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 rounded px-2 py-1"
            >
              Contact
            </Link>
          </nav>

          {/* Primary CTAs */}
          <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-4">
            {/* Apply Now Button - Always Visible */}
            <Link
              to="/apply"
              className="bg-yellow-500 hover:bg-yellow-600 text-green-900 px-2 xs:px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-lg text-sm sm:text-base"
            >
              Apply Now
            </Link>

            {/* User Section */}
            {user ? (
              <div className="flex items-center space-x-2">
              

                <div className="relative user-menu-container">
                {/* User Menu Button */}
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-medium">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block font-medium">
                    {user.name || 'User'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    {dashboardLink && (
                      <Link
                        to={dashboardLink.path}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {dashboardLink.label}
                      </Link>
                    )}
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-white/10 hover:bg-white/20 text-white px-2 xs:px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav
            className="lg:hidden mt-4 pb-4 border-t border-white/20"
            aria-label="Mobile Navigation"
          >
            <div className="flex flex-col space-y-3 pt-4">
              {/* Main Navigation Links - Mobile */}
              <Link
                to="/about"
                className="block py-2 hover:text-green-200 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/academics"
                className="block py-2 hover:text-green-200 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Academics
              </Link>
              <Link
                to="/admissions"
                className="block py-2 hover:text-green-200 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Admissions
              </Link>
              <Link
                to="/news"
                className="block py-2 hover:text-green-200 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                News & Events
              </Link>
              <Link
                to="/contact"
                className="block py-2 hover:text-green-200 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {/* User Menu Items - Mobile (if logged in) */}
              {user && (
                <>
                  <div className="border-t border-white/20 my-3 pt-3">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-medium">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{user.name || 'User'}</div>
                        <div className="text-green-200 text-xs">{user.email}</div>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block py-2 hover:text-green-200 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    {dashboardLink && (
                      <Link
                        to={dashboardLink.path}
                        className="block py-2 hover:text-green-200 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 rounded"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {dashboardLink.label}
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left py-2 hover:text-green-200 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 rounded"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
