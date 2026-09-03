import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PAYMENT_METHODS } from '../utils/constants';
import toast from 'react-hot-toast';

const methodIcons = {
  cash: '💵',
  phonepe: '📱',
  googlepay: '💳',
  paytm: '⚡',
  other: '💰',
};

export default function EntryForm({ onNavigate }) {
  const { addCollection, currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    paymentMethod: 'cash'
  });
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
    <div className="px-4 pb-6 pt-5 fade-up">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
          New Entry
        </h2>
        <p className="text-sm text-gray-400 mt-1">Record a collection received in seconds</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-[32px] p-6 space-y-6 fade-up" style={{ animationDelay: '100ms' }}>
        {/* Name Field */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
            👤 Person's Name
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Type the name here"
              className="w-full px-4 py-4 bg-white/80 border-2 border-transparent rounded-2xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-base font-medium placeholder:text-gray-300 shadow-sm"
            />
          </div>
        </div>

        {/* Amount Field */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
            💰 Amount Received
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-extrabold text-orange-500">
              ₹
            </span>
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

        {/* Payment Method */}
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

        {/* Submit */}
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
            <span className="flex items-center justify-center gap-2">
              ➕ Add Entry
            </span>
          )}
        </button>
      </form>
    </div>
  );
}