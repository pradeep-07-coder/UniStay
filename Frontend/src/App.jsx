import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';

// Developer 1 Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

// Placeholder component for routes assigned to other developers
const ExternalModulePlaceholder = ({ moduleName, developerName, branchName }) => (
  <div style={{ maxWidth: '800px', margin: '60px auto', padding: '40px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', fontFamily: 'sans-serif' }}>
    <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>ðŸš§</span>
    <h2 style={{ color: '#1e293b', marginBottom: '12px' }}>{moduleName} Module</h2>
    <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
      This module is actively maintained by <strong>{developerName}</strong> under branch <code>{branchName}</code>.
      Once merged to <code>main</code>, this route will render full production components.
    </p>
    <a href="/" style={{ display: 'inline-block', padding: '10px 24px', background: '#3b82f6', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
      Return to Home
    </a>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Developer 1 Active Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* External Developer Routes (Stubs for Seamless Dev 1 Testing) */}
          <Route path="/accommodations" element={<ExternalModulePlaceholder moduleName="Accommodations Search" developerName="Developer 2" branchName="feature/dev2-accommodations-booking" />} />
          <Route path="/accommodations/:id" element={<ExternalModulePlaceholder moduleName="Accommodation Details" developerName="Developer 2" branchName="feature/dev2-accommodations-booking" />} />
          <Route path="/owner/dashboard" element={<ExternalModulePlaceholder moduleName="Owner Dashboard" developerName="Developer 2" branchName="feature/dev2-accommodations-booking" />} />
          <Route path="/meal-plans" element={<ExternalModulePlaceholder moduleName="Meal Plans Catalog" developerName="Developer 3" branchName="feature/dev3-mealplans-daily-scanner" />} />
          <Route path="/meal-plans/:id" element={<ExternalModulePlaceholder moduleName="Meal Plan Details" developerName="Developer 3" branchName="feature/dev3-mealplans-daily-scanner" />} />
          <Route path="/provider/dashboard" element={<ExternalModulePlaceholder moduleName="Provider Dashboard" developerName="Developer 3" branchName="feature/dev3-mealplans-daily-scanner" />} />
          <Route path="/vouchers" element={<ExternalModulePlaceholder moduleName="Food Vouchers" developerName="Developer 4" branchName="feature/dev4-finance-vouchers-helpdesk" />} />
          <Route path="/payment" element={<ExternalModulePlaceholder moduleName="Payment Gateway" developerName="Developer 4" branchName="feature/dev4-finance-vouchers-helpdesk" />} />
          <Route path="/student/dashboard" element={<ExternalModulePlaceholder moduleName="Student Dashboard" developerName="Developer 4" branchName="feature/dev4-finance-vouchers-helpdesk" />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}