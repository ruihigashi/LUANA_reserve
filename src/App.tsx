import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ReservationPage from './pages/ReservationPage';

import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/reservation" replace />} />
          <Route path="/reservation/*" element={<ReservationPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
