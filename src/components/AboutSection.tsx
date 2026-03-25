import React from 'react';
import { motion } from 'motion/react';

interface AboutSectionProps {
  onBooking: () => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ onBooking }) => {
  return (
    <section id="about" className="py-24">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1593702275677-f916c8c79659?q=80&w=2070&auto=format&fit=crop" 
            alt="Barbeiro trabalhando" 
            className="rounded-2xl shadow-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-6 -right-6 bg-gold p-8 rounded-2xl hidden md:block">
            <div className="text-black text-4xl font-serif font-bold">15+</div>
            <div className="text-black text-[10px] uppercase font-bold tracking-widest">Anos de Experiência</div>
          </div>
        </div>
        <div>
          <span className="section-subtitle text-left">Nossa História</span>
          <h2 className="section-title text-left">Tradição e Modernidade em um só lugar</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Fundada em 2010, a Barbearia Premium nasceu com o propósito de resgatar a essência do cuidado masculino clássico, unindo-o às técnicas mais modernas de visagismo.
          </p>
          <p className="text-white/60 mb-8 leading-relaxed">
            Nossa equipe é composta por profissionais altamente qualificados, apaixonados pela arte da barbearia e dedicados a proporcionar não apenas um corte, mas um momento de relaxamento e renovação.
          </p>
          <button onClick={onBooking} className="btn-outline">CONHEÇA NOSSA EQUIPE</button>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
