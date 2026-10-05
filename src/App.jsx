import { useEffect, useState } from 'react';
import { me, logout, tokens } from './api.js';
import Login from './components/Login.jsx';
import ProductList from './components/ProductList.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(!!tokens.access);

  // Restore the session if a token is already stored
  useEffect(() => {
    if (!tokens.access) return;
    me().then(setUser).catch(() => tokens.clear()).finally(() => setChecking(false));
  }, []);

  // Refresh token expired -> back to the login screen
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (checking) {
    return (
      <div className="loading-screen">
        <a className="wordmark" href="#" aria-label="Common Market home"><span className="wordmark-mark">c.</span><span>common<span className="wordmark-light">market</span></span></a>
        <span className="loading-label">Opening the market</span>
        <span className="loading-line" />
      </div>
    );
  }

  return user
    ? <ProductList user={user} onLogout={handleLogout} />
    : <Login onLogin={setUser} />;
}
