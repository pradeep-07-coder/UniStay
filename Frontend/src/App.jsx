import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';

// Developer 3 Pages
import MealPlans from './pages/MealPlans';
import MealPlanDetails from './pages/MealPlanDetails';
import ProviderDashboard from './pages/ProviderDashboard';

// Placeholder component for routes assigned to other developers
const ExternalModulePlaceholder = ({ moduleName, developerName, branchName }) => (
  <div style={{ maxWidth: '800px', margin: '60px auto', padding: '40px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', fontFamily: 'sans-serif' }}>
    <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>ðŸ±</span>
    <h2 style={{ color: '#1e293b', marginBottom: '12px' }}>{moduleName} Module</h2>
    <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
      This module is maintained by <strong>{developerName}</strong> under branch <code>{branchName}</code>.
    </p>
    <a href="/meal-plans" style={{ display: 'inline-block', padding: '10px 24px', background: '#3b82f6', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
      Go to Meal Plans
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
          {/* Developer 3 Active Routes */}
          <Route path="/" element={<MealPlans />} />
          <Route path="/meal-plans" element={<MealPlans />} />
          <Route path="/meal-plans/:id" element={<MealPlanDetails />} />
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute allowedRoles={['meal_provider']}>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />

          {/* External Developer Routes */}
          <Route path="/about" element={<ExternalModulePlaceholder moduleName="About Page" developerName="Developer 1" branchName="feature/dev1-auth-admin-core" />} />
          <Route path="/contact" element={<ExternalModulePlaceholder moduleName="Contact Page" developerName="Developer 1" branchName="feature/dev1-auth-admin-core" />} />
          <Route path="/login" element={<ExternalModulePlaceholder moduleName="Login Page" developerName="Developer 1" branchName="feature/dev1-auth-admin-core" />} />
          <Route path="/register" element={<ExternalModulePlaceholder moduleName="Register Page" developerName="Developer 1" branchName="feature/dev1-auth-admin-core" />} />
          <Route path="/admin/dashboard" element={<ExternalModulePlaceholder moduleName="Admin Dashboard" developerName="Developer 1" branchName="feature/dev1-auth-admin-core" />} />
          <Route path="/accommodations" element={<ExternalModulePlaceholder moduleName="Accommodations Search" developerName="Developer 2" branchName="feature/dev2-accommodations-booking" />} />
          <Route path="/accommodations/:id" element={<ExternalModulePlaceholder moduleName="Accommodation Details" developerName="Developer 2" branchName="feature/dev2-accommodations-booking" />} />
          <Route path="/owner/dashboard" element={<ExternalModulePlaceholder moduleName="Owner Dashboard" developerName="Developer 2" branchName="feature/dev2-accommodations-booking" />} />
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