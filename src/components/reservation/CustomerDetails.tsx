import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MessageSquare } from 'lucide-react';
import { useReservation } from '../../context/ReservationContext';
import Button from '../ui/Button';

const CustomerDetails: React.FC = () => {
  const {
    selectedService,
    selectedDate,
    customerName,
    customerEmail,
    customerPhone,
    notes,
    setCustomerName,
    setCustomerEmail,
    setCustomerPhone,
    setNotes
  } = useReservation();
  
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/reservation/confirm');
  };
  
  const handleBack = () => {
    navigate('/reservation/datetime');
  };
  
  const isFormValid = customerName.trim() !== '' && 
                      customerEmail.trim() !== '' && 
                      customerPhone.trim() !== '';
  
  if (!selectedService || !selectedDate) {
    navigate('/reservation/services');
    return null;
  }
  
  return (
    <div className="py-8 animate-fadeIn">
      <h2 className="text-2xl font-serif font-bold text-purple-900 mb-6 text-center">
        お客様情報の入力
      </h2>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <label className="flex items-center text-purple-800 font-medium mb-2" htmlFor="name">
              <User className="w-4 h-4 mr-2" />
              お名前
            </label>
            <input
              id="name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="お名前をご入力ください"
              required
            />
          </div>
          
          <div>
            <label className="flex items-center text-purple-800 font-medium mb-2" htmlFor="email">
              <Mail className="w-4 h-4 mr-2" />
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="メールアドレスをご入力ください"
              required
            />
          </div>
          
          <div>
            <label className="flex items-center text-purple-800 font-medium mb-2" htmlFor="phone">
              <Phone className="w-4 h-4 mr-2" />
              電話番号
            </label>
            <input
              id="phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="電話番号をご入力ください"
              required
            />
          </div>
          
          <div>
            <label className="flex items-center text-purple-800 font-medium mb-2" htmlFor="notes">
              <MessageSquare className="w-4 h-4 mr-2" />
              ご要望・備考（任意）
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="ご要望や伝えておきたいことがあればご記入ください"
              rows={4}
            />
          </div>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
          <Button type="button" variant="outline" onClick={handleBack}>
            戻る
          </Button>
          <Button type="submit" disabled={!isFormValid}>
            次へ
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerDetails;
