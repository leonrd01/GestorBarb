import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { format, addDays, startOfToday, isSameDay, parse, isAfter, isBefore, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Service, Barber, Appointment, BusinessHours } from '../types';
import {
  createAppointment,
  fetchBarberAvailability,
  fetchBarbers,
  fetchServices,
  subscribeAppointmentsForBarberDate,
} from '../services/firestore';

interface BookingSectionProps {
  onComplete: (app: Appointment) => void;
}

// Componente de agendamento: carrega servicos, barbeiros, disponibilidade e horarios
// e permite ao cliente reservar um horario.
const BookingSection: React.FC<BookingSectionProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', notes: '' });
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    open: '',
    close: '',
    lunchStart: '',
    lunchEnd: '',
    daysOpen: [],
    blockedDates: [],
    manualBlockedSlots: [],
  });
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Carrega a lista de servicos do Firestore
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

  // Carrega os barbeiros do Firestore (se houver apenas 1, seleciona automaticamente)
  useEffect(() => {
    let active = true;

    fetchBarbers()
      .then((data) => {
        if (active) {
          setBarbers(data);
          if (data.length === 1 || !selectedBarber) {
            setSelectedBarber(data[0]);
          }
        }
      })
      .catch(() => {
        if (active) {
          setBarbers([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Carrega a disponibilidade do barbeiro selecionado
  useEffect(() => {
    if (!selectedBarber) {
      setBusinessHours({
        open: '',
        close: '',
        lunchStart: '',
        lunchEnd: '',
        daysOpen: [],
        blockedDates: [],
        manualBlockedSlots: [],
      });
      setAvailabilityError(null);
      return;
    }

    let active = true;
    setAvailabilityLoading(true);
    setAvailabilityError(null);

    fetchBarberAvailability(selectedBarber.id)
      .then((data) => {
        if (active) {
          setBusinessHours(data);
        }
      })
      .catch(() => {
        if (active) {
          setAvailabilityError('Nao foi possivel carregar a disponibilidade.');
          setBusinessHours({
            open: '',
            close: '',
            lunchStart: '',
            lunchEnd: '',
            daysOpen: [],
            blockedDates: [],
            manualBlockedSlots: [],
          });
        }
      })
      .finally(() => {
        if (active) {
          setAvailabilityLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedBarber]);

  // Busca os agendamentos do barbeiro na data selecionada
  useEffect(() => {
    if (!selectedBarber) {
      setAppointments([]);
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const unsubscribe = subscribeAppointmentsForBarberDate(
      selectedBarber.id,
      dateStr,
      (data) => setAppointments(data),
      () => setAppointments([])
    );

    return () => {
      unsubscribe();
    };
  }, [selectedBarber, selectedDate]);

  // Se a data atual nao for valida (fechado ou bloqueado), move para a proxima disponivel
  useEffect(() => {
    if (!selectedBarber) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const isOpenDay = businessHours.daysOpen.includes(selectedDate.getDay());
    const isBlocked = businessHours.blockedDates.includes(dateStr);
    if (isOpenDay && !isBlocked) {
      return;
    }

    const start = startOfToday();
    for (let i = 0; i < 14; i++) {
      const date = addDays(start, i);
      const checkStr = format(date, 'yyyy-MM-dd');
      const open = businessHours.daysOpen.includes(date.getDay());
      const blocked = businessHours.blockedDates.includes(checkStr);
      if (open && !blocked) {
        setSelectedDate(date);
        break;
      }
    }
  }, [businessHours, selectedBarber]);

  // Gera os horarios disponiveis com base na disponibilidade e agendamentos
  const availableTimes = useMemo(() => {
    if (!selectedBarber) {
      return [];
    }
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

      const isOccupied = appointments.some(
        (app) => app.time === timeStr && app.status !== 'Cancelado'
      );

      times.push({
        time: timeStr,
        available: !isLunch && !isOccupied && !isManuallyBlocked,
        reason: isLunch ? 'Almoço' : isOccupied ? 'Ocupado' : isManuallyBlocked ? 'Bloqueado' : null
      });
      current = addMinutes(current, 30);
    }
    return times;
  }, [selectedDate, businessHours, appointments]);

  // Confirma o agendamento e salva no Firestore
  const handleConfirm = async () => {
    if (!selectedService || !selectedBarber || !selectedTime) return;
    
    setBookingError(null);
    const phoneNormalized = formData.phone.replace(/\D/g, '').trim();
    const newAppointment: Omit<Appointment, 'id'> & { clientPhoneNormalized?: string } = {
      clientId: 'c1',
      clientName: formData.name,
      clientPhone: formData.phone,
      clientPhoneNormalized: phoneNormalized,
      serviceId: selectedService.id,
      barberId: selectedBarber.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      status: 'Reservado',
      notes: formData.notes
    };
    try {
      const saved = await createAppointment(newAppointment);
      setAppointments((prev) => [...prev, saved]);
      onComplete(saved);
    } catch (err) {
      setBookingError('Nao foi possivel confirmar o agendamento.');
    }
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
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isOpenDay = businessHours.daysOpen.includes(date.getDay());
                    const isBlocked = businessHours.blockedDates.includes(dateStr);
                    const isDisabled = !selectedBarber || !isOpenDay || isBlocked;
                    const isSelected = isSameDay(date, selectedDate);
                    return (
                      <button
                        key={i}
                        disabled={isDisabled}
                        onClick={() => {
                          if (!isDisabled) {
                            setSelectedDate(date);
                          }
                        }}
                        className={cn(
                          "shrink-0 w-16 h-20 rounded-xl border flex flex-col items-center justify-center transition-all",
                          isSelected ? "border-gold bg-gold/5 text-gold" : "border-white/10 hover:border-white/30",
                          isDisabled && "opacity-30 cursor-not-allowed hover:border-white/10"
                        )}
                      >
                        <span className="text-[10px] uppercase font-bold">{format(date, 'EEE', { locale: ptBR })}</span>
                        <span className="text-xl font-bold">{format(date, 'dd')}</span>
                      </button>
                    );
                  })}
                </div>

                {barbers.length > 1 && (
                  <>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Barbeiros Disponiveis</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      {barbers.map(b => (
                        <button
                          key={b.id}
                          onClick={() => setSelectedBarber(b)}
                          className={cn(
                            "p-3 rounded-xl border flex items-center gap-3 transition-all",
                            selectedBarber?.id === b.id ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/30"
                          )}
                        >
                          {b.avatar && (
                            <img src={b.avatar} alt={b.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                          )}
                          <div className="text-left">
                            <div className="text-sm font-bold">{b.name}</div>
                            <div className="text-[10px] text-white/50">{b.specialty}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Horarios</h4>
                {availabilityLoading && (
                  <p className="text-white/50 mb-4">Carregando disponibilidade...</p>
                )}
                {availabilityError && (
                  <p className="text-red-400 mb-4">{availabilityError}</p>
                )}
                {!selectedBarber && (
                  <p className="text-white/50 mb-4">Selecione um barbeiro para ver os horarios.</p>
                )}

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
                        <span className="font-bold">Morcegão</span>
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
                      <AlertCircle className="text-dark-red shrink-0" size={18} />
                      <p className="text-[10px] text-white/70 leading-relaxed">
                        O cliente deve comparecer ou cancelar com no mínimo 1 hora de antecedência. Faltas sem aviso prévio podem gerar bloqueio de agendamentos futuros.
                      </p>
                    </div>
                  </div>
                </div>
                {bookingError && (
                  <p className="text-red-400 mt-6">{bookingError}</p>
                )}


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
