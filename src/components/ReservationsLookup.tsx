import React, { useState } from 'react';
import { motion } from 'motion/react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { fetchAppointmentsByPhone, fetchServices } from '../services/firestore';
import type { Appointment, Service } from '../types';

const ReservationsLookup: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const loadServices = async () => {
    try {
      const data = await fetchServices();
      setServices(data);
    } catch {
      setServices([]);
    }
  };

  const handleSearch = async () => {
    const normalized = phone.replace(/\D/g, '').trim();
    if (!normalized) {
      setError('Informe um numero de telefone.');
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (services.length === 0) {
        await loadServices();
      }
      const data = await fetchAppointmentsByPhone(phone);
      const sorted = data.sort((a, b) => {
        const aDate = parse(`${a.date} ${a.time}`, 'yyyy-MM-dd HH:mm', new Date());
        const bDate = parse(`${b.date} ${b.time}`, 'yyyy-MM-dd HH:mm', new Date());
        return bDate.getTime() - aDate.getTime();
      });
      setResults(sorted);
      if (sorted.length === 0) {
        setError('Nenhuma reserva encontrada para este numero.');
      }
    } catch {
      setError('Nao foi possivel buscar as reservas.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (serviceId: string) =>
    services.find((s) => s.id === serviceId)?.name || serviceId;

  return (
    <section className="pt-28 pb-20 bg-black min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-serif mb-4">Minhas Reservas</h1>
          <p className="text-white/60 mb-8">
            Consulte suas reservas informando o seu numero de telefone.
          </p>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 focus:border-gold outline-none"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="btn-primary px-6 disabled:opacity-50"
              >
                {loading ? 'Buscando...' : 'Consultar'}
              </button>
            </div>
            {error && <p className="text-red-400 mt-4">{error}</p>}
          </div>

          <div className="mt-10 space-y-4">
            {results.map((app) => (
              <div
                key={app.id}
                className="glass-card flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <div className="text-sm text-white/50">Servico</div>
                  <div className="text-lg font-bold">{getServiceName(app.serviceId)}</div>
                </div>
                <div>
                  <div className="text-sm text-white/50">Data</div>
                  <div className="font-bold">
                    {format(parse(app.date, 'yyyy-MM-dd', new Date()), "dd 'de' MMMM", {
                      locale: ptBR,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/50">Horario</div>
                  <div className="font-bold">{app.time}</div>
                </div>
                <div>
                  <div className="text-sm text-white/50">Status</div>
                  <span className="text-xs uppercase font-bold px-2 py-1 rounded-full bg-white/10">
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ReservationsLookup;
