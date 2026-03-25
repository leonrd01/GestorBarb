import React, { useState, useEffect } from 'react';
import { Scissors, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface NavbarProps {
  onNavigate: (view: string) => void;
  currentView: string;
  isAdmin: boolean;
  onLogout: () => void;
}

const Navbar = ({ onNavigate, currentView, isAdmin, onLogout }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Início', id: 'home' },
    { label: 'Sobre', id: 'about' },
    { label: 'Serviços', id: 'services' },
    { label: 'Contato', id: 'contact' },
  ];

  const handleNavClick = (id: string) => {
    setIsMobileMenuOpen(false);
    if (id === 'home' && currentView !== 'home') {
      onNavigate('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentView !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-500",
      isScrolled ? "bg-black/90 backdrop-blur-md py-4 border-b border-white/10" : "bg-transparent py-6"
    )}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => handleNavClick('home')}
        >
          <Scissors className="text-gold w-8 h-8" />
          <span className="text-2xl font-serif tracking-tighter font-bold">PREMIUM<span className="text-gold">BARBER</span></span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "text-[10px] uppercase font-bold tracking-widest transition-colors",
                currentView === 'home' ? "text-white/60 hover:text-gold" : "text-white/30 hover:text-white"
              )}
            >
              {item.label}
            </button>
          ))}
          
          <div className="h-4 w-px bg-white/10 mx-2" />
          
          {isAdmin ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('admin')}
                className={cn(
                  "flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-colors",
                  currentView === 'admin' ? "text-gold" : "text-white/60 hover:text-gold"
                )}
              >
                <LayoutDashboard size={14} /> Painel
              </button>
              <button 
                onClick={onLogout}
                className="text-[10px] uppercase font-bold tracking-widest text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
              >
                <LogOut size={14} /> Sair
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('login')}
              className="text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-gold transition-colors"
            >
              Gestor
            </button>
          )}
          
          <button 
            onClick={() => onNavigate('booking')}
            className="btn-primary py-2 px-6 text-[10px]"
          >
            AGENDAR AGORA
          </button>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-black border-b border-white/10 p-6 md:hidden flex flex-col gap-6 animate-in slide-in-from-top duration-300">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="text-left text-sm uppercase font-bold tracking-widest text-white/60"
              >
                {item.label}
              </button>
            ))}
            <div className="h-px bg-white/10 w-full" />
            {isAdmin ? (
              <>
                <button 
                  onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }}
                  className="text-left text-sm uppercase font-bold tracking-widest text-gold flex items-center gap-2"
                >
                  <LayoutDashboard size={16} /> Painel Administrativo
                </button>
                <button 
                  onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                  className="text-left text-sm uppercase font-bold tracking-widest text-red-400 flex items-center gap-2"
                >
                  <LogOut size={16} /> Sair
                </button>
              </>
            ) : (
              <button 
                onClick={() => { onNavigate('login'); setIsMobileMenuOpen(false); }}
                className="text-left text-sm uppercase font-bold tracking-widest text-white/40"
              >
                Área do Gestor
              </button>
            )}
            <button 
              onClick={() => { onNavigate('booking'); setIsMobileMenuOpen(false); }}
              className="btn-primary w-full py-4"
            >
              AGENDAR AGORA
            </button>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
