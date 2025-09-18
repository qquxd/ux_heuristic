import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { RegistrationPage } from './modules/customer/pages/RegistrationPage';
import { LoginPage } from './modules/customer/pages/LoginPage';
import { DashboardPage } from './modules/customer/pages/DashboardPage';
import { ProjectsPage } from './modules/customer/pages/ProjectsPage';
import { useAuthStore } from './store/authStore';

const theme = {
  token: {
    colorPrimary: '#000336',
    colorSuccess: '#00BFA5',
    colorWarning: '#FFD700',
    colorBgBase: '#F5F5F5',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 8,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 8,
    },
    Card: {
      borderRadius: 16,
    },
  },
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/customer/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/customer/login" replace />} />
            <Route path="/customer/login" element={<LoginPage />} />
            <Route path="/customer/registration" element={<RegistrationPage />} />
            <Route 
              path="/customer/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/projects" 
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/customer/login" replace />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;