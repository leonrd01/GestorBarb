import React, { useState } from 'react';
import { 
  CheckCircle2, 
  MessageCircle,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment, ServiceStatus } from './types';
import { MOCK_APPOINTMENTS, BUSINESS_HOURS } from './constants';

// --- Modular Components ---
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import BookingSection from './components/BookingSection';
import TestimonialsSection from './components/TestimonialsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [view, setView] = useState('home');
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [businessHours, setBusinessHours] = useState(BUSINESS_HOURS);

  const handleBookingComplete = (app: Appointment) => {
    setAppointments([...appointments, app]);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setView('home');
    }, 3000);
  };

  const updateAppointmentStatus = (id: string, status: ServiceStatus) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setView('home');
  };

  const isAdmin = view === 'admin' && isLoggedIn;

  return (
    <div className="min-h-screen">
      <Navbar 
        onNavigate={setView} 
        currentView={view} 
        isAdmin={isAdmin} 
        onLogout={handleLogout}
      />
      
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div id="home">
              <Hero onBooking={() => setView('booking')} />
            </div>
            
            {/* Status Bar */}
            <div className="bg-gold/10 border-y border-gold/20 py-4">
              <div className="container mx-auto px-6 flex flex-wrap justify-center gap-8 text-xs font-bold tracking-widest uppercase">
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> ABERTO AGORA
                </div>
                <div className="text-white/60">PRÓXIMO HORÁRIO: <span className="text-gold">14:30</span></div>
                <div className="text-white/60">VAGAS HOJE: <span className="text-gold">4</span></div>
              </div>
            </div>

            <AboutSection onBooking={() => setView('booking')} />

            <ServicesSection />

            <TestimonialsSection />

            <ContactSection />

            <Footer />
          </motion.div>
        )}

        {view === 'booking' && (
          <motion.div key="booking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="pt-24 min-h-screen">
              <BookingSection onComplete={handleBookingComplete} businessHours={businessHours} />
            </div>
            <Footer />
          </motion.div>
        )}

        {view === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Login onLogin={() => { setIsLoggedIn(true); setView('admin'); }} />
          </motion.div>
        )}

        {view === 'admin' && isLoggedIn && (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminDashboard 
              appointments={appointments} 
              onUpdateStatus={updateAppointmentStatus} 
              businessHours={businessHours}
              onUpdateBusinessHours={setBusinessHours}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-gold/30 p-12 rounded-3xl max-w-md w-full text-center"
            >
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-gold" size={40} />
              </div>
              <h2 className="text-3xl font-serif mb-4">Agendamento Realizado!</h2>
              <p className="text-white/60 mb-8">
                Sua reserva foi confirmada. Você receberá uma confirmação via WhatsApp em instantes.
              </p>
              <div className="text-[10px] uppercase tracking-widest text-gold font-bold">Redirecionando...</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp */}
      <a 
        href="https://wa.me/5511999999999" 
        target="_blank"
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300"
      >
        <MessageCircle size={30} />
      </a>
    </div>
  );
}
