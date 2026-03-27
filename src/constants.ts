import { Service, Barber, BusinessHours, Client, Appointment } from './types';


export const SERVICES: Service[] = [
  { id: '1', name: 'Corte de Cabelo', price: 60, duration: '45 min', icon: 'Scissors' },
  { id: '2', name: 'Barba Completa', price: 40, duration: '30 min', icon: 'User' },
  { id: '3', name: 'Sobrancelha', price: 20, duration: '15 min', icon: 'Eye' },
  { id: '4', name: 'Corte + Barba', price: 90, duration: '75 min', icon: 'Zap' },
  { id: '5', name: 'Pacote Mensal', price: 200, duration: '60 min', icon: 'Calendar' },
];

export const BARBERS: Barber[] = [
  { id: '1', name: 'Ricardo Silva', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop', specialty: 'Especialista em Degradê' },
  { id: '2', name: 'André Santos', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', specialty: 'Mestre Barbeiro' },
  { id: '3', name: 'Lucas Oliveira', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', specialty: 'Visagismo e Barba' },
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

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a2',
    clientId: 'c2',
    clientName: 'João Pereira',
    clientPhone: '(11) 98888-8888',
    serviceId: '1',
    barberId: '1',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    status: 'Confirmado',
  },
  {
    id: 'a3',
    clientId: 'c3',
    clientName: 'Marcos Souza',
    clientPhone: '(11) 97777-7777',
    serviceId: '2',
    barberId: '2',
    date: new Date().toISOString().split('T')[0],
    time: '11:30',
    status: 'Reservado',
  }
];
