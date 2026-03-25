import React from 'react';
import { MapPin, Phone, MessageCircle, Instagram, Facebook } from 'lucide-react';

const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-6">
        <span className="section-subtitle">Fale Conosco</span>
        <h2 className="section-title">Onde Estamos</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
          <div className="glass-card">
            <h3 className="text-2xl font-serif mb-8">Informações de Contato</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center text-gold flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="font-bold">Endereço</div>
                  <div className="text-white/60 text-sm">Av. Paulista, 1000 - Bela Vista, São Paulo - SP</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center text-gold flex-shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="font-bold">Telefone</div>
                  <div className="text-white/60 text-sm">(11) 99999-9999</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center text-gold flex-shrink-0">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <div className="font-bold">WhatsApp</div>
                  <div className="text-white/60 text-sm">Atendimento rápido via chat</div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h4 className="text-xs uppercase tracking-widest font-bold text-gold mb-4">Redes Sociais</h4>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-gold hover:text-black transition-all duration-300">
                  <Instagram size={24} />
                </a>
                <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-gold hover:text-black transition-all duration-300">
                  <Facebook size={24} />
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 h-[400px] lg:h-auto min-h-[400px]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.197503123456!2d-46.6521903!3d-23.5645581!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1648000000000!5m2!1spt-BR!2sbr" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
