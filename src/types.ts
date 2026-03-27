export type ServiceStatus = 'Reservado' | 'Confirmado' | 'Compareceu' | 'Cancelado' | 'Não compareceu';

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: string; // e.g. "45 min"
  icon?: string;
}

export interface Barber {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  barberId: string;
  date: string; // ISO string
  time: string; // HH:mm
  status: ServiceStatus;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  absences: number;
  status: 'Normal' | 'Alerta' | 'Bloqueado';
  history: Appointment[];
}

export interface BusinessHours {
  open: string; // HH:mm
  close: string; // HH:mm
  lunchStart: string; // HH:mm
  lunchEnd: string; // HH:mm
  daysOpen: number[]; // 0-6 (Sunday-Saturday)
  blockedDates: string[]; // YYYY-MM-DD
  manualBlockedSlots: { date: string; time: string }[];
}

export interface AdminUser {
  email: string;
  name: string;
}
