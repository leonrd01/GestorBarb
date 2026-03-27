import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, MessageCircle } from 'lucide-react';

interface HeroProps {
  onBooking: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBooking }) => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop" 
          alt="Barbershop" 
          className="w-full h-full object-cover opacity-40 scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="section-subtitle">Excelência em cada detalhe</span>
          <h1 className="text-6xl md:text-8xl font-serif mb-6 leading-tight">
            Estilo que <br /> <span className="text-gold italic">Define</span> Você.
          </h1>
          <p className="text-white/60 max-w-xl mx-auto mb-10 text-lg">
            Mais que um corte, uma experiência de sofisticação e cuidado para o homem moderno.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button onClick={onBooking} className="btn-primary flex items-center justify-center gap-2">
              AGENDAR HORÁRIO <ChevronRight size={18} />
            </button>
            <a href="https://wa.me/5511999999999" target="_blank" className="btn-outline flex items-center justify-center gap-2">
              <MessageCircle size={18} /> WHATSAPP
            </a>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-px h-16 bg-linear-to-b from-gold to-transparent" />
      </div>
    </section>
  );
};

export default Hero;
