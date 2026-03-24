import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  AlertTriangle,
  Droplet,
  Truck,
  Euro,
  Leaf,
  Info,
  ShieldCheck,
  Settings,
  ArrowRight,
  Factory,
  Globe,
  MapPin,
  Lock,
  User,
  LogOut,
  EyeOff,
  Activity,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Warehouse,
  HardHat,
  Database,
  MessageSquareText,
  KeyRound,
  Loader2,
  CalendarDays
} from 'lucide-react';

// ISO weeknummer berekening
function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

const DAGEN_NL = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

function useDagWeek() {
  const [nu, setNu] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNu(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  return {
    dag: DAGEN_NL[nu.getDay()],
    weeknummer: getISOWeek(nu),
  };
}

/**
 * KETENKOMPAS V1.4.8 - HERSTEL DASHBOARD & SECURITY
 * - Volledige UI hersteld (Landelijke Robuustheid + Stat-kaarten)
 * - Automatische login voor jouw IP-adressen (IPv4 & IPv6)
 * - Handmatige login voor anderen (Code: AGV2026)
 */

const App = () => {
  const { dag, weeknummer } = useDagWeek();
  const [isReady, setIsReady] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [detectedIP, setDetectedIP] = useState('');

  // CONFIGURATIE
  const CORRECT_PASSWORD = "AGV2026"; 
  const TRUSTED_IPS = ["89.99.231.85", "2001:4860:7:61f::f8"]; 

  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      script.onload = () => {
        setupApp();
      };
      document.head.appendChild(script);
    } else {
      setupApp();
    }

    const style = document.createElement('style');
    style.innerHTML = `
      #root { max-width: 100% !important; margin: 0 !important; padding: 0 !important; text-align: left !important; display: block !important; width: 100%; }
      body { margin: 0 !important; padding: 0 !important; display: block !important; place-items: start !important; width: 100%; background-color: #f1f5f9; }
    `;
    document.head.appendChild(style);
  }, []);

  const setupApp = async () => {
    try {
      const response = await fetch('https://api64.ipify.org?format=json');
      const data = await response.json();
      setDetectedIP(data.ip);
      
      if (TRUSTED_IPS.includes(data.ip)) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Fout bij IP-controle:", error);
    } finally {
      setIsReady(true);
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  // --- SIMULATIE LOGICA ---
  const [isQualityProcessable, setIsQualityProcessable] = useState(true); 
  const [outageDays, setOutageDays] = useState(0); 
  const [siloCount, setSiloCount] = useState(2); 
  const [isDataVisible, setIsDataVisible] = useState(true);

  const PRODUCTION = 500; 
  const HVC_BASE_CAP = 450; 
  const EXTERNAL_BASE_CAP = 150; 
  const SILO_CAP_UNIT = 1000; 
  const NATIONAL_EMERGENCY_CAP = 10000;

  const simulation = useMemo(() => {
    const localSiloTotal = siloCount * SILO_CAP_UNIT;
    const hvcActual = (!isQualityProcessable || outageDays > 0) ? 0 : HVC_BASE_CAP;
    const externalActual = (!isQualityProcessable) ? 0 : EXTERNAL_BASE_CAP;
    const totalOutflow = hvcActual + externalActual;
    const netDailyChange = PRODUCTION - totalOutflow;

    let daysInSilos = Infinity;
    let daysNational = Infinity;
    
    if (netDailyChange > 0) {
      daysInSilos = Math.floor(localSiloTotal / netDailyChange);
      daysNational = Math.floor(NATIONAL_EMERGENCY_CAP / netDailyChange);
    }

    const getStatus = (days) => {
        if (days === Infinity || days > 15) return { label: 'Stabiel', color: 'bg-green-500', text: 'text-green-600' };
        if (days < 4) return { label: 'Kritiek', color: 'bg-red-600', text: 'text-red-600' };
        if (days < 8) return { label: 'Zorgelijk', color: 'bg-orange-500', text: 'text-orange-600' };
        return { label: 'Operationele Druk', color: 'bg-blue-500', text: 'text-blue-600' };
    };

    return {
      hvcActual, externalActual, localSiloTotal, netDailyChange, daysInSilos, daysNational,
      grStatus: getStatus(daysInSilos), natStatus: getStatus(daysNational),
      costImpact: netDailyChange > 0 ? (netDailyChange * 185) : 0
    };
  }, [isQualityProcessable, outageDays, siloCount]);

  const ChainNode = ({ icon: Icon, label, status }) => (
    <div className="flex flex-col items-center gap-2 w-24">
      <div className={`p-3 rounded-xl border-2 transition-all shadow-sm ${
        status === 'active' ? 'bg-blue-50 border-blue-400 text-blue-600' : 
        status === 'danger' ? 'bg-red-50 border-red-500 text-red-600 animate-pulse' :
        status === 'warning' ? 'bg-orange-50 border-orange-400 text-orange-600' :
        'bg-slate-50 border-slate-200 text-slate-300 grayscale'
      }`}>
        <Icon size={20} />
      </div>
      <div className="text-center h-8 flex flex-col justify-center">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter leading-tight italic">{label}</p>
      </div>
    </div>
  );

  if (!isReady || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
         <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
         <div className="text-white font-black uppercase tracking-widest text-[10px] animate-pulse">Identiteit controleren...</div>
      </div>
    );
  }

  // LOGIN SCHERM
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="bg-[#004a89] p-8 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-white/10 mb-4 border border-white/20">
              <Compass className="text-white w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight italic uppercase">KetenKompas Portaal</h1>
            <p className="text-blue-200 text-[10px] mt-2 font-bold tracking-widest uppercase opacity-70 flex items-center justify-center gap-2">
              <Activity size={12}/> Jouw IP: {detectedIP || 'Onbekend'}
            </p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Onbekende verbinding. Voer code in:</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-50 border-2 ${loginError ? 'border-red-500 bg-red-50' : 'border-slate-100'} p-4 rounded-xl focus:outline-none focus:border-[#004a89] transition-all font-bold text-center tracking-[0.3em]`}
                  placeholder="••••••••"
                />
                <KeyRound className="absolute right-4 top-4 text-slate-300" size={20} />
              </div>
              {loginError && <p className="text-red-500 text-[10px] font-black uppercase mt-2 text-center tracking-widest animate-bounce">Onjuist wachtwoord</p>}
            </div>
            <button type="submit" className="w-full bg-[#004a89] hover:bg-blue-800 text-white font-black py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
              Dashboard Openen <ArrowRight size={18} />
            </button>
            <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Extern IP gedetecteerd. Login vereist voor toegang tot AGV / GR Slib data.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-900 flex flex-col relative overflow-hidden w-full">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] select-none rotate-[-30deg] z-0">
        <h1 className="text-[120px] font-black tracking-tighter uppercase text-slate-900">Intern Vertrouwelijk</h1>
      </div>

      <header className="bg-[#004a89] text-white p-3 shadow-md flex justify-between items-center px-6 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-1.5 rounded-md border border-white/20"><Compass className="w-6 h-6" /></div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">KetenKompas.nl</h1>
            <p className="text-[9px] uppercase opacity-70 flex items-center gap-1 leading-none">
              <ShieldCheck size={8} /> 
              {TRUSTED_IPS.includes(detectedIP) ? 'Automatisch geautoriseerd via IP' : 'Sessie geautoriseerd'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 border-r border-white/20 pr-4">
              <div className="bg-white/10 p-1.5 rounded-md border border-white/20"><CalendarDays className="w-4 h-4 text-blue-200" /></div>
              <div className="text-right">
                <p className="text-xs font-black text-white leading-none">{dag}</p>
                <p className="text-[9px] text-blue-200 font-bold uppercase tracking-widest leading-none mt-0.5">Week {weeknummer}</p>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end border-r border-white/20 pr-4">
                <span className="text-[9px] opacity-60 uppercase font-bold tracking-widest leading-none">v1.4.8 Stabiel</span>
                <span className="text-xs font-bold flex items-center gap-1 tracking-tight mt-1"><User size={12} /> Gizan Ezra (AGV)</span>
            </div>
            <button onClick={() => { setIsAuthenticated(false); setDetectedIP(''); }} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"><LogOut size={16} /></button>
        </div>
      </header>

      <div className="bg-slate-800 text-white p-2 px-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase leading-none"><Activity size={14} className="text-blue-400" /> Classificatie: Intern (GR Slib)</div>
        <button onClick={() => setIsDataVisible(!isDataVisible)} className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 bg-white/10 px-3 py-1 rounded border border-white/20 hover:bg-white/20 transition-all">
            {isDataVisible ? <><EyeOff size={12} /> Maskeer waarden</> : "Toon waarden"}
        </button>
      </div>

      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative">
        {/* SIDEBAR */}
        <div className="lg:col-span-3 space-y-4">
          <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xs font-black text-[#004a89] mb-6 uppercase tracking-widest flex justify-between items-center border-b pb-2">Scenario Settings <Settings size={14} /></h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-3 leading-none tracking-tight">Kwaliteit slib</label>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setIsQualityProcessable(true)} className={`w-full py-2.5 rounded-lg border-2 text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${isQualityProcessable ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' : 'bg-white border-slate-100 text-slate-300'}`}><CheckCircle2 size={14} /> VERWERKBAAR</button>
                  <button onClick={() => setIsQualityProcessable(false)} className={`w-full py-2.5 rounded-lg border-2 text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${!isQualityProcessable ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' : 'bg-white border-slate-100 text-slate-300'}`}><XCircle size={14} /> NIET VERWERKBAAR</button>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Verwerker uitval</label>
                    <span className="text-[10px] font-black text-[#004a89] bg-blue-50 px-2 py-0.5 rounded">{outageDays} Dagen</span>
                </div>
                <input type="range" min="0" max="30" step="1" value={outageDays} onChange={(e) => setOutageDays(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500" />
              </div>
            </div>
          </section>
          <div className="bg-slate-100 border border-slate-200 p-5 rounded-xl shadow-sm">
             <h3 className="font-black text-[10px] text-slate-500 mb-3 flex items-center gap-1 uppercase tracking-widest"><MessageSquareText size={14} /> Strategisch Advies</h3>
             <p className="text-[10px] leading-relaxed text-slate-600 mb-4 italic">Ontvang een toelichting op maat voor dit scenario.</p>
             <button className="w-full bg-white hover:bg-slate-50 text-[#004a89] text-[9px] font-bold py-2.5 px-4 rounded-lg border border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm uppercase tracking-tighter leading-none">Vraag toelichting aan</button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-9 space-y-6">
          {/* THERMOMETER CARD */}
          <div className={`bg-white border-l-[12px] ${simulation.grStatus.color.replace('bg-', 'border-')} p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative`}>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Keten Thermometer</span>
              <h2 className="text-2xl font-black text-slate-800 mt-1 uppercase italic tracking-tight">{simulation.grStatus.label}</h2>
            </div>
            <div className="flex items-center gap-8">
                <div className="text-right border-r border-slate-100 pr-8">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Uitval Periode</span>
                    <div className="flex items-center gap-2 mt-1"><Clock size={16} className="text-orange-500" /><span className="text-2xl font-black">{outageDays}d</span></div>
                </div>
                <div className="text-center md:text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Resterende Buffer</span>
                    <div className="flex items-center gap-3 mt-1">
                        <span className={`text-6xl font-black tracking-tighter ${simulation.daysInSilos === Infinity ? 'text-green-500' : 'text-slate-800'}`}>{simulation.daysInSilos === Infinity ? 'MAX' : simulation.daysInSilos}</span>
                        <div className="text-left leading-none"><p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{simulation.daysInSilos === Infinity ? 'Veilig' : 'Dagen'}</p><p className="text-[8px] text-slate-400 uppercase font-black tracking-tight leading-none">Tot Keten-stop</p></div>
                    </div>
                </div>
            </div>
          </div>

          {/* MULTI-LAYER ROBUSTNESS SECTION */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-[10px] font-black text-slate-400 mb-10 uppercase tracking-[0.3em] text-center leading-none"><Layers size={14} className="inline mr-2" /> Gelaagde Robuustheid (v1.4.8)</h2>
            <div className="space-y-12">
              {/* LAAG 1 */}
              <div className="relative">
                <div className="flex justify-between items-center mb-4 px-2 italic">
                    <span className="text-[10px] font-black uppercase text-[#004a89] tracking-widest">1. Robuustheid GR Slib (Regionaal)</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${simulation.grStatus.color} text-white`}>{simulation.grStatus.label.toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <ChainNode icon={Droplet} label="Waterschappen" status="active" />
                    <ArrowRight className="text-slate-200" size={16} />
                    <ChainNode icon={Warehouse} label="Overslaglocaties" status="active" />
                    <ArrowRight className="text-slate-200" size={16} />
                    <ChainNode icon={Factory} label="HVC Verwerking" status={(!isQualityProcessable || outageDays > 0) ? 'danger' : 'active'} />
                    <ArrowRight className="text-slate-200" size={16} />
                    <ChainNode icon={Globe} label="Externe Verwerking" status={!isQualityProcessable ? 'warning' : 'active'} />
                    <ArrowRight className="text-slate-200" size={16} />
                    <ChainNode icon={Database} label="Opslaglocaties" status={simulation.daysInSilos < 5 ? 'warning' : 'active'} />
                    <ArrowRight className="text-slate-200" size={16} />
                    <ChainNode icon={HardHat} label="Calamiteitenopvang" status={simulation.daysInSilos < 3 ? 'danger' : 'inactive'} />
                </div>
              </div>

              {/* LAAG 2 */}
              <div className="relative pt-6 border-t border-dashed border-slate-200">
                <div className="flex justify-between items-center mb-4 px-2 italic">
                    <span className="text-[10px] font-black uppercase text-red-800 tracking-widest">2. Landelijke Robuustheid (Vangnet)</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${simulation.natStatus.color} text-white`}>{simulation.natStatus.label.toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <ChainNode icon={Droplet} label="Waterschappen" status="active" />
                    <ArrowRight className="text-slate-200" size={16} />
                    <ChainNode icon={Warehouse} label="Overslag locaties" status="active" />
                    <ArrowRight className="text-slate-200" size={16} />
                    <ChainNode icon={Factory} label="Verwerkers" status={(!isQualityProcessable || outageDays > 0) ? 'warning' : 'active'} />
                    <ArrowRight className="text-slate-200" size={16} />
                    <ChainNode icon={Globe} label="Externe verwerkers" status="active" />
                    <ArrowRight className="text-slate-200" size={16} />
                    <ChainNode icon={Database} label="Opslag" status="active" />
                    <ArrowRight className="text-slate-200" size={16} />
                    <ChainNode icon={MapPin} label="Calamiteiten" status={simulation.daysInSilos < 4 ? 'danger' : 'inactive'} />
                </div>
              </div>
            </div>
          </section>

          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-[#004a89] p-4 rounded-xl shadow-sm border border-blue-700 flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded text-white"><CalendarDays size={18} /></div>
              <div>
                <p className="text-[8px] font-black text-blue-200 uppercase tracking-widest leading-none">Dag / Week</p>
                <p className="text-sm font-black text-white mt-1 leading-none">{dag}</p>
                <p className="text-[9px] font-bold text-blue-200 mt-0.5 leading-none uppercase tracking-widest">Week {weeknummer}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="bg-red-50 p-2 rounded text-red-600"><Euro size={18} /></div>
              <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Escalatiekosten</p><p className="text-sm font-black text-slate-800 mt-1 leading-none">€ {isDataVisible ? Math.round(simulation.costImpact).toLocaleString() : '***'} <span className="text-[8px] opacity-40 font-bold uppercase">/ dag</span></p></div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="bg-green-50 p-2 rounded text-green-600"><Leaf size={18} /></div>
              <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">CO2 Monitor</p><p className={`text-[10px] font-black mt-1 leading-none ${simulation.netDailyChange > 0 ? 'text-orange-500' : 'text-green-600'}`}>{simulation.netDailyChange > 0 ? 'IMPACT STIJGEND' : 'CONFORM DOEL'}</p></div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded text-blue-400"><Lock size={18} /></div>
              <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Privacy</p><p className="text-[10px] font-bold text-white mt-1 uppercase tracking-widest leading-none">AES-256 Active</p></div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center px-4 text-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Referentie</span>
                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter leading-none">AGV-GRS-2026</span>
            </div>
          </div>
          
          <footer className="pt-4 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
            <div className="flex gap-6"><span>CERT-REF: GRS-2026-STABLE-V1.4.8</span><span className="text-red-500/50 italic underline tracking-tighter leading-none">Strict Vertrouwelijk</span></div>
            <div className="flex items-center gap-1 text-[#004a89]"><ShieldCheck size={10} /> Certified: AGV-Cloud-Authorized</div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;
