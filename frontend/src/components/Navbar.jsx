import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    navigate(search.trim() ? `/?search=${encodeURIComponent(search.trim())}` : '/');
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-mark">
          DEEN-STAR
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search the mall…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            ⌕
          </button>
        </form>

        <nav className="navbar-links">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="navbar-link">
                  Admin
                </Link>
              )}
              <span className="navbar-user">Hi, {user.full_name.split(' ')[0]}</span>
              <button className="btn btn-sm" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Log in
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
