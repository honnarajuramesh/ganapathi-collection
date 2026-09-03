import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PAYMENT_METHODS, EXPENSE_CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';

const methodIcons = {
  cash: '💵',
  phonepe: '📱',
  googlepay: '💳',
  paytm: '⚡',
  other: '💰',
};

const formatINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

function nowDate() {
  return new Date().toISOString().split('T')[0];
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

const MODES = [
  { id: 'income', label: 'Income', icon: '💰' },
  { id: 'expense', label: 'Expense', icon: '🧾' },
  { id: 'transfer', label: 'Transfer', icon: '🔄' },
];

export default function EntryForm({ onNavigate, initialMode = 'income' }) {
  const [mode, setMode] = useState(initialMode);

  return (
    <div className="px-4 pb-6 pt-5 fade-up">
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold text-gray-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
          New Entry
        </h2>
        <p className="text-sm text-gray-400 mt-1">Record income, expenses or transfers in seconds</p>
      </div>

      {/* Mode Switcher */}
      <div className="glass rounded-2xl p-1.5 flex gap-1 mb-5 fade-up shadow-sm" style={{ animationDelay: '50ms' }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              mode === m.id
                ? 'bg-white text-gray-900 shadow-md scale-[1.02]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'income' && <IncomeForm onNavigate={onNavigate} />}
      {mode === 'expense' && <ExpenseForm onNavigate={onNavigate} />}
      {mode === 'transfer' && <TransferForm onNavigate={onNavigate} />}
    </div>
  );
}

function IncomeForm({ onNavigate }) {
  const { addCollection, currentUser } = useAuth();
  const [formData, setFormData] = useState({ name: '', amount: '', paymentMethod: 'cash' });
  const [loading, setLoading] = useState(false);

  function formatAmount(value) {
    const num = parseInt(value || '0');
    if (isNaN(num)) return '';
    return num.toLocaleString('en-IN');
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleAmountChange(e) {
    const value = e.target.value.replace(/[^\d]/g, '');
    setFormData(prev => ({ ...prev, amount: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter the name');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await addCollection({
        name: formData.name.trim(),
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        createdBy: currentUser.id,
        collectorName: currentUser.name,
        date: new Date().toISOString().split('T')[0],
      });
      toast.success('Entry added successfully! 🎉');
      setFormData({ name: '', amount: '', paymentMethod: 'cash' });
      setTimeout(() => onNavigate('collections'), 1200);
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error('Failed to add entry');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-[32px] p-6 space-y-6 fade-up" style={{ animationDelay: '100ms' }}>
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          👤 Person's Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Type the name here"
          className="w-full px-4 py-4 bg-white/80 border-2 border-transparent rounded-2xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-base font-medium placeholder:text-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          💰 Amount Received
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-extrabold text-orange-500">₹</span>
          <input
            type="text"
            inputMode="numeric"
            name="amount"
            value={formatAmount(formData.amount)}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full pl-11 pr-4 py-4 bg-white/80 border-2 border-transparent rounded-2xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-xl font-extrabold placeholder:text-gray-200 shadow-sm text-gray-900"
            style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}
          />
        </div>
        {formData.amount && (
          <p className="mt-2 ml-1 text-sm font-semibold text-emerald-600 pop">
            ✓ {formatAmount(formData.amount)} rupees recorded
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          📱 Payment Method
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
              className={`relative rounded-2xl border-2 transition-all duration-300 p-3.5 flex items-center justify-center gap-2 font-bold text-sm card-3d ${
                formData.paymentMethod === method.value
                  ? 'border-orange-400 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                  : 'border-gray-100 bg-white/60 text-gray-500 hover:border-orange-200 hover:bg-orange-50'
              }`}
            >
              <span className="text-lg">{methodIcons[method.value]}</span>
              {method.label}
              {formData.paymentMethod === method.value && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md pop">
                  <span className="text-orange-500 text-xs">✓</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full gradient-primary rounded-2xl text-white font-extrabold py-5 transition-all duration-300 card-3d disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-xl shadow-orange-500/30"
        style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Adding...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">➕ Add Entry</span>
        )}
      </button>
    </form>
  );
}

function ExpenseForm({ onNavigate }) {
  const { addExpense, currentUser, getUserBalance } = useAuth();
  const [formData, setFormData] = useState({
    purpose: '',
    amount: '',
    details: '',
    spendDate: nowDate(),
    spendTime: nowTime(),
  });
  const [loading, setLoading] = useState(false);

  const balance = getUserBalance(currentUser?.id);

  function formatAmount(value) {
    const num = parseInt(value || '0');
    if (isNaN(num)) return '';
    return num.toLocaleString('en-IN');
  }

  function handleAmountChange(e) {
    const value = e.target.value.replace(/[^\d]/g, '');
    setFormData(prev => ({ ...prev, amount: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.purpose.trim()) {
      toast.error('Please enter what this expense is for');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!formData.spendDate || !formData.spendTime) {
      toast.error('Please pick when this was spent');
      return;
    }

    setLoading(true);
    try {
      await addExpense({
        purpose: formData.purpose.trim(),
        amount: Number(formData.amount),
        details: formData.details.trim(),
        spendDate: formData.spendDate,
        spendTime: formData.spendTime,
        createdBy: currentUser.id,
        collectorName: currentUser.name,
      });
      toast.success('Expense recorded 📝');
      setFormData({ purpose: '', amount: '', details: '', spendDate: nowDate(), spendTime: nowTime() });
      setTimeout(() => onNavigate('collections'), 1200);
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to record expense');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-[32px] p-6 space-y-6 fade-up" style={{ animationDelay: '100ms' }}>
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">💼 With you right now</span>
        <span className="font-extrabold text-rose-700">{formatINR(balance)}</span>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          🧾 Spent For
        </label>
        <input
          type="text"
          value={formData.purpose}
          onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
          placeholder="e.g. For Prasada items"
          className="w-full px-4 py-4 bg-white/80 border-2 border-transparent rounded-2xl focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all duration-300 text-base font-medium placeholder:text-gray-300 shadow-sm"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, purpose: cat.label }))}
              className="px-3 py-1.5 rounded-full bg-white/70 border border-gray-200 text-xs font-bold text-gray-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          💸 Amount Spent
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-extrabold text-rose-500">₹</span>
          <input
            type="text"
            inputMode="numeric"
            value={formatAmount(formData.amount)}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full pl-11 pr-4 py-4 bg-white/80 border-2 border-transparent rounded-2xl focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all duration-300 text-xl font-extrabold placeholder:text-gray-200 shadow-sm text-gray-900"
            style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          📝 Details <span className="text-gray-400 normal-case font-medium">(optional)</span>
        </label>
        <textarea
          value={formData.details}
          onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
          placeholder="Any extra notes about this expense..."
          rows={2}
          className="w-full px-4 py-3.5 bg-white/80 border-2 border-transparent rounded-2xl focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all duration-300 text-sm font-medium placeholder:text-gray-300 shadow-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
            📅 Spent On
          </label>
          <input
            type="date"
            value={formData.spendDate}
            onChange={(e) => setFormData(prev => ({ ...prev, spendDate: e.target.value }))}
            className="w-full px-3.5 py-3.5 bg-white/80 border-2 border-transparent rounded-2xl focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all duration-300 text-sm font-medium shadow-sm text-gray-700"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
            🕒 At
          </label>
          <input
            type="time"
            value={formData.spendTime}
            onChange={(e) => setFormData(prev => ({ ...prev, spendTime: e.target.value }))}
            className="w-full px-3.5 py-3.5 bg-white/80 border-2 border-transparent rounded-2xl focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all duration-300 text-sm font-medium shadow-sm text-gray-700"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full gradient-rose rounded-2xl text-white font-extrabold py-5 transition-all duration-300 card-3d disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-xl shadow-rose-500/30"
        style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Saving...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">🧾 Add Expense</span>
        )}
      </button>
    </form>
  );
}

function TransferForm({ onNavigate }) {
  const { addTransfer, currentUser, users, getUserBalance } = useAuth();
  const otherUsers = users.filter(u => u.id !== currentUser?.id);
  const [formData, setFormData] = useState({ toUserId: '', amount: '', reason: '' });
  const [loading, setLoading] = useState(false);

  const balance = getUserBalance(currentUser?.id);

  function formatAmount(value) {
    const num = parseInt(value || '0');
    if (isNaN(num)) return '';
    return num.toLocaleString('en-IN');
  }

  function handleAmountChange(e) {
    const value = e.target.value.replace(/[^\d]/g, '');
    setFormData(prev => ({ ...prev, amount: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const recipient = otherUsers.find(u => u.id === formData.toUserId);
    if (!recipient) {
      toast.error('Please choose who to transfer to');
      return;
    }
    const amount = Number(formData.amount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!formData.reason.trim()) {
      toast.error('Please enter a reason for this transfer');
      return;
    }
    if (amount > balance) {
      toast.error(`You only have ${formatINR(balance)} available to transfer`);
      return;
    }

    setLoading(true);
    try {
      await addTransfer({
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        toUserId: recipient.id,
        toUserName: recipient.name,
        amount,
        reason: formData.reason.trim(),
      });
      toast.success(`Transferred to ${recipient.name} ✅`);
      setFormData({ toUserId: '', amount: '', reason: '' });
      setTimeout(() => onNavigate('collections'), 1200);
    } catch (error) {
      console.error('Error transferring funds:', error);
      toast.error('Failed to transfer');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-[32px] p-6 space-y-6 fade-up" style={{ animationDelay: '100ms' }}>
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">💼 Available to send</span>
        <span className="font-extrabold text-indigo-700">{formatINR(balance)}</span>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          👤 Transfer To
        </label>
        {otherUsers.length === 0 ? (
          <p className="text-sm text-gray-400 px-1">No other collectors yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {otherUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, toUserId: user.id }))}
                className={`relative rounded-2xl border-2 transition-all duration-300 p-3.5 flex items-center gap-2.5 font-bold text-sm card-3d ${
                  formData.toUserId === user.id
                    ? 'border-indigo-400 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
                    : 'border-gray-100 bg-white/60 text-gray-500 hover:border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${formData.toUserId === user.id ? 'bg-white/25' : 'bg-gray-900/5'}`}>
                  {user.name?.charAt(0).toUpperCase()}
                </span>
                <span className="truncate">{user.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          💰 Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-extrabold text-indigo-500">₹</span>
          <input
            type="text"
            inputMode="numeric"
            value={formatAmount(formData.amount)}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full pl-11 pr-4 py-4 bg-white/80 border-2 border-transparent rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 text-xl font-extrabold placeholder:text-gray-200 shadow-sm text-gray-900"
            style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          💬 Reason
        </label>
        <input
          type="text"
          value={formData.reason}
          onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
          placeholder="e.g. Combining today's collection"
          className="w-full px-4 py-4 bg-white/80 border-2 border-transparent rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 text-base font-medium placeholder:text-gray-300 shadow-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading || otherUsers.length === 0}
        className="w-full gradient-royal rounded-2xl text-white font-extrabold py-5 transition-all duration-300 card-3d disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-xl shadow-indigo-500/30"
        style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Sending...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">🔄 Transfer Funds</span>
        )}
      </button>
    </form>
  );
}
