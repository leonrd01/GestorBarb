import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <span className="section-subtitle">Depoimentos</span>
        <h2 className="section-title">O que dizem nossos clientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card italic text-white/70 relative">
              <Star className="text-gold absolute -top-3 -left-3 fill-gold" size={24} />
              "A melhor experiência que já tive em uma barbearia. O atendimento é impecável e o ambiente extremamente sofisticado. Recomendo o Ricardo Silva!"
              <div className="mt-6 flex items-center gap-3 not-italic">
                <div className="w-10 h-10 bg-white/10 rounded-full" />
                <div>
                  <div className="text-white font-bold text-sm">Carlos Eduardo</div>
                  <div className="text-gold text-[10px] uppercase font-bold">Cliente VIP</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
