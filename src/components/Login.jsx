import { useState } from 'react';
import { login, register, errorMessage } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'register') {
        await register(form);
        setNotice('Account created. You can now Log in.');
        setMode('login');
      } else {
        onLogin(await login(form.username, form.password));
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-topbar">
        <a className="wordmark" href="#" aria-label="Common Market home"><span className="wordmark-mark">c.</span><span>common<span className="wordmark-light">market</span></span></a>
        <span className="login-topnote">GOOD THINGS, FOR EVERYDAY LIVING</span>
      </header>
      <main className="login-layout">
        <section className="login-story">
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1500&q=90" alt="Fresh produce arranged at a neighborhood market" />
          <div className="login-story-shade" />
          <div className="login-story-copy"><p className="eyebrow">A good place to start</p><h1>Make room<br />for <em>good things.</em></h1><p>Find the everyday favorites worth bringing home.</p></div>
          <span className="login-photo-credit">THE EVERYDAY EDIT / COMMON MARKET</span>
        </section>
        <section className="login-panel">
          <p className="eyebrow"><span className="eyebrow-line" />{mode === 'login' ? 'Welcome back' : 'New around here'}</p>
          <h2>{mode === 'login' ? <>Come on <em>in.</em></> : <>Let’s get you <em>settled.</em></>}</h2>
          <p className="login-subtitle">{mode === 'login' ? 'Sign in to see what’s on the shelves.' : 'Create an account and take a look around.'}</p>
          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert success" role="status">{notice}</div>}

          <form className="market-form" onSubmit={submit}>
            <label>Username
              <input value={form.username} onChange={set('username')} required autoFocus autoComplete="username" />
            </label>
            {mode === 'register' && (
              <label>Email address
                <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
              </label>
            )}
            <label>Password
              <input type="password" value={form.password} onChange={set('password')} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </label>
            <button className="button button-dark login-submit" disabled={busy}>{busy ? 'One moment…' : mode === 'login' ? 'Sign in' : 'Create account'} <span aria-hidden="true">↗</span></button>
          </form>

          <div className="login-switch">
            <span>{mode === 'login' ? 'New to the market?' : 'Already have an account?'}</span>
            <button className="inline-action" type="button" onClick={() => { setError(''); setNotice(''); setMode(mode === 'login' ? 'register' : 'login'); }}>{mode === 'login' ? 'Create an account' : 'Sign in instead'}</button>
          </div>
        </section>
      </main>
      <footer className="login-footer"><span>© 2026 Common Market</span><span>Thoughtfully picked, ready for real life.</span></footer>
    </div>
  );
}
