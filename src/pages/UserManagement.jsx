import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { friendlyError } from '../utils/errors';
import toast from 'react-hot-toast';

const formatINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function UserManagement() {
  const {
    users, collections, isManager,
    getUserCollections, getUserExpenses, getUserBalance,
    addCollector, suggestPin,
  } = useAuth();

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', pin: '', role: 'collector' });
  const [saving, setSaving] = useState(false);

  const total = collections.reduce((s, c) => s + (Number(c.amount) || 0), 0);

  function openAddForm() {
    setForm({ name: '', pin: suggestPin(), role: 'collector' });
    setShowAddForm(true);
  }

  async function handleAddCollector(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await addCollector(form);
      toast.success(`${form.name.trim()} added ✨`);
      setShowAddForm(false);
    } catch (error) {
      toast.error(friendlyError(error, 'Failed to add collector'));
    }
    setSaving(false);
  }

  return (
    <div className="px-4 pb-6 pt-4 fade-up">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>Team & Access</h2>
          <p className="text-sm text-gray-400 mt-1">Login credentials & performance overview</p>
        </div>
        {isManager && (
          <button
            onClick={openAddForm}
            className="shrink-0 gradient-primary text-white text-sm font-bold px-4 py-3 rounded-2xl shadow-lg shadow-orange-500/30 card-3d flex items-center gap-1.5"
          >
            ➕ Add
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCollector} className="glass-card rounded-[28px] p-5 space-y-4 mb-5 pop">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>New Collector</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="w-7 h-7 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              ✕
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">👤 Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Collector's name"
              className="w-full px-4 py-3.5 bg-white/80 border-2 border-transparent rounded-2xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-base font-medium placeholder:text-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">🔑 Login PIN</label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={form.pin}
                onChange={(e) => setForm(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
                className="flex-1 px-4 py-3.5 bg-white/80 border-2 border-transparent rounded-2xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-base font-mono font-bold tracking-widest shadow-sm"
              />
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, pin: suggestPin() }))}
                className="px-4 rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                🎲
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">🎭 Role</label>
            <div className="grid grid-cols-2 gap-2.5">
              {['collector', 'manager'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, role }))}
                  className={`rounded-2xl border-2 transition-all duration-300 p-3 font-bold text-sm card-3d ${
                    form.role === role
                      ? 'border-orange-400 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                      : 'border-gray-100 bg-white/60 text-gray-500 hover:border-orange-200'
                  }`}
                >
                  {role === 'manager' ? '👑 Manager' : 'Collector'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full gradient-primary rounded-2xl text-white font-extrabold py-4 transition-all duration-300 card-3d disabled:opacity-50 shadow-xl shadow-orange-500/30"
          >
            {saving ? 'Adding...' : '✅ Create Collector'}
          </button>
        </form>
      )}

      {/* Total Hero */}
      <div className="gradient-royal rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl tilt-in">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-14 -left-8 w-52 h-52 bg-white/5 rounded-full"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="text-blue-100/80 text-sm font-medium">TEAM COLLECTION</p>
            <span className="text-2xl float">🎊</span>
          </div>
          <p className="text-4xl font-extrabold mt-2 font-display" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
            {formatINR(total)}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <p className="text-xs text-blue-100/70">Across {users.length} collectors</p>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center mt-5">
          <div className="text-5xl mb-3 float">👥</div>
          <p className="text-gray-400 font-medium">Loading team...</p>
        </div>
      ) : (
        <div className="space-y-4 mt-5">
          {users.map((user, idx) => {
            const userIsManager = user.role === 'manager';
            const collected = getUserCollections(user.id);
            const spent = getUserExpenses(user.id);
            const balance = getUserBalance(user.id);
            return (
              <div
                key={user.id}
                className={`glass-card rounded-[28px] p-5 card-3d fade-up ${userIsManager ? 'ring-2 ring-orange-300/60' : ''}`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                      userIsManager ? 'gradient-primary' : 'bg-gradient-to-br from-gray-700 to-gray-900'
                    }`}>
                      <span className="text-white font-extrabold text-xl font-display">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                      {userIsManager && (
                        <span className="absolute -top-2 -right-2 text-lg float">👑</span>
                      )}
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                        {user.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          userIsManager
                            ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700'
                            : 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700'
                        }`}>
                          {userIsManager ? '👑 MANAGER' : 'COLLECTOR'}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{user.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PIN */}
                <div className="mt-4 bg-white/60 rounded-2xl p-3.5 border border-white/50 backdrop-blur">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">🔑 Login PIN</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-gray-900 tracking-[0.25em] text-base bg-white px-4 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                        {user.pin}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5">
                    <p className="text-xl font-extrabold text-emerald-700 font-display">{formatINR(collected)}</p>
                    <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wide mt-0.5">💰 Collected</p>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3.5">
                    <p className="text-xl font-extrabold text-rose-700 font-display">{formatINR(spent)}</p>
                    <p className="text-[10px] font-bold text-rose-600/70 uppercase tracking-wide mt-0.5">🧾 Spent</p>
                  </div>
                </div>
                <div className="mt-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-wide">💼 With Them Now</p>
                    <p className="text-lg font-extrabold text-indigo-700 font-display">{formatINR(balance)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
