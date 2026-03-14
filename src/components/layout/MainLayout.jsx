import { Link, Outlet, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/generos', label: 'Géneros', icon: 'bi-tags' },
  { to: '/directores', label: 'Directores', icon: 'bi-person-video2' },
  { to: '/productoras', label: 'Productoras', icon: 'bi-building' },
  { to: '/tipos', label: 'Tipos', icon: 'bi-collection' },
  { to: '/media', label: 'Películas y series', icon: 'bi-camera-reels' },
];

export function MainLayout() {
  const location = useLocation();

  return (
    <>
      <header className="app-header">
        <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
          <div className="container-fluid px-3 px-lg-4">
            <Link className="navbar-brand" to="/">
              <i className="bi bi-camera-reels me-2" aria-hidden />
              Admin Películas
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Abrir menú"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                {NAV_ITEMS.map(({ to, label, icon }) => (
                  <li key={to} className="nav-item">
                    <Link
                      className={`nav-link ${location.pathname === to ? 'active' : ''}`}
                      to={to}
                    >
                      <i className={`bi ${icon} me-2`} aria-hidden />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </header>
      <main className="app-container">
        <Outlet />
      </main>
    </>
  );
}
