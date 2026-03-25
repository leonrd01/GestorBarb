import React from 'react';
import { motion } from 'motion/react';
import { Scissors, User, Calendar, Clock } from 'lucide-react';
import { SERVICES } from '../constants';

const ServicesSection: React.FC = () => {
  return (
    <section id="services" className="py-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-6">
        <span className="section-subtitle">Nossos Serviços</span>
        <h2 className="section-title">O que fazemos de melhor</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {SERVICES.map((service, idx) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="glass-card group hover:border-gold/50 transition-all duration-500"
            >
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-black transition-all duration-500">
                {service.icon === 'Scissors' && <Scissors size={24} />}
                {service.icon === 'User' && <User size={24} />}
                {service.icon === 'Eye' && <Scissors size={24} />}
                {service.icon === 'Zap' && <Scissors size={24} />}
                {service.icon === 'Calendar' && <Calendar size={24} />}
              </div>
              <h3 className="text-xl font-serif mb-2">{service.name}</h3>
              <p className="text-white/50 text-sm mb-6">{service.description}</p>
              <div className="flex justify-between items-center border-t border-white/10 pt-4">
                <span className="text-gold font-bold text-lg">R$ {service.price.toFixed(2)}</span>
                <span className="text-white/40 text-xs flex items-center gap-1">
                  <Clock size={12} /> {service.duration} min
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
