import { useAuth } from '../contexts/AuthContext';
import { USERS } from '../utils/constants';

const formatINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function UserManagement() {
  const { collections } = useAuth();

  const total = collections.reduce((s, c) => s + (Number(c.amount) || 0), 0);

  function getUserTotal(userId) {
    return collections.filter(c => c.createdBy === userId).reduce((s, c) => s + (Number(c.amount) || 0), 0);
  }

  function getUserEntries(userId) {
    return collections.filter(c => c.createdBy === userId).length;
  }

  return (
    <div className="px-4 pb-6 pt-4 fade-up">
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold text-gray-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>Team & Access</h2>
        <p className="text-sm text-gray-400 mt-1">Login credentials & performance overview</p>
      </div>

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
            <p className="text-xs text-blue-100/70">Across {USERS.length} collectors</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-5">
        {USERS.map((user, idx) => {
          const isManager = user.role === 'manager';
          return (
            <div
              key={user.id}
              className={`glass-card rounded-[28px] p-5 card-3d fade-up ${isManager ? 'ring-2 ring-orange-300/60' : ''}`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                    isManager
                      ? 'gradient-primary'
                      : 'bg-gradient-to-br from-gray-700 to-gray-900'
                  }`}>
                    <span className="text-white font-extrabold text-xl font-display">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    {isManager && (
                      <span className="absolute -top-2 -right-2 text-lg float">👑</span>
                    )}
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                      {user.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isManager
                          ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700'
                          : 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700'
                      }`}>
                        {isManager ? '👑 MANAGER' : 'COLLECTOR'}
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
                  <p className="text-xl font-extrabold text-emerald-700 font-display">{formatINR(getUserTotal(user.id))}</p>
                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wide mt-0.5">💰 Collected</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3.5">
                  <p className="text-xl font-extrabold text-blue-700 font-display">{getUserEntries(user.id)}</p>
                  <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wide mt-0.5">📝 Entries</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}