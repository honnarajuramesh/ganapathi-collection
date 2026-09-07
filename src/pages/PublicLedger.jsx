import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatINR, toMillis, formatDateTime } from '../utils/format';

const paymentStyles = {
  cash: { color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600', icon: '💵', label: 'Cash' },
  phonepe: { color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600', icon: '📱', label: 'PhonePe' },
  googlepay: { color: 'bg-sky-500/10 border-sky-500/20 text-sky-600', icon: '💳', label: 'GPay' },
  paytm: { color: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600', icon: '⚡', label: 'Paytm' },
  other: { color: 'bg-gray-500/10 border-gray-500/20 text-gray-600', icon: '💰', label: 'Other' },
};

function useLiveCollection(name) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, name), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [name]);
  return items;
}

export default function PublicLedger() {
  // Deliberately independent of AuthContext - this route is unauthenticated
  // and must never touch the `users` collection, which holds login PINs.
  const collections = useLiveCollection('collections');
  const expenses = useLiveCollection('expenses');
  const transfers = useLiveCollection('transfers');

  const [selectedCollector, setSelectedCollector] = useState(null);
  const [collectorSearch, setCollectorSearch] = useState('');
  const [incomeSearch, setIncomeSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const totalCollection = collections.reduce((s, c) => s + (Number(c.amount) || 0), 0);

  const collectors = useMemo(() => {
    const map = new Map();
    function ensure(id, name) {
      if (!id) return null;
      if (!map.has(id)) map.set(id, { id, name: name || id, collected: 0, spent: 0, transferIn: 0, transferOut: 0 });
      return map.get(id);
    }
    collections.forEach(c => { const e = ensure(c.createdBy, c.collectorName); if (e) e.collected += Number(c.amount) || 0; });
    expenses.forEach(e2 => { const e = ensure(e2.createdBy, e2.collectorName); if (e) e.spent += Number(e2.amount) || 0; });
    transfers.forEach(t => {
      const from = ensure(t.fromUserId, t.fromUserName);
      if (from) from.transferOut += Number(t.amount) || 0;
      const to = ensure(t.toUserId, t.toUserName);
      if (to) to.transferIn += Number(t.amount) || 0;
    });
    return [...map.values()]
      .map(c => ({ ...c, balance: c.collected + c.transferIn - c.transferOut - c.spent }))
      .sort((a, b) => b.collected - a.collected);
  }, [collections, expenses, transfers]);

  const filteredCollectors = useMemo(() => {
    if (!collectorSearch) return collectors;
    const q = collectorSearch.toLowerCase();
    return collectors.filter(c => c.name?.toLowerCase().includes(q));
  }, [collectors, collectorSearch]);

  const sortedIncome = useMemo(
    () => [...collections].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)),
    [collections]
  );

  const filteredIncome = useMemo(() => {
    if (!incomeSearch) return sortedIncome;
    const q = incomeSearch.toLowerCase();
    return sortedIncome.filter(c =>
      c.name?.toLowerCase().includes(q) || c.collectorName?.toLowerCase().includes(q)
    );
  }, [sortedIncome, incomeSearch]);

  const collectorActivity = useMemo(() => {
    if (!selectedCollector) return [];
    const id = selectedCollector.id;
    return [
      ...collections.filter(c => c.createdBy === id).map(c => ({
        type: 'income', id: `c-${c.id}`, title: c.name, ts: toMillis(c.createdAt), amount: c.amount, method: c.paymentMethod,
      })),
      ...expenses.filter(e => e.createdBy === id).map(e => ({
        type: 'expense', id: `e-${e.id}`, title: e.purpose, ts: toMillis(e.capturedAt), amount: e.amount,
      })),
      ...transfers.filter(t => t.fromUserId === id || t.toUserId === id).map(t => ({
        type: t.fromUserId === id ? 'transfer-out' : 'transfer-in',
        id: `t-${t.id}`,
        title: t.fromUserId === id ? `Sent to ${t.toUserName}` : `Received from ${t.fromUserName}`,
        sub: t.reason,
        ts: toMillis(t.createdAt),
        amount: t.amount,
      })),
    ].sort((a, b) => b.ts - a.ts);
  }, [selectedCollector, collections, expenses, transfers]);

  return (
    <div className="min-h-dvh pb-10 bg-[radial-gradient(ellipse_at_top_right,rgba(255,215,0,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(255,94,98,0.06),transparent_50%)]">
      <header className="glass sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <span className="text-white font-extrabold text-lg">🪔</span>
            </div>
            <div>
              <p className="font-extrabold text-gray-900 leading-tight" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                Ganapathi Seva
              </p>
              <p className="text-[10px] text-orange-500 font-bold -mt-0.5 tracking-[0.15em] uppercase">
                Public Ledger
              </p>
            </div>
          </div>
          <span className="text-xs bg-white/60 backdrop-blur px-2.5 py-1 rounded-full text-gray-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Live
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-5">
        {!selectedCollector && (
          <>
            <div className="fade-up">
              <h2 className="text-2xl font-extrabold text-gray-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                Every rupee, in the open
              </h2>
              <p className="text-sm text-gray-400 mt-1">Anyone with this link can see the full collection history in real time</p>
            </div>

            <div className="gradient-primary gradient-animate rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl shadow-orange-500/25 tilt-in">
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-sm"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-orange-100/90 text-sm font-medium tracking-wide">TOTAL COLLECTION</p>
                  <span className="text-2xl float">🪔</span>
                </div>
                <p className="text-4xl md:text-5xl font-extrabold mt-1 tracking-tight drop-shadow-md" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                  {formatINR(totalCollection)}
                </p>
                <p className="text-xs text-orange-100/70 mt-2">{collections.length} entries · {collectors.length} collectors</p>
              </div>
            </div>

            {/* Collectors */}
            <div className="fade-up" style={{ animationDelay: '100ms' }}>
              <h3 className="font-extrabold text-gray-900 text-lg mb-3" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>Collectors</h3>
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                <input
                  type="text"
                  value={collectorSearch}
                  onChange={(e) => setCollectorSearch(e.target.value)}
                  placeholder="Search a collector..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white/90 border-2 border-transparent rounded-2xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 shadow-sm transition-all duration-300 placeholder:text-gray-300 font-medium"
                />
              </div>

              {filteredCollectors.length === 0 ? (
                <div className="glass-card rounded-3xl p-8 text-center">
                  <p className="text-gray-400 font-medium">No collectors found</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredCollectors.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCollector(c)}
                      className="w-full glass-card rounded-3xl p-4 flex items-center gap-3.5 card-3d fade-up text-left"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                        <span className="text-white font-extrabold text-lg" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                          {c.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{c.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Collected {formatINR(c.collected)} · Spent {formatINR(c.spent)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">With them</p>
                        <p className="font-extrabold text-emerald-600" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>{formatINR(c.balance)}</p>
                      </div>
                      <span className="text-gray-300 text-lg">›</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Income list */}
            <div className="fade-up" style={{ animationDelay: '150ms' }}>
              <h3 className="font-extrabold text-gray-900 text-lg mb-3" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>Collections</h3>
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                <input
                  type="text"
                  value={incomeSearch}
                  onChange={(e) => setIncomeSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white/90 border-2 border-transparent rounded-2xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 shadow-sm transition-all duration-300 placeholder:text-gray-300 font-medium"
                />
              </div>

              {filteredIncome.length === 0 ? (
                <div className="glass-card rounded-3xl p-10 text-center">
                  <div className="text-5xl mb-3 float">🪔</div>
                  <p className="text-gray-400 font-medium">No entries found</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredIncome.map((entry, i) => {
                    const isOpen = expandedId === entry.id;
                    const style = paymentStyles[entry.paymentMethod] || paymentStyles.other;
                    return (
                      <div key={entry.id} className="glass-card rounded-3xl overflow-hidden card-3d fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                        <button
                          onClick={() => setExpandedId(isOpen ? null : entry.id)}
                          className="w-full p-4 flex items-center gap-3.5 text-left"
                        >
                          <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                            <span className="text-white font-extrabold text-lg" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                              {entry.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{entry.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(entry.createdAt)}</p>
                          </div>
                          <p className="font-extrabold text-gray-900 shrink-0" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>{formatINR(entry.amount)}</p>
                          <span className={`text-gray-300 text-lg shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>›</span>
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 pt-0.5 flex items-center gap-2 pop">
                            <span className="text-xs font-bold text-gray-500 bg-white/60 px-3 py-1.5 rounded-full border border-white/50">
                              🙋 Collected by {entry.collectorName}
                            </span>
                            <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${style.color}`}>
                              {style.icon} {style.label}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {selectedCollector && (
          <CollectorDetail
            collector={selectedCollector}
            activity={collectorActivity}
            onBack={() => setSelectedCollector(null)}
          />
        )}
      </main>
    </div>
  );
}

function CollectorDetail({ collector, activity, onBack }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return activity;
    const q = search.toLowerCase();
    return activity.filter(a => a.title?.toLowerCase().includes(q) || a.sub?.toLowerCase().includes(q));
  }, [activity, search]);

  return (
    <div className="fade-up space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
        <span className="text-lg">‹</span> Back to everyone
      </button>

      <div className="gradient-royal rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl tilt-in">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="relative">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-white font-extrabold text-xl">{collector.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="font-extrabold text-xl" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>{collector.name}</p>
              <p className="text-xs text-blue-100/70">{activity.length} transactions</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/20">
            <div>
              <p className="text-[10px] text-blue-100/70 uppercase tracking-wide">Collected</p>
              <p className="font-bold text-base mt-0.5">{formatINR(collector.collected)}</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-100/70 uppercase tracking-wide">Spent</p>
              <p className="font-bold text-base mt-0.5">{formatINR(collector.spent)}</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-100/70 uppercase tracking-wide">With them</p>
              <p className="font-bold text-base mt-0.5">{formatINR(collector.balance)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search their transactions..."
          className="w-full pl-12 pr-4 py-3.5 bg-white/90 border-2 border-transparent rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 shadow-sm transition-all duration-300 placeholder:text-gray-300 font-medium"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center">
          <p className="text-gray-400 font-medium">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item, i) => {
            const isIncome = item.type === 'income';
            const isExpense = item.type === 'expense';
            const style = isIncome ? (paymentStyles[item.method] || paymentStyles.other) : null;
            return (
              <div key={item.id} className="glass-card rounded-3xl p-4 flex items-center gap-3.5 card-3d fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  isIncome ? 'gradient-primary shadow-orange-500/20' : isExpense ? 'gradient-rose shadow-rose-500/20' : 'gradient-royal shadow-indigo-500/20'
                }`}>
                  {isIncome ? (
                    <span className="text-white font-extrabold text-base" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                      {item.title?.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <span className="text-white text-base">{isExpense ? '🧾' : '🔄'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDateTime({ seconds: item.ts / 1000 })}
                    {item.sub ? ` · ${item.sub}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-extrabold ${isExpense || item.type === 'transfer-out' ? 'text-rose-600' : isIncome || item.type === 'transfer-in' ? 'text-gray-900' : 'text-indigo-600'}`} style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                    {isExpense || item.type === 'transfer-out' ? '-' : ''}{formatINR(item.amount)}
                  </p>
                  {isIncome && style && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 inline-block border ${style.color}`}>
                      {style.icon}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
