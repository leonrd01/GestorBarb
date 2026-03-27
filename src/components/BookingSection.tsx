import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { format, addDays, startOfToday, isSameDay, parse, isAfter, isBefore, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Service, Barber, Appointment } from '../types';
import { BARBERS } from '../constants';
import { fetchServices } from '../services/firestore';

interface BookingSectionProps {
  onComplete: (app: Appointment) => void;
  businessHours: any;
}

const BookingSection: React.FC<BookingSectionProps> = ({ onComplete, businessHours }) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', notes: '' });
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadServices = async () => {
      try {
        const data = await fetchServices();
        if (active) {
          setServices(data);
        }
      } catch (err) {
        if (active) {
          setServicesError('Nao foi possivel carregar os servicos.');
        }
      } finally {
        if (active) {
          setServicesLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  // Generate available times based on business hours
  const availableTimes = useMemo(() => {
    const times = [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Check if date is blocked
    if (businessHours.blockedDates.includes(dateStr) || !businessHours.daysOpen.includes(selectedDate.getDay())) {
      return [];
    }

    let current = parse(businessHours.open, 'HH:mm', selectedDate);
    const end = parse(businessHours.close, 'HH:mm', selectedDate);
    const lunchStart = parse(businessHours.lunchStart, 'HH:mm', selectedDate);
    const lunchEnd = parse(businessHours.lunchEnd, 'HH:mm', selectedDate);

    while (isBefore(current, end)) {
      const timeStr = format(current, 'HH:mm');
      const isLunch = isAfter(current, addMinutes(lunchStart, -1)) && isBefore(current, lunchEnd);
      
      // Check if slot is manually blocked
      const isManuallyBlocked = businessHours.manualBlockedSlots.some(
        (slot: any) => slot.date === dateStr && slot.time === timeStr
      );

      // Mock occupied times (in a real app, this would come from the appointments list)
      const isOccupied = ['10:00', '14:30', '16:00'].includes(timeStr);

      times.push({
        time: timeStr,
        available: !isLunch && !isOccupied && !isManuallyBlocked,
        reason: isLunch ? 'Almoço' : isOccupied ? 'Ocupado' : isManuallyBlocked ? 'Bloqueado' : null
      });
      current = addMinutes(current, 30);
    }
    return times;
  }, [selectedDate, businessHours]);

  const handleConfirm = () => {
    if (!selectedService || !selectedBarber || !selectedTime) return;
    
    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: 'c1',
      clientName: formData.name,
      clientPhone: formData.phone,
      serviceId: selectedService.id,
      barberId: selectedBarber.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      status: 'Reservado',
      notes: formData.notes
    };
    onComplete(newAppointment);
  };

  return (
    <section id="booking" className="py-24 bg-black">
      <div className="container mx-auto px-6 max-w-4xl">
        <span className="section-subtitle">Agendamento</span>
        <h2 className="section-title">Reserve seu horário</h2>

        <div className="mt-12 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
          {/* Progress Bar */}
          <div className="flex border-b border-white/10">
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                className={cn(
                  "flex-1 py-4 text-center text-xs font-bold tracking-widest uppercase transition-all duration-500",
                  step === s ? "text-gold bg-gold/5" : "text-white/30"
                )}
              >
                Passo {s}
              </div>
            ))}
          </div>

          <div className="p-8">
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-xl font-serif mb-6">Selecione o Servico</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {servicesLoading && (
                    <p className="text-white/50">Carregando servicos...</p>
                  )}
                  {servicesError && (
                    <p className="text-red-400">{servicesError}</p>
                  )}
                  {!servicesLoading && !servicesError && services.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        selectedService?.id === s.id ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/30"
                      )}
                    >
                      <div className="font-bold">{s.name}</div>
                      <div className="text-gold text-sm">R$ {s.price.toFixed(2)} - {s.duration}</div>
                    </button>
                  ))}
                  {!servicesLoading && !servicesError && services.length === 0 && (
                    <p className="text-white/50">Nenhum servico cadastrado.</p>
                  )}
                </div>
                <div className="mt-8 flex justify-end">
                  <button 
                    disabled={!selectedService}
                    onClick={() => setStep(2)}
                    className="btn-primary disabled:opacity-50"
                  >
                    PROXIMO
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-xl font-serif mb-6">Data e Horário</h3>
                
                <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
                  {[...Array(14)].map((_, i) => {
                    const date = addDays(startOfToday(), i);
                    const isSelected = isSameDay(date, selectedDate);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "flex-shrink-0 w-16 h-20 rounded-xl border flex flex-col items-center justify-center transition-all",
                          isSelected ? "border-gold bg-gold/5 text-gold" : "border-white/10 hover:border-white/30"
                        )}
                      >
                        <span className="text-[10px] uppercase font-bold">{format(date, 'EEE', { locale: ptBR })}</span>
                        <span className="text-xl font-bold">{format(date, 'dd')}</span>
                      </button>
                    );
                  })}
                </div>

                <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Barbeiros Disponíveis</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {BARBERS.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBarber(b)}
                      className={cn(
                        "p-3 rounded-xl border flex items-center gap-3 transition-all",
                        selectedBarber?.id === b.id ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/30"
                      )}
                    >
                      <img src={b.avatar} alt={b.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div className="text-left">
                        <div className="text-sm font-bold">{b.name}</div>
                        <div className="text-[10px] text-white/50">{b.specialty}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Horários</h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availableTimes.map(({ time, available, reason }) => (
                    <div key={time} className="relative group">
                      <button
                        disabled={!available}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "w-full py-2 rounded-lg border text-sm font-bold transition-all",
                          !available ? "opacity-20 cursor-not-allowed bg-white/5" : 
                          selectedTime === time ? "border-gold bg-gold text-black" : "border-white/10 hover:border-white/30"
                        )}
                      >
                        {time}
                      </button>
                      {!available && reason === 'Ocupado' && (
                        <button 
                          className="absolute -top-2 -right-2 bg-gold text-black text-[8px] font-bold px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Entrar na lista de espera"
                        >
                          ESPERA
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(1)} className="text-white/50 hover:text-white">VOLTAR</button>
                  <button 
                    disabled={!selectedTime || !selectedBarber}
                    onClick={() => setStep(3)}
                    className="btn-primary disabled:opacity-50"
                  >
                    PRÓXIMO
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-xl font-serif mb-6">Confirme seus Dados</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs uppercase font-bold text-white/50 block mb-2">Nome Completo</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-gold outline-none"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-white/50 block mb-2">Telefone / WhatsApp</label>
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-gold outline-none"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-white/50 block mb-2">Cupom de Desconto</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-gold outline-none"
                        placeholder="Digite seu cupom"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-white/50 block mb-2">Observações (Opcional)</label>
                      <textarea 
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-gold outline-none h-24"
                        placeholder="Algum detalhe especial?"
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gold mb-4">Resumo da Reserva</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/50">Serviço:</span>
                        <span className="font-bold">{selectedService?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Barbeiro:</span>
                        <span className="font-bold">{selectedBarber?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Data:</span>
                        <span className="font-bold">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Horário:</span>
                        <span className="font-bold">{selectedTime}</span>
                      </div>
                      <div className="pt-3 border-t border-white/10 flex justify-between text-lg">
                        <span className="font-serif">Total:</span>
                        <span className="text-gold font-bold">R$ {selectedService?.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-6 p-3 bg-dark-red/20 border border-dark-red/30 rounded-lg flex gap-3">
                      <AlertCircle className="text-dark-red flex-shrink-0" size={18} />
                      <p className="text-[10px] text-white/70 leading-relaxed">
                        O cliente deve comparecer ou cancelar com no mínimo 1 hora de antecedência. Faltas sem aviso prévio podem gerar bloqueio de agendamentos futuros.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(2)} className="text-white/50 hover:text-white">VOLTAR</button>
                  <button 
                    disabled={!formData.name || !formData.phone}
                    onClick={handleConfirm}
                    className="btn-primary disabled:opacity-50"
                  >
                    CONFIRMAR AGENDAMENTO
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
