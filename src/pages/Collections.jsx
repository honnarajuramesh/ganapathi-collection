import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const paymentStyles = {
  cash: { color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600', icon: '💵', label: 'Cash' },
  phonepe: { color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600', icon: '📱', label: 'PhonePe' },
  googlepay: { color: 'bg-sky-500/10 border-sky-500/20 text-sky-600', icon: '💳', label: 'GPay' },
  paytm: { color: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600', icon: '⚡', label: 'Paytm' },
  other: { color: 'bg-gray-500/10 border-gray-500/20 text-gray-600', icon: '💰', label: 'Other' },
};

const formatINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function Collections() {
  const { collections, deleteCollection, updateCollection, isManager } = useAuth();
  const [searchName, setSearchName] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({});

  const filteredCollections = useMemo(() => {
    return collections
      .filter(c => {
        const matchesName = !searchName ||
          c.name?.toLowerCase().includes(searchName.toLowerCase()) ||
          c.collectorName?.toLowerCase().includes(searchName.toLowerCase());
        const matchesDate = !filterDate || c.date === filterDate;
        return matchesName && matchesDate;
      })
      .sort((a, b) => {
        const ta = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0);
        const tb = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0);
        return tb - ta;
      });
  }, [collections, searchName, filterDate]);

  const filteredTotal = filteredCollections.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  function handleEdit(entry) {
    setEditingEntry(entry.id);
    setEditForm({ name: entry.name, amount: entry.amount, paymentMethod: entry.paymentMethod });
  }

  function handleCancelEdit() {
    setEditingEntry(null);
    setEditForm({});
  }

  async function handleSaveEdit(id) {
    try {
      await updateCollection(id, {
        name: editForm.name,
        amount: Number(editForm.amount),
        paymentMethod: editForm.paymentMethod,
      });
      toast.success('Entry updated ✨');
      setEditingEntry(null);
      setEditForm({});
    } catch (error) {
      toast.error('Failed to update entry');
    }
  }

  async function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteCollection(id);
        toast.success('Entry deleted');
      } catch (error) {
        toast.error('Failed to delete entry');
      }
    }
  }

  return (
    <div className="px-4 pb-6 pt-4 fade-up">
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold text-gray-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>Collections</h2>
        <p className="text-sm text-gray-400 mt-1">All entries recorded across the team</p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-4 fade-up" style={{ animationDelay: '100ms' }}>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-12 pr-11 py-4 bg-white/90 border-2 border-transparent rounded-2xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 shadow-sm transition-all duration-300 placeholder:text-gray-300 font-medium"
          />
          {searchName && (
            <button onClick={() => setSearchName('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              ✕
            </button>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">📅</span>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full pl-12 pr-11 py-4 bg-white/90 border-2 border-transparent rounded-2xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 shadow-sm transition-all duration-300 font-medium text-gray-600"
          />
          {filterDate && (
            <button onClick={() => setFilterDate('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              ✕
            </button>
          )}
        </div>
        {(searchName || filterDate) && (
          <button onClick={() => { setSearchName(''); setFilterDate(''); }} className="w-full text-center text-xs font-bold text-orange-500 py-2 hover:text-orange-600 transition-colors">
            ✕ Clear all filters
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="gradient-primary gradient-animate rounded-3xl p-5 flex justify-between items-center shadow-2xl shadow-orange-500/20 mb-5 tilt-in" style={{ animationDelay: '200ms' }}>
        <div>
          <p className="text-white/90 text-xs font-medium tracking-wide">FILTERED RESULTS</p>
          <p className="text-white/70 text-xs mt-0.5">{filteredCollections.length} entries</p>
        </div>
        <p className="font-extrabold text-white text-3xl" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
          {formatINR(filteredTotal)}
        </p>
      </div>

      {/* List */}
      {filteredCollections.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center fade-up">
          <div className="text-6xl mb-4 float">🔍</div>
          <p className="text-gray-500 font-bold text-lg">No entries found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCollections.map((entry, i) => {
            const style = paymentStyles[entry.paymentMethod] || paymentStyles.other;
            return (
              <div
                key={entry.id}
                className="glass-card rounded-3xl overflow-hidden card-3d fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {editingEntry === entry.id ? (
                  <div className="p-4 space-y-3 bg-white/80">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm font-medium"
                      placeholder="Name"
                    />
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm font-medium"
                      placeholder="Amount"
                    />
                    <select
                      value={editForm.paymentMethod}
                      onChange={(e) => setEditForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm font-medium"
                    >
                      <option value="cash">💵 Cash</option>
                      <option value="phonepe">📱 PhonePe</option>
                      <option value="googlepay">💳 Google Pay</option>
                      <option value="paytm">⚡ Paytm</option>
                      <option value="other">💰 Other UPI</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(entry.id)} className="flex-1 gradient-emerald text-white py-3 rounded-xl text-sm font-bold card-3d">
                        💾 Save
                      </button>
                      <button onClick={handleCancelEdit} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-bold card-3d">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                      <span className="text-white font-extrabold text-lg" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                        {entry.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{entry.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <span className="font-medium text-gray-500">{entry.collectorName}</span>
                        <span>•</span>
                        <span>{entry.date}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-gray-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>{formatINR(entry.amount)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 inline-block border ${style.color}`}>
                        {style.icon} {style.label}
                      </span>
                    </div>
                    {isManager && (
                      <div className="flex flex-col gap-1.5 mr-0.5">
                        <button onClick={() => handleEdit(entry)} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors card-3d">
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(entry.id)} className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors card-3d">
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}