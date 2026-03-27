import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import type { Service } from '../types';
import { fetchServices } from '../services/firestore';

const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          setError('Nao foi possivel carregar os servicos.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="services" className="py-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-6">
        <span className="section-subtitle">Nossos Serviços</span>
        <h2 className="section-title">O que fazemos de melhor</h2>
        
        {loading && (
          <p className="text-white/50 mt-8">Carregando servicos...</p>
        )}
        {error && (
          <p className="text-red-400 mt-8">{error}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {!loading && !error && services.map((service, idx) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="glass-card group hover:border-gold/50 transition-all duration-500"
            >
              <h3 className="text-xl font-serif mb-2">{service.name}</h3>
              <div className="flex justify-between items-center border-t border-white/10 pt-4">
                <span className="text-gold font-bold text-lg">R$ {Number(service.price).toFixed(2)}</span>
                <span className="text-white/40 text-xs flex items-center gap-1">
                  <Clock size={12} /> {service.duration}
                </span>
              </div>
            </motion.div>
          ))}
          {!loading && !error && services.length === 0 && (
            <p className="text-white/50">Nenhum servico cadastrado.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
