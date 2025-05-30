import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProgressBar from '../components/reservation/ProgressBar';
import ServiceSelection from '../components/reservation/ServiceSelection';
import DateTimeSelection from '../components/reservation/DateTimeSelection';
import CustomerDetails from '../components/reservation/CustomerDetails';
import ConfirmReservation from '../components/reservation/ConfirmReservation';
import ReservationSuccess from '../components/reservation/ReservationSuccess';
import { ReservationProvider } from '../context/ReservationContext';

const ReservationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <ReservationProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold text-purple-900 text-center mb-6">
          ご予約フォーム
        </h1>

        <Routes>
          {/* サービス選択（初期ページ） */}
          <Route 
            path="/" 
            element={
              <>
                <ProgressBar currentStep={0} totalSteps={4} />
                <ServiceSelection />
              </>
            } 
          />
          {/* サービス選択（直接アクセス） */}
          <Route 
            path="/services" 
            element={
              <>
                <ProgressBar currentStep={0} totalSteps={4} />
                <ServiceSelection />
              </>
            } 
          />
          {/* 日時選択 */}
          <Route 
            path="/datetime" 
            element={
              <>
                <ProgressBar currentStep={1} totalSteps={4} />
                <DateTimeSelection />
              </>
            } 
          />
          {/* お客様情報入力 */}
          <Route 
            path="/details" 
            element={
              <>
                <ProgressBar currentStep={2} totalSteps={4} />
                <CustomerDetails />
              </>
            } 
          />
          {/* 内容確認 */}
          <Route 
            path="/confirm" 
            element={
              <>
                <ProgressBar currentStep={3} totalSteps={4} />
                <ConfirmReservation />
              </>
            } 
          />
          {/* 完了メッセージ */}
          <Route path="/success" element={<ReservationSuccess />} />

          {/* 不正なURLの場合は最初のステップへ */}
          <Route path="*" element={<Navigate to="/reservation" replace />} />
        </Routes>
      </div>
    </ReservationProvider>
  );
};

export default ReservationPage;
