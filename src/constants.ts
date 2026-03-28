import { Service, Barber, BusinessHours, Client, Appointment } from './types';


export const SERVICES: Service[] = [
  { id: '1', name: 'Corte de Cabelo', price: 60, duration: '45 min', icon: 'Scissors' },
  { id: '2', name: 'Barba Completa', price: 40, duration: '30 min', icon: 'User' },
  { id: '3', name: 'Sobrancelha', price: 20, duration: '15 min', icon: 'Eye' },
  { id: '4', name: 'Corte + Barba', price: 90, duration: '75 min', icon: 'Zap' },
  { id: '5', name: 'Pacote Mensal', price: 200, duration: '60 min', icon: 'Calendar' },
];

export const BARBERS: Barber[] = [
  { id: '1', name: 'Ricardo Silva', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop', specialty: 'Especialista em Degrade' },
];

export const BUSINESS_HOURS: BusinessHours = {
  open: '09:00',
  close: '20:00',
  lunchStart: '12:00',
  lunchEnd: '13:30',
  daysOpen: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
  blockedDates: [],
  manualBlockedSlots: [],
};

export const ADMIN_CREDENTIALS = {
  email: 'admin@barbearia.com',
  password: 'admin'
};

export const MOCK_CLIENT: Client = {
  id: 'c1',
  name: 'Leonardo Dev',
  phone: '(11) 99999-9999',
  email: 'dev.leonrd@outlook.com',
  absences: 0,
  status: 'Normal',
  history: [
    {
      id: 'a1',
      clientId: 'c1',
      clientName: 'Leonardo Dev',
      clientPhone: '(11) 99999-9999',
      serviceId: '1',
      barberId: '1',
      date: '2024-03-20',
      time: '14:00',
      status: 'Compareceu',
    }
  ]
};

export const MOCK_APPOINTMENTS: Appointment[] = [];
