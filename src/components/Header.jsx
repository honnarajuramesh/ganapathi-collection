import { useAuth } from '../contexts/AuthContext';

export default function Header({ activePage, onNavigate }) {
  const { currentUser, logout, isManager } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'entry', label: 'Add', icon: '➕' },
    { id: 'collections', label: 'List', icon: '📋' },
    ...(isManager ? [{ id: 'users', label: 'Users', icon: '👥' }] : []),
  ];

  return (
    <>
      {/* Top Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 card-3d">
              <span className="text-white font-extrabold text-lg">🪔</span>
            </div>
            <div>
              <p className="font-extrabold text-gray-900 leading-tight" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                Ganapathi Seva
              </p>
              <p className="text-[10px] text-orange-500 font-bold -mt-0.5 tracking-[0.15em] uppercase">
                Collection Tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isManager && (
              <span className="hidden sm:inline-flex text-[10px] px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-bold shadow-md shadow-orange-500/25">
                👑 Manager
              </span>
            )}
            <div className="w-9 h-9 bg-white/80 border border-white/50 rounded-full flex items-center justify-center text-sm font-bold text-orange-600 shadow-sm">
              {currentUser?.name?.charAt(0)}
            </div>
            <button
              onClick={logout}
              className="w-9 h-9 bg-white/80 border border-white/50 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              title="Logout"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Dock Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 safe-bottom pointer-events-none">
        <div className="max-w-lg mx-auto">
          <div className="glass rounded-full p-2 shadow-2xl border border-white/40 pointer-events-auto">
            <div className="flex">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex-1 flex items-center justify-center py-3.5 transition-all duration-300 ${
                    activePage === item.id
                      ? 'text-orange-600 scale-105'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {activePage === item.id && (
                    <span className="absolute inset-x-4 inset-y-0.5 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full -z-10 pop"></span>
                  )}
                  <span className={`text-xl transition-transform duration-300 ${activePage === item.id ? '-translate-y-0.5' : ''}`}>
                    {item.icon}
                  </span>
                  <span className={`text-[9px] font-bold mt-1 absolute bottom-0.5 transition-opacity ${activePage === item.id ? 'opacity-100 text-orange-600' : 'opacity-0'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}