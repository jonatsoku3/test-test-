
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import MapComponent from './components/MapComponent';
import { EMERGENCY_CONTACTS, MOCK_ALERTS_NEARBY, calculateDistance } from './constants';
import { Alert, EmergencyType, Location, AiAnalysisResult, EmergencyPriority } from './types';
import { analyzeEmergency } from './services/geminiService';
import { 
  Phone, AlertTriangle, Shield, Car, Heart, Flame, Send, Loader2, MapPin, 
  Bell, Bot, Siren, X, Radio, Navigation, Footprints, Camera,
  Wrench, Waves, Dog, UserX, Zap, AlertOctagon, ImagePlus, ChevronRight, User, PhoneCall, CheckCircle
} from 'lucide-react';

// --- Sound Utility ---
const playAlertSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const startTime = ctx.currentTime;
    
    // Emergency "Two-Tone" Siren Sound
    osc.type = 'sawtooth';
    
    // Beep 1 (High)
    osc.frequency.setValueAtTime(880, startTime);
    osc.frequency.linearRampToValueAtTime(880, startTime + 0.15);
    
    // Beep 2 (Low)
    osc.frequency.setValueAtTime(650, startTime + 0.15);
    osc.frequency.linearRampToValueAtTime(650, startTime + 0.3);

    // Beep 3 (High)
    osc.frequency.setValueAtTime(880, startTime + 0.3);
    osc.frequency.linearRampToValueAtTime(880, startTime + 0.45);
    
    // Beep 4 (Low)
    osc.frequency.setValueAtTime(650, startTime + 0.45);
    osc.frequency.linearRampToValueAtTime(650, startTime + 0.6);

    // Volume Envelope
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.linearRampToValueAtTime(0.1, startTime + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

    osc.start(startTime);
    osc.stop(startTime + 0.8);

  } catch (error) {
    console.error("Failed to play alert sound:", error);
  }
};

// --- Sub-components ---

const IncomingAlertOverlay = ({ 
  alert, 
  userLocation, 
  onClose, 
  onStartNavigation 
}: { 
  alert: Alert, 
  userLocation: Location | null, 
  onClose: () => void, 
  onStartNavigation: (location: Location) => void 
}) => {
  if (!alert) return null;
  const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, alert.location.lat, alert.location.lng) : 0;
  
  // Enforce 5km rule: Do not show full screen overlay if > 5km
  if (distance > 5) return null;

  const getPriorityColor = (p: EmergencyPriority) => {
    switch (p) {
        case 'CRITICAL': return 'bg-red-600 text-white shadow-red-500/50';
        case 'HIGH': return 'bg-orange-500 text-white shadow-orange-500/50';
        case 'MEDIUM': return 'bg-yellow-500 text-white shadow-yellow-500/50';
        default: return 'bg-blue-500 text-white shadow-blue-500/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 border border-white/20">
        
        {/* Animated Background Header */}
        <div className="bg-red-600 h-32 relative overflow-hidden flex flex-col items-center justify-center text-white">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
           <div className="absolute w-64 h-64 bg-red-500 rounded-full blur-3xl -top-32 animate-pulse opacity-50"></div>
           
           <div className="relative z-10 flex flex-col items-center">
             <div className="bg-white/20 p-3 rounded-full backdrop-blur-md mb-2 shadow-lg ring-4 ring-white/10 animate-bounce">
                <Siren size={32} />
             </div>
             <h2 className="font-bold text-xl tracking-tight">ขอความช่วยเหลือ!</h2>
             <span className="text-red-100 text-xs font-medium bg-red-700/50 px-2 py-0.5 rounded-full mt-1">Emergency Alert</span>
           </div>

           <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white active:bg-white/10 p-2 rounded-full transition-colors">
             <X size={20} />
           </button>
        </div>
        
        {/* Content */}
        <div className="p-6 pt-8 -mt-6 bg-white rounded-t-3xl relative">
           <div className="absolute top-0 right-6 -translate-y-1/2">
                <div className={`px-4 py-1.5 rounded-full font-bold text-xs shadow-lg ${getPriorityColor(alert.priority)}`}>
                    LEVEL: {alert.priority}
                </div>
           </div>

           <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg
                  ${alert.type === EmergencyType.MEDICAL ? 'bg-red-50 text-red-500' : 
                    alert.type === EmergencyType.POLICE ? 'bg-indigo-50 text-indigo-500' : 
                    'bg-orange-50 text-orange-500'}`}>
                   {alert.type === EmergencyType.MEDICAL ? <Heart size={28} /> : 
                    alert.type === EmergencyType.POLICE ? <Shield size={28} /> : 
                    <AlertTriangle size={28} />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800 text-lg leading-none">{alert.type}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                   <Navigation size={12} className="text-blue-500" />
                   <span>ห่าง <strong>{distance.toFixed(1)}</strong> กม.</span>
                </div>
              </div>
           </div>
           
           <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8 relative">
             <div className="flex items-start gap-3">
                <div className="bg-slate-200 p-1.5 rounded-full mt-0.5">
                    <User size={14} className="text-slate-500"/>
                </div>
                <div>
                    <p className="text-slate-700 font-medium text-sm leading-relaxed">
                        "{alert.description}"
                    </p>
                    <p className="text-slate-400 text-xs mt-2 font-medium">{alert.reporterName}</p>
                </div>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <button onClick={onClose} className="py-3.5 text-slate-500 font-semibold bg-slate-50 active:bg-slate-100 rounded-2xl transition-colors border border-transparent">
               ละเว้น
             </button>
             <button onClick={() => onStartNavigation(alert.location)} className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-bold py-3.5 shadow-lg shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2">
               <Navigation size={18} /> ไปช่วยเหลือ
             </button>
           </div>
        </div>
      </div>
    </div>
  )
}

// 1. Home / Dashboard
const Dashboard = ({ 
  userLocation, 
  alerts, 
  onNavigateToMap, 
  onNavigateToSOS,
  onStartNavigation,
  onSimulateAlert,
  isSimulatingWalk,
  onToggleWalk
}: { 
  userLocation: Location | null, 
  alerts: Alert[], 
  onNavigateToMap: () => void,
  onNavigateToSOS: () => void,
  onStartNavigation: (location: Location) => void,
  onSimulateAlert: () => void,
  isSimulatingWalk: boolean,
  onToggleWalk: () => void
}) => {
  // Only show alerts within 5km to avoid noise
  const nearbyAlerts = alerts.filter(a => userLocation ? calculateDistance(userLocation.lat, userLocation.lng, a.location.lat, a.location.lng) < 5 : true);

  const getPriorityBadgeStyle = (p: EmergencyPriority) => {
      switch (p) {
        case 'CRITICAL': return 'bg-red-100 text-red-700';
        case 'HIGH': return 'bg-orange-100 text-orange-700';
        case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
        default: return 'bg-slate-100 text-slate-600';
      }
  };

  return (
    <div className="pt-[calc(6rem+env(safe-area-inset-top))] px-6 pb-40 space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">สวัสดี, ฮีโร่! 👋</h2>
            <p className="text-slate-500 text-sm">วันนี้คุณปลอดภัยดีไหม?</p>
        </div>
        <div className="text-right">
             <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Online
             </div>
        </div>
      </div>

      {/* Main Action Banner */}
      <div 
        onClick={onNavigateToSOS}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-red-500 to-pink-600 shadow-xl shadow-red-200 p-6 text-white cursor-pointer active:scale-95 transition-transform duration-300"
      >
        <div className="absolute -right-10 -bottom-10 opacity-20">
            <Radio size={180} />
        </div>
        <div className="relative z-10 flex flex-col items-start gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-inner border border-white/10">
                <Siren size={32} className="animate-pulse" />
            </div>
            <div>
                <h3 className="text-2xl font-bold leading-tight">ขอความช่วยเหลือ<br/>ฉุกเฉินด่วน</h3>
                <p className="text-red-100 text-sm mt-1 opacity-90">แจ้งเหตุทันทีเพื่อรับความช่วยเหลือ</p>
            </div>
            <div className="mt-2 bg-white text-red-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
                กดแจ้งเหตุ <ChevronRight size={16} />
            </div>
        </div>
      </div>

      {/* Emergency Contacts Grid */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Phone size={18} className="text-slate-400"/> เบอร์โทรฉุกเฉิน
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {EMERGENCY_CONTACTS.map((contact) => (
            <a 
              key={contact.number}
              href={`tel:${contact.number}`}
              className="group bg-white p-3 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 active:bg-slate-50 active:scale-95 active:border-green-200 transition-all relative overflow-hidden"
            >
              <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${contact.color}`}>
                      <Phone size={18} className="fill-current" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-lg leading-none">{contact.number}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-1">{contact.name}</div>
                  </div>
              </div>
              <div className="text-slate-200 group-active:text-green-500 transition-colors">
                  <PhoneCall size={20} />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Nearby Feed */}
      <div>
        <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Radio size={18} className="text-slate-400"/> เหตุการณ์ใกล้ตัว (5 กม.)
             </h3>
             <button onClick={onNavigateToMap} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full active:bg-blue-100 transition-colors">
                ดูทั้งหมด
             </button>
        </div>
        
        <div className="space-y-4">
            {nearbyAlerts.length === 0 ? (
                <div className="text-center py-10 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield size={24} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium text-sm">พื้นที่ของคุณปลอดภัย</p>
                    <p className="text-slate-400 text-xs mt-1">ไม่มีการแจ้งเตือนในระยะ 5 กม.</p>
                </div>
            ) : (
                nearbyAlerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 relative overflow-hidden">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 
                            ${alert.type === EmergencyType.MEDICAL ? 'bg-red-50 text-red-500' : 
                              alert.type === EmergencyType.POLICE ? 'bg-indigo-50 text-indigo-500' : 
                              'bg-orange-50 text-orange-500'}`}>
                            {alert.type === EmergencyType.MEDICAL ? <Heart size={20} /> : 
                             alert.type === EmergencyType.POLICE ? <Shield size={20} /> : 
                             alert.type === EmergencyType.CAR ? <Car size={20} /> : <AlertTriangle size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-slate-800 text-sm truncate pr-2">{alert.description}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getPriorityBadgeStyle(alert.priority)}`}>
                                    {alert.priority}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-400 whitespace-nowrap bg-slate-50 px-1.5 py-0.5 rounded">
                                    {calculateDistance(userLocation?.lat || 0, userLocation?.lng || 0, alert.location.lat, alert.location.lng).toFixed(1)} km
                                </span>
                                <span className="text-xs text-slate-500 line-clamp-1">
                                    แจ้งโดย {alert.reporterName}
                                </span>
                            </div>
                            <button 
                                onClick={() => onStartNavigation(alert.location)}
                                className="mt-3 w-full bg-slate-50 text-slate-600 text-xs font-bold py-2 rounded-xl active:bg-slate-200 flex items-center justify-center gap-1 transition-colors"
                            >
                                <Navigation size={12} /> ช่วยเหลือ
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Dev Tools (Hidden visually but accessible) */}
      <div className="pt-8 opacity-50 hover:opacity-100 transition-opacity pb-8">
        <div className="flex justify-center gap-3">
            <button onClick={onSimulateAlert} className="text-[10px] text-slate-400 border border-slate-200 px-3 py-1 rounded-lg">Simulate Alert</button>
            <button onClick={onToggleWalk} className={`text-[10px] border px-3 py-1 rounded-lg ${isSimulatingWalk ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-slate-400 border-slate-200'}`}>
                {isSimulatingWalk ? 'Walking...' : 'Simulate Walk'}
            </button>
        </div>
      </div>
    </div>
  );
};

// 2. SOS / Report Page
const SOSPage = ({ 
    userLocation, 
    onSubmitReport 
}: { 
    userLocation: Location | null, 
    onSubmitReport: (type: EmergencyType, desc: string, priority: EmergencyPriority) => void 
}) => {
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<EmergencyPriority>('MEDIUM');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(null);

    const handleAnalysis = async () => {
        if (!description.trim()) return;
        setIsAnalyzing(true);
        const result = await analyzeEmergency(description);
        setAnalysis(result);
        if (result && result.severity) {
            setPriority(result.severity);
        }
        setIsAnalyzing(false);
    };

    const handleConfirm = () => {
        if (analysis) {
            onSubmitReport(analysis.category, description, analysis.severity);
        } else {
            onSubmitReport(EmergencyType.GENERAL, description, priority);
        }
    };

    const QUICK_ACTIONS = [
        { label: 'อุบัติเหตุ', icon: <Car size={24} />, type: EmergencyType.MEDICAL, desc: 'อุบัติเหตุรถชน', priority: 'CRITICAL', color: 'bg-red-50 text-red-600 border-red-100' },
        { label: 'เจ็บป่วย', icon: <Heart size={24} />, type: EmergencyType.MEDICAL, desc: 'ผู้ป่วยฉุกเฉิน', priority: 'HIGH', color: 'bg-rose-50 text-rose-600 border-rose-100' },
        { label: 'ไฟไหม้', icon: <Flame size={24} />, type: EmergencyType.FIRE, desc: 'เพลิงไหม้', priority: 'CRITICAL', color: 'bg-orange-50 text-orange-600 border-orange-100' },
        { label: 'รถเสีย', icon: <Wrench size={24} />, type: EmergencyType.CAR, desc: 'รถเสีย', priority: 'MEDIUM', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
        { label: 'โจร/ขโมย', icon: <Shield size={24} />, type: EmergencyType.POLICE, desc: 'ขโมย/ผู้บุกรุก', priority: 'HIGH', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
        { label: 'ทำร้าย', icon: <AlertOctagon size={24} />, type: EmergencyType.POLICE, desc: 'ทำร้ายร่างกาย', priority: 'CRITICAL', color: 'bg-purple-50 text-purple-600 border-purple-100' },
        { label: 'น้ำท่วม', icon: <Waves size={24} />, type: EmergencyType.GENERAL, desc: 'น้ำท่วม', priority: 'HIGH', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
        { label: 'สัตว์ร้าย', icon: <Dog size={24} />, type: EmergencyType.GENERAL, desc: 'สัตว์มีพิษ', priority: 'HIGH', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        { label: 'ไฟฟ้า', icon: <Zap size={24} />, type: EmergencyType.FIRE, desc: 'ไฟฟ้าลัดวงจร', priority: 'HIGH', color: 'bg-amber-50 text-amber-600 border-amber-100' },
        { label: 'คนหาย', icon: <UserX size={24} />, type: EmergencyType.POLICE, desc: 'คนหาย', priority: 'HIGH', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    ];

    const PRIORITIES: { val: EmergencyPriority, label: string, color: string }[] = [
        { val: 'LOW', label: 'ต่ำ', color: 'bg-slate-200 text-slate-600 border-slate-300' },
        { val: 'MEDIUM', label: 'กลาง', color: 'bg-yellow-200 text-yellow-800 border-yellow-300' },
        { val: 'HIGH', label: 'สูง', color: 'bg-orange-200 text-orange-800 border-orange-300' },
        { val: 'CRITICAL', label: 'วิกฤต', color: 'bg-red-200 text-red-800 border-red-300' },
    ];

    return (
        <div className="pt-[calc(6rem+env(safe-area-inset-top))] px-6 pb-40 h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">เกิดอะไรขึ้น?</h2>
                <p className="text-slate-500 text-sm">เลือกหมวดหมู่หรือพิมพ์บอกเรา</p>
            </div>

            {!analysis ? (
                <div className="flex-1 flex flex-col gap-6">
                    {/* Input Area */}
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                        <textarea
                            className="w-full p-2 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none min-h-[80px] text-base resize-none"
                            placeholder="พิมพ์รายละเอียด (ถ้ามี)..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                         {/* Priority Selector */}
                        <div className="flex gap-2 mt-2 mb-2 overflow-x-auto pb-2">
                            {PRIORITIES.map((p) => (
                                <button
                                    key={p.val}
                                    onClick={() => setPriority(p.val)}
                                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${priority === p.val ? p.color + ' ring-2 ring-offset-1 ring-slate-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                             <button className="text-slate-500 active:text-red-500 bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors">
                                <Camera size={16} /> ถ่ายรูป
                             </button>
                             {description.length > 3 && (
                                <button
                                    onClick={handleAnalysis}
                                    disabled={isAnalyzing}
                                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 active:scale-95 transition-transform"
                                >
                                    {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
                                    วิเคราะห์
                                </button>
                             )}
                        </div>
                    </div>

                    <div className="flex-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">หมวดหมู่ด่วน</p>
                        <div className="grid grid-cols-2 gap-3 pb-8">
                            {QUICK_ACTIONS.map((action, index) => (
                                <button 
                                    key={index}
                                    onClick={() => onSubmitReport(action.type, action.desc, action.priority as EmergencyPriority)} 
                                    className={`p-4 rounded-2xl flex items-center gap-3 border transition-all active:scale-95 ${action.color} bg-white`}
                                >
                                    <div className={`p-2 rounded-xl bg-white/50 backdrop-blur-sm`}>
                                        {action.icon}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold text-sm">{action.label}</span>
                                        <span className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded ${
                                            action.priority === 'CRITICAL' ? 'bg-red-200 text-red-700' :
                                            action.priority === 'HIGH' ? 'bg-orange-200 text-orange-700' :
                                            action.priority === 'MEDIUM' ? 'bg-yellow-200 text-yellow-700' : 'bg-slate-200 text-slate-600'
                                        }`}>{action.priority}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col animate-in slide-in-from-bottom-5">
                    <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-slate-900 text-white p-2 rounded-xl"><Bot size={20} /></div>
                                <span className="font-bold text-slate-800">AI Analysis</span>
                            </div>
                            
                            <div className="mb-6">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-3 shadow-sm
                                    ${analysis.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-100' : 
                                    analysis.severity === 'HIGH' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                    <span className={`w-2 h-2 rounded-full ${analysis.severity === 'CRITICAL' ? 'bg-red-600' : analysis.severity === 'HIGH' ? 'bg-orange-600' : 'bg-green-600'}`}></span>
                                    ความรุนแรง: {analysis.severity}
                                </span>
                                <h3 className="text-xl font-bold text-slate-800 leading-tight">{analysis.summary}</h3>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl text-slate-600 text-sm leading-relaxed mb-6 border border-slate-100">
                                {analysis.advice}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto space-y-3 pb-8">
                        <button
                            onClick={handleConfirm}
                            className="bg-gradient-to-r from-red-600 to-rose-600 text-white w-full py-4 rounded-2xl font-bold text-lg shadow-lg shadow-red-200 active:scale-95 transition-transform flex items-center justify-center gap-3"
                        >
                            <Siren size={24} className="animate-pulse" />
                            ยืนยันแจ้งเหตุ
                        </button>
                        <button
                            onClick={() => setAnalysis(null)}
                            className="bg-white text-slate-500 w-full py-4 rounded-2xl font-bold text-sm active:bg-slate-50"
                        >
                            แก้ไขข้อมูล
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


// Main App Component
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [incomingAlert, setIncomingAlert] = useState<Alert | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [isSimulatingWalk, setIsSimulatingWalk] = useState(false);

  // Sound Effect Trigger
  useEffect(() => {
    if (incomingAlert) {
        playAlertSound();
    }
  }, [incomingAlert]);

  useEffect(() => {
    const initialAlerts = MOCK_ALERTS_NEARBY.map(a => ({...a, location: {lat: a.location.lat, lng: a.location.lng}} as Alert));
    setAlerts(initialAlerts);

    let watchId: number;

    if (isSimulatingWalk) {
        const interval = setInterval(() => {
            setUserLocation(prev => {
                if (!prev) return { lat: 13.7563, lng: 100.5018 };
                return {
                    lat: prev.lat + 0.00008, 
                    lng: prev.lng + 0.00008  
                };
            });
        }, 1000);
        return () => clearInterval(interval);
    }

    if (navigator.geolocation && !isSimulatingWalk) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location", error);
          if (!userLocation) {
             setUserLocation({ lat: 13.7563, lng: 100.5018 }); 
          }
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    } else {
        if (!userLocation) setUserLocation({ lat: 13.7563, lng: 100.5018 }); 
    }

    return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isSimulatingWalk]);

  const simulateIncomingAlert = () => {
        if (!userLocation) return;
        // Randomize location slightly to test distance logic
        // 0.045 lat/lng is roughly 5km. 
        // We put it close enough (approx 0.005 ~ 500m) to show the overlay by default
        const offsetLat = (Math.random() - 0.5) * 0.01; 
        const offsetLng = (Math.random() - 0.5) * 0.01;
        
        const newAlert: Alert = {
            id: `sim-${Date.now()}`,
            type: EmergencyType.FIRE,
            priority: 'CRITICAL',
            description: 'ทดสอบแจ้งเตือนเหตุเพลิงไหม้ (Simulation)',
            location: { 
                lat: userLocation.lat + offsetLat, 
                lng: userLocation.lng + offsetLng 
            },
            timestamp: Date.now(),
            reporterName: 'ระบบทดสอบ',
            status: 'PENDING'
        };
        setAlerts(prev => [newAlert, ...prev]);
        setIncomingAlert(newAlert);
  };

  const handleCreateReport = (type: EmergencyType, description: string, priority: EmergencyPriority) => {
    if (!userLocation) return;

    const newAlert: Alert = {
        id: Date.now().toString(),
        type,
        priority,
        description,
        location: userLocation,
        timestamp: Date.now(),
        reporterName: 'ฉัน (Me)',
        status: 'PENDING'
    };

    setAlerts(prev => [newAlert, ...prev]);
    
    setNotification('กำลังค้นหาผู้ใช้งานใกล้เคียง...');
    setTimeout(() => {
        setNotification(`แจ้งเตือนผู้ใช้งานในระยะ 5 กม. เรียบร้อยแล้ว!`);
        setActiveTab('map'); 
    }, 1500);
    setTimeout(() => setNotification(null), 5000);
  };

  const startNavigation = (location: Location) => {
      setDestination(location);
      setActiveTab('map');
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      
      {incomingAlert && (
          <IncomingAlertOverlay 
            alert={incomingAlert} 
            userLocation={userLocation}
            onClose={() => setIncomingAlert(null)}
            onStartNavigation={(loc) => {
                setIncomingAlert(null);
                startNavigation(loc);
            }}
          />
      )}

      {notification && (
        <div className="absolute top-[calc(6rem+env(safe-area-inset-top))] left-6 right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
             <div className="bg-slate-800/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="bg-green-500/20 p-2 rounded-full">
                    <Radio className="text-green-400 animate-pulse" size={20} />
                </div>
                <div className="text-sm font-medium">{notification}</div>
            </div>
        </div>
      )}

      {activeTab === 'home' && (
        <Dashboard 
            userLocation={userLocation} 
            alerts={alerts} 
            onNavigateToMap={() => setActiveTab('map')}
            onNavigateToSOS={() => setActiveTab('sos')}
            onStartNavigation={startNavigation}
            onSimulateAlert={simulateIncomingAlert}
            isSimulatingWalk={isSimulatingWalk}
            onToggleWalk={() => setIsSimulatingWalk(!isSimulatingWalk)}
        />
      )}
      
      {activeTab === 'map' && (
        <MapComponent 
            userLocation={userLocation} 
            alerts={alerts} 
            destination={destination}
            onNavigate={startNavigation}
            onCancelNavigation={() => setDestination(null)}
        />
      )}

      {activeTab === 'sos' && (
        <SOSPage 
            userLocation={userLocation} 
            onSubmitReport={handleCreateReport} 
        />
      )}
    </Layout>
  );
};

export default App;
