import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Users, Star, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Appointment, Service, ServiceStatus } from '../types';
import { BARBERS } from '../constants';
import { fetchServices } from '../services/firestore';

interface AdminDashboardProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: ServiceStatus) => void;
  businessHours: any;
  onUpdateBusinessHours: (bh: any) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  appointments, 
  onUpdateStatus, 
  businessHours, 
  onUpdateBusinessHours 
}) => {
  const [activeTab, setActiveTab] = useState('agenda');
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [services, setServices] = useState<Service[]>([]);
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
      }
    };

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  const filteredAppointments = appointments.filter(a => a.date === filterDate);

  const clients = React.useMemo(() => {
    type ClientEntry = {
      id: string;
      name: string;
      phone: string;
      appointments: Appointment[];
      absences: number;
      lastVisit?: { date: string; time: string };
    };

    const map = new Map<string, ClientEntry>();

    appointments.forEach(app => {
      const key = `${app.clientName}__${app.clientPhone}`;
      let entry = map.get(key);
      if (!entry) {
        entry = {
          id: app.clientId || key,
          name: app.clientName,
          phone: app.clientPhone,
          appointments: [],
          absences: 0,
          lastVisit: undefined
        };
        map.set(key, entry);
      }

      entry.appointments.push(app);
      if (app.status === 'Não compareceu') {
        entry.absences += 1;
      }

      if (!entry.lastVisit) {
        entry.lastVisit = { date: app.date, time: app.time };
      } else {
        const current = parse(`${app.date} ${app.time}`, 'yyyy-MM-dd HH:mm', new Date());
        const existing = parse(`${entry.lastVisit.date} ${entry.lastVisit.time}`, 'yyyy-MM-dd HH:mm', new Date());
        if (current.getTime() > existing.getTime()) {
          entry.lastVisit = { date: app.date, time: app.time };
        }
      }

    });

    return Array.from(map.values()).map(c => ({
      ...c,
      status: c.absences >= 2 ? 'Bloqueado' : c.absences === 1 ? 'Alerta' : 'Normal'
    }));
  }, [appointments]);

  const stats = [
    { label: 'Hoje', value: filteredAppointments.length, icon: Calendar },
    { label: 'Clientes', value: clients.length, icon: Users },
    { label: 'Receita', value: 'R$ 1.240', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2">Painel de Gestão</h1>
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", businessHours.daysOpen.includes(new Date().getDay()) ? "bg-green-400 animate-pulse" : "bg-red-400")} />
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
                {businessHours.daysOpen.includes(new Date().getDay()) ? "Barbearia Aberta Hoje" : "Barbearia Fechada Hoje"}
              </span>
            </div>
          </div>
          <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setActiveTab('agenda')}
              className={cn("px-4 py-2 rounded-md text-sm font-bold transition-all", activeTab === 'agenda' ? "bg-gold text-black" : "text-white/50 hover:text-white")}
            >
              AGENDA
            </button>
            <button 
              onClick={() => setActiveTab('clientes')}
              className={cn("px-4 py-2 rounded-md text-sm font-bold transition-all", activeTab === 'clientes' ? "bg-gold text-black" : "text-white/50 hover:text-white")}
            >
              CLIENTES
            </button>
            <button 
              onClick={() => setActiveTab('disponibilidade')}
              className={cn("px-4 py-2 rounded-md text-sm font-bold transition-all", activeTab === 'disponibilidade' ? "bg-gold text-black" : "text-white/50 hover:text-white")}
            >
              DISPONIBILIDADE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((s, i) => (
            <div key={i} className="glass-card flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                <s.icon size={24} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-white/40 font-bold">{s.label}</div>
                <div className="text-2xl font-bold">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {activeTab === 'agenda' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-serif">Horários Marcados</h2>
              <input 
                type="date" 
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm outline-none focus:border-gold"
              />
            </div>
           

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-white/40">
                    <th className="pb-4 font-bold">Horário</th>
                    <th className="pb-4 font-bold">Cliente</th>
                    <th className="pb-4 font-bold">Serviço</th>
                    <th className="pb-4 font-bold">Barbeiro</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAppointments.length > 0 ? filteredAppointments.sort((a,b) => a.time.localeCompare(b.time)).map(app => (
                    <tr key={app.id} className="group hover:bg-white/[0.02]">
                      <td className="py-4 font-bold text-gold">{app.time}</td>
                      <td className="py-4">
                        <div className="font-bold">{app.clientName}</div>
                        <div className="text-xs text-white/40">{app.clientPhone}</div>
                      </td>
                      <td className="py-4 text-sm">{services.find(s => s.id === app.serviceId)?.name}</td>
                      <td className="py-4 text-sm">{BARBERS.find(b => b.id === app.barberId)?.name}</td>
                      <td className="py-4">
                        <span className={cn(
                          "text-[10px] uppercase font-bold px-2 py-1 rounded-full",
                          app.status === 'Confirmado' ? "bg-blue-500/20 text-blue-400" :
                          app.status === 'Compareceu' ? "bg-green-500/20 text-green-400" :
                          app.status === 'Cancelado' ? "bg-red-500/20 text-red-400" :
                          "bg-yellow-500/20 text-yellow-400"
                        )}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <select 
                          value={app.status}
                          onChange={(e) => onUpdateStatus(app.id, e.target.value as ServiceStatus)}
                          className="bg-white/5 border border-white/10 rounded p-1 text-xs outline-none"
                        >
                          <option value="Reservado">Reservado</option>
                          <option value="Confirmado">Confirmado</option>
                          <option value="Compareceu">Compareceu</option>
                          <option value="Cancelado">Cancelado</option>
                          <option value="Não compareceu">Não compareceu</option>
                        </select>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-white/30 italic">Nenhum agendamento para esta data.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'clientes' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-serif">Base de Clientes</h2>
              <div className="text-xs text-white/40">
                Total: <span className="text-white font-bold">{clients.length}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-white/40">
                    <th className="pb-4 font-bold">Cliente</th>
                    <th className="pb-4 font-bold">Contato</th>
                    <th className="pb-4 font-bold">Agendamentos</th>
                    <th className="pb-4 font-bold">Faltas</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold text-right">Ultima Visita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {clients.length > 0 ? clients
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(client => (
                      <tr key={`${client.id}-${client.phone}`} className="group hover:bg-white/[0.02]">
                        <td className="py-4 font-bold">{client.name}</td>
                        <td className="py-4 text-sm text-white/70">{client.phone}</td>
                        <td className="py-4 text-sm">{client.appointments.length}</td>
                        <td className="py-4 text-sm">{client.absences}</td>
                        <td className="py-4">
                          <span className={cn(
                            "text-[10px] uppercase font-bold px-2 py-1 rounded-full",
                            client.status === 'Normal' ? "bg-green-500/20 text-green-400" :
                            client.status === 'Alerta' ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                          )}>
                            {client.status}
                          </span>
                        </td>
                        <td className="py-4 text-right text-sm">
                          {client.lastVisit
                            ? `${format(parse(client.lastVisit.date, 'yyyy-MM-dd', new Date()), "dd/MM")} - ${client.lastVisit.time}`
                            : '--'}
                        </td>
                      </tr>
                    )) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-white/30 italic">
                        Nenhum cliente cadastrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'disponibilidade' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card">
              <h2 className="text-xl font-serif mb-6">Horário de Funcionamento</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase font-bold text-white/50 block mb-2">Abertura</label>
                    <input 
                      type="time" 
                      value={businessHours.open}
                      onChange={e => onUpdateBusinessHours({...businessHours, open: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase font-bold text-white/50 block mb-2">Fechamento</label>
                    <input 
                      type="time" 
                      value={businessHours.close}
                      onChange={e => onUpdateBusinessHours({...businessHours, close: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase font-bold text-white/50 block mb-2">Início Almoço</label>
                    <input 
                      type="time" 
                      value={businessHours.lunchStart}
                      onChange={e => onUpdateBusinessHours({...businessHours, lunchStart: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase font-bold text-white/50 block mb-2">Fim Almoço</label>
                    <input 
                      type="time" 
                      value={businessHours.lunchEnd}
                      onChange={e => onUpdateBusinessHours({...businessHours, lunchEnd: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-white/50 block mb-4">Dias de Atendimento</label>
                  <div className="flex flex-wrap gap-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => {
                      const isActive = businessHours.daysOpen.includes(i);
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            const newDays = isActive 
                              ? businessHours.daysOpen.filter((d: number) => d !== i)
                              : [...businessHours.daysOpen, i];
                            onUpdateBusinessHours({...businessHours, daysOpen: newDays});
                          }}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-xs font-bold transition-all",
                            isActive ? "border-gold bg-gold text-black" : "border-white/10 text-white/40"
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <h2 className="text-xl font-serif mb-6">Bloqueios Especiais</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-xs uppercase font-bold text-white/50 block mb-2">Adicionar Data de Folga</label>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      id="new-blocked-date"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 focus:border-gold outline-none"
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('new-blocked-date') as HTMLInputElement;
                        if (input.value && !businessHours.blockedDates.includes(input.value)) {
                          onUpdateBusinessHours({...businessHours, blockedDates: [...businessHours.blockedDates, input.value]});
                          input.value = '';
                        }
                      }}
                      className="btn-primary px-4"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                  {businessHours.blockedDates.map((date: string) => (
                    <div key={date} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-sm font-bold">{format(parse(date, 'yyyy-MM-dd', new Date()), "dd 'de' MMMM", { locale: ptBR })}</span>
                      <button 
                        onClick={() => onUpdateBusinessHours({...businessHours, blockedDates: businessHours.blockedDates.filter((d: string) => d !== date)})}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/10">
                  <label className="text-xs uppercase font-bold text-white/50 block mb-2">Bloqueio Manual de Horário</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="date" id="manual-block-date" className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-gold outline-none" />
                    <input type="time" id="manual-block-time" className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-gold outline-none" />
                  </div>
                  <button 
                    onClick={() => {
                      const dateInput = document.getElementById('manual-block-date') as HTMLInputElement;
                      const timeInput = document.getElementById('manual-block-time') as HTMLInputElement;
                      if (dateInput.value && timeInput.value) {
                        onUpdateBusinessHours({
                          ...businessHours, 
                          manualBlockedSlots: [...businessHours.manualBlockedSlots, { date: dateInput.value, time: timeInput.value }]
                        });
                        dateInput.value = '';
                        timeInput.value = '';
                      }
                    }}
                    className="btn-outline w-full py-2 text-xs"
                  >
                    BLOQUEAR HORÁRIO
                  </button>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                  {businessHours.manualBlockedSlots.map((slot: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="text-xs">
                        <span className="font-bold">{format(parse(slot.date, 'yyyy-MM-dd', new Date()), "dd/MM")}</span>
                        <span className="mx-2 text-white/30">|</span>
                        <span>{slot.time}</span>
                      </div>
                      <button 
                        onClick={() => onUpdateBusinessHours({...businessHours, manualBlockedSlots: businessHours.manualBlockedSlots.filter((_: any, idx: number) => idx !== i)})}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
