import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard Components
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Settings from './pages/Settings';
import Statistics from './pages/Statistics';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Support from './pages/Support';
import Advisor from './pages/Advisor';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserDetail from './pages/AdminUserDetail';

// Components
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute'; 

function App() {
  return (
      <Router>
\
        <Toaster 
          position="top-center" 
          reverseOrder={false}
          toastOptions={{
            duration: 5000, 
            style: {
              background: '#334155',
              color: '#fff',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #475569',
              fontSize: '14px',
              maxWidth: '500px',
            },
            success: {
              style: {
                background: '#065f46', 
                border: '1px solid #059669',
              },
              iconTheme: {
                primary: '#34d399',
                secondary: '#fff',
              },
            },
            error: {
              duration: 8000, 
              style: {
                background: '#7f1d1d',
                border: '1px solid #b91c1c',
              },
              iconTheme: {
                primary: '#f87171',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          

          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="stats" element={<Statistics />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="budget" element={<Budget />} />
            <Route path="settings" element={<Settings />} />
            <Route path="support" element={<Support />} />
            <Route path="advisor" element={<Advisor />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="/admin" element={<AdminRoute><DashboardLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} /> 
            <Route path="user/:userId" element={<AdminUserDetail />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
          
      
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
  );
}

export default App;