import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Scissors, AlertCircle } from 'lucide-react';
import { ADMIN_CREDENTIALS } from '../constants';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      onLogin();
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md w-full p-10"
      >
        <div className="text-center mb-8">
          <Scissors className="text-gold w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-serif mb-2">Área do Gestor</h2>
          <p className="text-white/50">Entre com suas credenciais de acesso.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs uppercase font-bold text-white/50 block mb-2">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-gold outline-none"
              placeholder="admin@barbearia.com"
            />
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-white/50 block mb-2">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-gold outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-dark-red/20 border border-dark-red/30 rounded-lg flex gap-2 text-xs text-red-400">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full">
            ENTRAR NO PAINEL
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
