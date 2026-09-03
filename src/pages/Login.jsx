import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PIN_DOTS = [0, 1, 2, 3, 4, 5];

export default function Login({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [active, setActive] = useState(true);
  const { login } = useAuth();

  function attemptLogin(value) {
    setActive(false);
    const result = login(value);
    setTimeout(() => {
      if (result.success) onLogin(result.user);
      else {
        setError('Invalid PIN. Please try again.');
        setPin('');
        setActive(true);
      }
    }, 500);
  }

  function handleDigit(digit) {
    setError('');
    setPin(prev => {
      if (prev.length < 6) {
        const newPin = prev + digit;
        if (newPin.length === 6) attemptLogin(newPin);
        return newPin;
      }
      return prev;
    });
  }

  function handleDelete() {
    setError('');
    setPin(prev => prev.slice(0, -1));
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src="/bg-ganesh.png" alt="" className="w-full h-full object-cover object-center scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a00]/60 via-[#3b1000]/40 to-[#120500]/80"></div>
      </div>

      {/* Floating decorative orbs */}
      <div className="absolute w-72 h-72 bg-orange-500/30 rounded-full blur-3xl -top-20 -right-20 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-amber-400/20 rounded-full blur-3xl -bottom-32 -left-24"></div>
      <div className="absolute w-40 h-40 bg-purple-500/20 rounded-full blur-2xl top-1/3 left-1/4 animate-bounce"></div>

      <div className={`relative z-10 w-full max-w-sm px-6 ${active ? 'fade-up' : 'opacity-0 scale-90 -translate-y-4 transition-all duration-500'}`}>
        {/* Logo */}
        <div className="text-center mb-8 float">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-orange-400/40 rounded-full blur-xl animate-pulse"></div>
            <div className="relative w-24 h-24 gradient-primary rounded-full flex items-center justify-center border-2 border-white/30 shadow-2xl">
              <span className="text-5xl font-black text-white drop-shadow-lg">🔱</span>
            </div>
          </div>
          <h1 className="mt-5 text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
            Ganapathi Collection
          </h1>
          <p className="mt-2 text-amber-100/80 text-sm tracking-wide">Seva. Devotion. Collecting.</p>
        </div>

        {/* Glass PIN Card */}
        <div className="glass-dark rounded-[28px] p-6 md:p-7 shadow-2xl backdrop-blur-xl">
          <p className="text-center text-white/70 text-sm mb-5 font-medium">Enter your 6-digit PIN</p>

          {/* PIN Dots */}
          <div className="flex justify-center gap-2.5 mb-7">
            {PIN_DOTS.map((i) => (
              <div key={i} className={`relative w-11 h-14 rounded-xl flex items-center justify-center transition-all duration-300 border ${i < pin.length ? 'border-orange-400 bg-gradient-to-b from-orange-400/80 to-orange-600/80 shadow-lg shadow-orange-500/30 scale-105' : 'border-white/20 bg-white/10'} ${i === pin.length && active ? 'animate-pulse' : ''}`}>
                {i < pin.length ? (
                  <div className="w-3 h-3 rounded-full bg-white shimmer"></div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white/20"></div>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-400/30 rounded-2xl backdrop-blur-sm pop">
              <p className="text-red-300 text-sm font-medium text-center">⚠️ {error}</p>
            </div>
          )}

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                className={`h-14 rounded-2xl text-xl font-semibold transition-all duration-150 card-3d ${
                  active
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white/5 text-white/30'
                } border border-white/10 backdrop-blur`}
              >
                {digit}
              </button>
            ))}
            <button
              onClick={() => setPin('')}
              className={`h-14 rounded-2xl text-xs font-medium transition-all duration-150 card-3d ${
                active ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-white/5 text-white/20'
              } border border-white/10`}
            >
              Clear
            </button>
            <button
              onClick={() => handleDigit(0)}
              className={`h-14 rounded-2xl text-xl font-semibold transition-all duration-150 card-3d ${
                active ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-white/20'
              } border border-white/10`}
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className={`h-14 rounded-2xl text-xl transition-all duration-150 card-3d ${
                active ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-white/5 text-white/20'
              } border border-white/10`}
            >
              ⌫
            </button>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-7 tracking-wider">
          ✨ A Sage & Company Production ✨
        </p>
      </div>
    </div>
  );
}