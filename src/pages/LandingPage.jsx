import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await signup(form);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.landing}>
      <div className={styles.container}>
        {/* Left branding panel */}
        <div className={styles.brandPanel}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            EVENT LIVE
          </div>
          <h1 className={styles.logo}>
            CIPHER<span className={styles.logoAccent}>CLASH</span>
          </h1>
          <p className={styles.tagline}>// CYBERSECURITY CHALLENGE</p>
          <p className={styles.brandDesc}>
            Test your cybersecurity skills across multiple rounds of 
            increasingly complex challenges. Decode, exploit, and conquer.
          </p>
        </div>

        {/* Right form panel */}
        <div className={styles.formPanel}>
          <h2 className={styles.formTitle}>
            {isLogin ? (
              <>ACCESS <span className={styles.formTitleAccent}>TERMINAL</span></>
            ) : (
              <>INITIALIZE <span className={styles.formTitleAccent}>AGENT</span></>
            )}
          </h2>
          <p className={styles.formSub}>
            {isLogin ? '// authenticate existing agent' : '// create your agent profile'}
          </p>

          {error && <div className={styles.errorMsg}>⚠ {error}</div>}

          <form className={styles.form} onSubmit={handleSubmit}>
            {!isLogin && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  <span className={styles.labelPrefix}>$ </span>USERNAME
                </label>
                <input
                  className={styles.input}
                  type="text"
                  name="username"
                  placeholder="agent_handle"
                  value={form.username}
                  onChange={handleChange}
                  required={!isLogin}
                  autoComplete="username"
                />
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <span className={styles.labelPrefix}>$ </span>EMAIL
              </label>
              <input
                className={styles.input}
                type="email"
                name="email"
                placeholder="agent@domain.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <span className={styles.labelPrefix}>$ </span>PASSWORD
              </label>
              <input
                className={styles.input}
                type="password"
                name="password"
                placeholder="••••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>

            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? (
                <><span className={styles.spinner} /> PROCESSING...</>
              ) : (
                <>{isLogin ? 'LOGIN →' : 'SIGN UP →'}</>
              )}
            </button>
          </form>

          <p className={styles.toggleText}>
            {isLogin ? "Don't have an account? " : 'Already registered? '}
            <button
              type="button"
              className={styles.toggleLink}
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
