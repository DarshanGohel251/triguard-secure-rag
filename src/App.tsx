import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Ask from './pages/Ask';
import Documents from './pages/Documents';
import Security from './pages/Security';
import Audit from './pages/Audit';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ask" element={<Ask />} />
          <Route path="documents" element={<Documents />} />
          <Route path="security" element={<Security />} />
          <Route path="audit" element={<Audit />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
