import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ReservationPage from './pages/ReservationPage';
import AdminTokenRegistration from './components/admin/AdminTokenRegistration';
import TestNotification from './components/admin/TestNotification';

import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/reservation" replace />} />
          <Route path="/reservation/*" element={<ReservationPage />} />
          <Route path="/admin/token-registration" element={<AdminTokenRegistration />} />
          <Route path="/admin/test-notification" element={<TestNotification />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
