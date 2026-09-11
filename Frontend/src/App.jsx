import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';

import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

import Accommodations from './pages/Accommodations';
import AccommodationDetails from './pages/AccommodationDetails';
import OwnerDashboard from './pages/OwnerDashboard';

import MealPlans from './pages/MealPlans';
import MealPlanDetails from './pages/MealPlanDetails';
import ProviderDashboard from './pages/ProviderDashboard';

import FoodVouchers from './pages/FoodVouchers';
import PaymentPage from './pages/PaymentPage';
import StudentDashboard from './pages/StudentDashboard';

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
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

          <Route path="/accommodations" element={<Accommodations />} />
          <Route path="/accommodations/:id" element={<AccommodationDetails />} />
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['property_owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

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

          <Route path="/vouchers" element={<FoodVouchers />} />
          <Route
            path="/payment"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
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