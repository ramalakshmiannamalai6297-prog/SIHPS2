import { Activity, ArrowRight, Check, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, jsonBody } from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('demo@sih26165.in');
  const [password, setPassword] = useState('SafetyDemo26165!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function signIn(nextEmail = email, nextPassword = password) {
    setError(''); setLoading(true);
    try {
      const result = await api('/auth/login', { method: 'POST', body: jsonBody({ email: nextEmail, password: nextPassword }) });
      localStorage.setItem('sih-token', result.token);
      localStorage.setItem('sih-user', JSON.stringify(result.user));
      onLogin(result.user);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  function submit(event) { event.preventDefault(); return signIn(); }

  return <main className="login-screen"><div className="login-noise" /><section className="login-story"><div className="login-brand"><div className="brand-mark"><Activity size={21} strokeWidth={2.6} /></div><span>fieldnote</span></div><div className="story-content"><div className="story-kicker"><span /> SIH 26165 · PROTOTYPE</div><h1>See the signal<br />before the <em>incident.</em></h1><p>Turn everyday safety reports into clearer patterns, stronger controls, and earlier SIF precursor awareness.</p><div className="story-foot"><span className="story-rule" /><span>Synthetic Demo Data · No real company records</span></div></div><div className="story-index">01 <span>/</span> 04 <i /></div></section><section className="login-panel"><div className="login-form-wrap"><div className="form-overline"><ShieldCheck size={16} /> SECURE WORKSPACE</div><h2>Welcome back</h2><p className="login-subtitle">Sign in to your safety intelligence workspace.</p><form onSubmit={submit} className="login-form"><label>Email address<div className="input-icon-wrap"><Mail size={17} /><input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></div></label><label>Password<div className="input-icon-wrap"><LockKeyhole size={17} /><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div></label>{error && <div className="form-error"><ShieldCheck size={15} />{error}</div>}<button className="button button-primary login-submit" disabled={loading}>{loading ? <span className="spinner" /> : <>Sign in <ArrowRight size={17} /></>}</button></form><div className="login-divider"><span /><i>OR TRY THE PRESENTATION DEMO</i><span /></div><button className="button button-outline demo-login" onClick={() => signIn('demo@sih26165.in', 'SafetyDemo26165!')} disabled={loading}><span className="demo-check"><Check size={13} /></span>Continue with demo account</button><div className="demo-creds"><span>DEMO ACCESS</span><b>demo@sih26165.in</b><b>SafetyDemo26165!</b></div><div className="login-legal">Prototype only · AI outputs are decision support, not safety determinations.</div></div></section></main>;
}
