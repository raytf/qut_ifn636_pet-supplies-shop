import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLink = 'block px-3 py-2 rounded hover:bg-blue-700';

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-bold tracking-tight">
          🐾 Petopia Admin
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard"   className={navLink}>Dashboard</Link>
              <Link to="/products"    className={navLink}>Products</Link>
              <Link to="/categories"  className={navLink}>Categories</Link>
              <Link to="/users"       className={navLink}>Users</Link>
              <Link to="/profile"     className={navLink}>Profile</Link>
              <button
                onClick={handleLogout}
                className="ml-2 bg-red-500 px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className={navLink}>Login</Link>
              <Link to="/register" className="bg-green-500 px-4 py-2 rounded hover:bg-green-700">Register</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger toggle */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-1" onClick={() => setMenuOpen(false)}>
          {user ? (
            <>
              <Link to="/dashboard"  className={navLink}>Dashboard</Link>
              <Link to="/products"   className={navLink}>Products</Link>
              <Link to="/categories" className={navLink}>Categories</Link>
              <Link to="/users"      className={navLink}>Users</Link>
              <Link to="/profile"    className={navLink}>Profile</Link>
              <button onClick={handleLogout} className="text-left px-3 py-2 rounded bg-red-500 hover:bg-red-700">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className={navLink}>Login</Link>
              <Link to="/register" className={navLink}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
