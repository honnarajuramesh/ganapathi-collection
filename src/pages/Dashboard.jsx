import { useAuth } from '../contexts/AuthContext';

const paymentStyles = {
  cash: { color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600', icon: '💵' },
  phonepe: { color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600', icon: '📱' },
  googlepay: { color: 'bg-sky-500/10 border-sky-500/20 text-sky-600', icon: '💳' },
  paytm: { color: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600', icon: '⚡', },
  other: { color: 'bg-gray-500/10 border-gray-500/20 text-gray-600', icon: '💰' },
};

const formatINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

function toMillis(ts) {
  if (!ts) return 0;
  return ts.seconds ? ts.seconds * 1000 : new Date(ts).getTime();
}

function StatCard({ icon, label, value, sub, gradient, delay }) {
  return (
    <div className="glass-card rounded-3xl p-5 card-3d fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-11 h-11 ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
          <span className="text-xl">{icon}</span>
        </div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900 tracking-tight" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function QuickAction({ icon, label, gradient, onClick, delay }) {
  return (
    <button
      onClick={onClick}
      className="glass-card rounded-2xl p-3.5 flex flex-col items-center gap-2 card-3d fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-10 h-10 ${gradient} rounded-xl flex items-center justify-center shadow-md`}>
        <span className="text-lg">{icon}</span>
      </div>
      <span className="text-xs font-bold text-gray-700">{label}</span>
    </button>
  );
}

export default function Dashboard({ onNavigate }) {
  const {
    currentUser, collections, expenses, transfers,
    getTotalCollections, getUserCollections,
    getTotalExpenses, getUserExpenses,
    getUserTransfersIn, getUserTransfersOut, getUserBalance,
  } = useAuth();

  const totalAmount = getTotalCollections();
  const myAmount = getUserCollections(currentUser?.id);
  const totalEntries = collections.length;

  const myExpenses = getUserExpenses(currentUser?.id);
  const totalExpenses = getTotalExpenses();
  const myTransfersIn = getUserTransfersIn(currentUser?.id);
  const myTransfersOut = getUserTransfersOut(currentUser?.id);
  const myBalance = getUserBalance(currentUser?.id);

  const todayISO = new Date().toISOString().split('T')[0];
  const todayEntries = collections.filter(c => c.date === todayISO);
  const todayAmount = todayEntries.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const myEntries = collections.filter(c => c.createdBy === currentUser?.id).length;

  const activity = [
    ...collections.map(c => ({
      type: 'income', id: `c-${c.id}`, title: c.name, sub: c.collectorName,
      amount: c.amount, ts: toMillis(c.createdAt), method: c.paymentMethod,
    })),
    ...expenses.map(e => ({
      type: 'expense', id: `e-${e.id}`, title: e.purpose, sub: e.collectorName,
      amount: e.amount, ts: toMillis(e.capturedAt),
    })),
    ...transfers.map(t => ({
      type: 'transfer', id: `t-${t.id}`, title: `${t.fromUserName} → ${t.toUserName}`, sub: t.reason,
      amount: t.amount, ts: toMillis(t.createdAt),
    })),
  ].sort((a, b) => b.ts - a.ts).slice(0, 6);

  const weekData = collections.reduce((acc, c) => {
    const d = c.date?.slice(5);
    if (d) acc[d] = (acc[d] || 0) + (Number(c.amount) || 0);
    return acc;
  }, {});
  const sortedDays = Object.keys(weekData).sort().slice(-7);
  const maxDay = Math.max(...sortedDays.map(d => weekData[d]), 1);

  const todayDate = new Date();

  return (
    <div className="px-4 pb-6 space-y-5">
      {/* Header */}
      <div className="fade-up pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 card-3d">
              <span className="text-2xl">{currentUser?.role === 'manager' ? '👑' : '🙏'}</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Namaste,</p>
              <h2 className="text-lg font-extrabold text-gray-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                {currentUser?.name}
              </h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{todayDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
            <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${currentUser?.role === 'manager' ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700' : 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700'}`}>
              {currentUser?.role === 'manager' ? '👑 MANAGER' : 'COLLECTOR'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2.5">
        <QuickAction icon="➕" label="Income" gradient="gradient-primary" onClick={() => onNavigate?.('entry', 'income')} delay={30} />
        <QuickAction icon="🧾" label="Expense" gradient="gradient-rose" onClick={() => onNavigate?.('entry', 'expense')} delay={60} />
        <QuickAction icon="🔄" label="Transfer" gradient="gradient-royal" onClick={() => onNavigate?.('entry', 'transfer')} delay={90} />
      </div>

      {/* Hero Card */}
      <div className="gradient-primary gradient-animate rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl shadow-orange-500/25 tilt-in">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-sm"></div>
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-gold-dark/10 rounded-full"></div>
        <div className="absolute top-10 left-1/2 w-px h-40 bg-white/10"></div>

        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <p className="text-orange-100/90 text-sm font-medium tracking-wide">TOTAL COLLECTION</p>
            <span className="text-2xl float">🪔</span>
          </div>
          <p className="text-4xl md:text-5xl font-extrabold mt-1 tracking-tight drop-shadow-md" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
            {formatINR(totalAmount)}
          </p>

          <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-3 gap-2">
            <div>
              <p className="text-[11px] text-orange-100/70">Today</p>
              <p className="font-bold text-base mt-0.5">{formatINR(todayAmount)}</p>
              <p className="text-[10px] text-orange-100/60">{todayEntries.length} entries</p>
            </div>
            <div>
              <p className="text-[11px] text-orange-100/70">Total Entries</p>
              <p className="font-bold text-base mt-0.5">{totalEntries}</p>
              <p className="text-[10px] text-orange-100/60">all time</p>
            </div>
            <div>
              <p className="text-[11px] text-orange-100/70">My Entries</p>
              <p className="font-bold text-base mt-0.5">{myEntries}</p>
              <p className="text-[10px] text-orange-100/60">{currentUser?.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Amount With Me */}
      <div className="gradient-emerald rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl shadow-emerald-500/25 tilt-in" style={{ animationDelay: '80ms' }}>
        <div className="absolute -top-14 -right-14 w-48 h-48 bg-white/10 rounded-full blur-sm"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white/85 text-sm font-medium tracking-wide">💼 AMOUNT WITH ME</p>
            <span className="text-2xl float">🪙</span>
          </div>
          <p className="text-4xl font-extrabold mt-1 tracking-tight drop-shadow-md" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
            {formatINR(myBalance)}
          </p>
          <p className="text-xs text-white/70 mt-2">
            {formatINR(myAmount)} collected
            {myTransfersIn > 0 && ` + ${formatINR(myTransfersIn)} received`}
            {myTransfersOut > 0 && ` − ${formatINR(myTransfersOut)} sent`}
            {myExpenses > 0 && ` − ${formatINR(myExpenses)} spent`}
          </p>
        </div>
      </div>

      {/* My Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="💰"
          label="My Collection"
          value={formatINR(myAmount)}
          gradient="bg-gradient-to-br from-amber-400 to-orange-500"
          delay={100}
        />
        <StatCard
          icon="🧾"
          label="My Expenses"
          value={formatINR(myExpenses)}
          gradient="bg-gradient-to-br from-rose-400 to-red-500"
          delay={150}
        />
        <StatCard
          icon="📈"
          label="My Performance"
          value={`${totalEntries ? ((myEntries / totalEntries) * 100).toFixed(0) : 0}%`}
          sub={`of ${totalEntries} total entries`}
          gradient="bg-gradient-to-br from-blue-400 to-indigo-500"
          delay={200}
        />
        <StatCard
          icon="🏛️"
          label="Team Expenses"
          value={formatINR(totalExpenses)}
          sub="across everyone"
          gradient="bg-gradient-to-br from-purple-400 to-fuchsia-500"
          delay={250}
        />
      </div>

      {/* Mini Bar Chart */}
      {sortedDays.length > 0 && (
        <div className="glass-card rounded-3xl p-5 fade-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-sm">Weekly Activity</h3>
            <span className="text-xs text-gray-400">last {sortedDays.length} days</span>
          </div>
          <div className="flex items-end justify-between gap-1.5 h-24">
            {sortedDays.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="w-full gradient-primary rounded-t-xl transition-all duration-500"
                  style={{
                    height: `${(weekData[day] / maxDay) * 80}px`,
                    animationDelay: `${i * 100}ms`,
                    opacity: 0,
                    animation: 'fadeUp 0.5s forwards',
                  }}
                ></div>
                <span className="text-[9px] text-gray-400 font-medium">{day.slice(3)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="fade-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-gray-900 text-lg" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>Recent Activity</h3>
          <span className="text-xs bg-white/60 backdrop-blur px-2.5 py-1 rounded-full text-gray-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Live
          </span>
        </div>

        {activity.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center">
            <div className="text-5xl mb-3 float">🪔</div>
            <p className="text-gray-400 font-medium">No activity yet</p>
            <p className="text-sm text-gray-400/70 mt-1">Add your first collection to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((item, i) => {
              const isIncome = item.type === 'income';
              const isExpense = item.type === 'expense';
              const style = isIncome ? (paymentStyles[item.method] || paymentStyles.other) : null;

              return (
                <div
                  key={item.id}
                  className="glass-card rounded-3xl p-4 flex items-center gap-3.5 card-3d fade-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                    isIncome ? 'gradient-primary shadow-orange-500/20' : isExpense ? 'gradient-rose shadow-rose-500/20' : 'gradient-royal shadow-indigo-500/20'
                  }`}>
                    {isIncome ? (
                      <span className="text-white font-extrabold text-lg" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                        {item.title?.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-white text-lg">{isExpense ? '🧾' : '🔄'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                      {item.sub && <span className="font-medium text-gray-500 truncate">{item.sub}</span>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-extrabold ${isExpense ? 'text-rose-600' : isIncome ? 'text-gray-900' : 'text-indigo-600'}`} style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                      {isExpense ? '-' : isIncome ? '' : ''}{formatINR(item.amount)}
                    </p>
                    {isIncome && style && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 inline-block border ${style.color}`}>
                        {style.icon}
                      </span>
                    )}
                    {!isIncome && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 inline-block border ${isExpense ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600'}`}>
                        {isExpense ? 'Expense' : 'Transfer'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
