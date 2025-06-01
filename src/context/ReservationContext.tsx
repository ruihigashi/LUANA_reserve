import React, { createContext, useContext, useState } from 'react';
import { Service, TimeSlot } from '../types';

interface ReservationContextType {
  selectedServices: Service[];
  setSelectedServices: (services: Service[]) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedTimeSlot: TimeSlot | null;
  setSelectedTimeSlot: (slot: TimeSlot | null) => void;
  // （顧客情報など）
  customerName: string;
  setCustomerName: (name: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  notes: string;
  setNotes: (note: string) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <ReservationContext.Provider
      value={{
        selectedServices,
        setSelectedServices,
        selectedDate,
        setSelectedDate,
        selectedTimeSlot,
        setSelectedTimeSlot,
        customerName,
        setCustomerName,
        customerEmail,
        setCustomerEmail,
        customerPhone,
        setCustomerPhone,
        notes,
        setNotes,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation は ReservationProvider の中で呼び出してください');
  }
  return context;
};
