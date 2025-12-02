import React from 'react';
import { Home, Map, Siren, Bot } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    // h-[100dvh] fixes the mobile browser address bar jump issue
    <div className="flex flex-col h-[100dvh] bg-slate-50 w-full max-w-md mx-auto shadow-2xl overflow-hidden relative">
      
      {/* Header - Safe Area Top aware */}
      <header className="absolute top-0 left-0 right-0 z-30 p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-2 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md p-2 pr-4 rounded-full shadow-sm border border-white/50">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white p-2 rounded-full shadow-md">
                    <Bot size={20} />
                </div>
                <div>
                    <h1 className="font-bold text-slate-800 leading-none text-sm">BunnyHelp</h1>
                    <span className="text-[10px] text-slate-500 font-medium">ผู้ช่วยฉุกเฉิน</span>
                </div>
            </div>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto relative bg-slate-50 scroll-smooth pb-32">
        {children}
      </main>

      {/* Floating Bottom Navigation - Safe Area Bottom aware */}
      <div className="absolute bottom-6 left-4 right-4 z-40 mb-[env(safe-area-inset-bottom)]">
        <nav className="glass rounded-3xl shadow-lg shadow-slate-200/50 border border-white/50 flex justify-around items-center p-2 relative">
          
          <button
            onClick={() => onTabChange('home')}
            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 relative overflow-hidden active:scale-95
                ${activeTab === 'home' ? 'text-red-600' : 'text-slate-400'}`}
          >
            <div className={`transition-transform duration-300 ${activeTab === 'home' ? '-translate-y-1' : ''}`}>
                <Home size={26} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            </div>
            {activeTab === 'home' && (
                <span className="absolute bottom-1.5 w-1 h-1 bg-red-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => onTabChange('sos')}
            className="mx-2 relative -top-6 active:scale-95 transition-transform"
          >
             <div className={`p-1.5 rounded-full bg-slate-50 transition-all duration-300 border border-slate-100/50
                ${activeTab === 'sos' ? 'shadow-red-200' : 'shadow-slate-200'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-500/30 transition-all duration-300
                    ${activeTab === 'sos' ? 'bg-gradient-to-b from-red-500 to-rose-600 scale-110' : 'bg-gradient-to-b from-slate-800 to-slate-700'}`}>
                    <Siren size={32} className={`${activeTab === 'sos' ? 'animate-pulse' : ''}`} />
                </div>
             </div>
             <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500">
                แจ้งเหตุ
             </span>
          </button>

          <button
            onClick={() => onTabChange('map')}
            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 relative overflow-hidden active:scale-95
                ${activeTab === 'map' ? 'text-red-600' : 'text-slate-400'}`}
          >
            <div className={`transition-transform duration-300 ${activeTab === 'map' ? '-translate-y-1' : ''}`}>
                <Map size={26} strokeWidth={activeTab === 'map' ? 2.5 : 2} />
            </div>
            {activeTab === 'map' && (
                <span className="absolute bottom-1.5 w-1 h-1 bg-red-500 rounded-full"></span>
            )}
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Layout;