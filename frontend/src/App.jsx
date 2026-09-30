import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Reports, { ReportForm, ReportDetail } from './pages/Reports.jsx';
import Actions from './pages/Actions.jsx';
import Analytics from './pages/Analytics.jsx';

function Protected({ children }) {
  const location = useLocation();
  return localStorage.getItem('sih-token') ? children : <Navigate to="/login" replace state={{ from: location }} />;
}

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('sih-user') || 'null'));
  const signOut = () => {
    localStorage.removeItem('sih-token');
    localStorage.removeItem('sih-user');
    setUser(null);
  };
  return <Routes>
    <Route path="/login" element={<Login onLogin={setUser} />} />
    <Route element={<Protected><Layout user={user} onSignOut={signOut} /></Protected>}>
      <Route index element={<Dashboard />} />
      <Route path="reports" element={<Reports />} />
      <Route path="reports/new" element={<ReportForm />} />
      <Route path="reports/:id" element={<ReportDetail />} />
      <Route path="actions" element={<Actions />} />
      <Route path="analytics" element={<Analytics />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
