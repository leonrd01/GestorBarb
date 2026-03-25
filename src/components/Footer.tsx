import React from 'react';
import { Scissors, MapPin, Phone, Instagram, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/10 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Scissors className="text-gold w-6 h-6" />
              <span className="text-xl font-serif tracking-tighter font-bold">PREMIUM<span className="text-gold">BARBER</span></span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Elevando o conceito de barbearia a um novo patamar de luxo e sofisticação. Sua melhor versão começa aqui.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-gold mb-6">Horários</h4>
            <ul className="text-sm text-white/60 space-y-2">
              <li className="flex justify-between"><span>Seg - Sex:</span> <span>09:00 - 20:00</span></li>
              <li className="flex justify-between"><span>Sábado:</span> <span>09:00 - 18:00</span></li>
              <li className="flex justify-between text-dark-red"><span>Domingo:</span> <span>Fechado</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-gold mb-6">Localização</h4>
            <div className="text-sm text-white/60 space-y-4">
              <p className="flex gap-3"><MapPin size={18} className="text-gold flex-shrink-0" /> Av. Paulista, 1000 - Bela Vista, São Paulo - SP</p>
              <p className="flex gap-3"><Phone size={18} className="text-gold flex-shrink-0" /> (11) 99999-9999</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-gold mb-6">Siga-nos</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-gold hover:text-black transition-all duration-300">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-gold hover:text-black transition-all duration-300">
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 text-center text-[10px] text-white/20 uppercase tracking-[0.2em]">
          &copy; 2024 Barbearia Premium. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
