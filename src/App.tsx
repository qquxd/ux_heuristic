import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { RegistrationPage } from './modules/customer/pages/RegistrationPage';
import { DashboardPage } from './modules/customer/pages/DashboardPage';

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

function App() {
  return (
    <ConfigProvider theme={theme}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/customer/registration" replace />} />
            <Route path="/customer/registration" element={<RegistrationPage />} />
            <Route path="/customer/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/customer/registration" replace />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;