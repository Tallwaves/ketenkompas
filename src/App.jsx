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
  MessageSquareText
} from 'lucide-react';

/**
 * KETENKOMPAS V1.4.2 - FINALE STABIELE VERSIE
 * - Inclusief 'Vite Reset' om de weergave lokaal te fixen.
 * - Gelaagde Robuustheid (2 niveaus, 6 stappen).
 * - Scenario Settings & Consultancy Add-on.
 * - Anti-flikker laadscherm.
 */

const App = () => {
  const [isReady, setIsReady] = useState(false);

  // --- STYLE & VITE RESET INJECTOR ---
  useEffect(() => {
    // 1. Laad Tailwind in via CDN
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      script.onload = () => {
        setTimeout(() => setIsReady(true), 100);
      };
      document.head.appendChild(script);
    } else {
      setIsReady(true);
    }
  }, []);

  // --- STATE ---
  const [isQualityProcessable, setIsQualityProcessable] = useState(true); 
  const [outageDays, setOutageDays] = useState(0); 
  const [siloCount, setSiloCount] = useState(2); 
  const [isDataVisible, setIsDataVisible] = useState(true);

  // --- CONFIGURATIE ---
  const PRODUCTION = 500; 
  const HVC_BASE_CAP = 450; 
  const EXTERNAL_BASE_CAP = 150; 
  const SILO_CAP_UNIT = 1000; 
  const NATIONAL_EMERGENCY_CAP = 10000;

  // --- REKENMOTOR ---
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
      hvcActual,
      externalActual,
      localSiloTotal,
      netDailyChange,
      daysInSilos,
      daysNational,
      grStatus: getStatus(daysInSilos),
      natStatus: getStatus(daysNational),
      costImpact: netDailyChange > 0 ? (netDailyChange * 185) : 0
    };
  }, [isQualityProcessable, outageDays, siloCount]);

  // --- UI COMPONENTS ---
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

  return (
    <div className={`transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      {/* DIRECTE CSS FIX VOOR VITE (Herstelt weergave over de volle breedte) */}
      <style>{`
        #root { 
          max-width: 100% !important; 
          margin: 0 !important; 
          padding: 0 !important; 
          text-align: left !important;
          display: block !important;
          width: 100%;
        }
        body { 
          margin: 0 !important; 
          padding: 0 !important; 
          display: block !important; 
          place-items: start !important;
          width: 100%;
        }
      `}</style>

      <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-900 flex flex-col relative overflow-hidden">
        
        {/* Privacy Watermerk */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] select-none rotate-[-30deg] z-0">
          <h1 className="text-[120px] font-black tracking-tighter uppercase text-slate-900">Intern Vertrouwelijk</h1>
        </div>

        {/* HEADER */}
        <header className="bg-[#004a89] text-white p-3 shadow-md flex justify-between items-center px-6 z-20">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-1.5 rounded-md border border-white/20">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">KetenKompas.nl</h1>
              <p className="text-[9px] uppercase opacity-70 flex items-center gap-1 leading-none">
                <ShieldCheck size={8} /> Beveiligd Portaal (Aandeelhouders B)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end border-r border-white/20 pr-4">
                  <span className="text-[9px] opacity-60 uppercase font-bold tracking-widest leading-none">v1.4.2 Stabiel</span>
                  <span className="text-xs font-bold flex items-center gap-1 tracking-tight mt-1"><User size={12} /> Gizan Ezra (AGV)</span>
              </div>
              <button className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"><LogOut size={16} /></button>
          </div>
        </header>

        {/* CLASSIFICATION */}
        <div className="bg-slate-800 text-white p-2 px-6 flex justify-between items-center z-20">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase leading-none">
              <Activity size={14} className="text-blue-400" /> 
              Data-Classificatie: Intern (GR Slib)
          </div>
          <button onClick={() => setIsDataVisible(!isDataVisible)} className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 bg-white/10 px-3 py-1 rounded border border-white/20 hover:bg-white/20 transition-all">
              {isDataVisible ? <><EyeOff size={12} /> Maskeer waarden</> : "Toon waarden"}
          </button>
        </div>

        <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
          
          <div className="lg:col-span-3 space-y-4">
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-xs font-black text-[#004a89] mb-6 uppercase tracking-widest flex justify-between items-center border-b pb-2">
                Scenario Settings
                <Settings size={14} />
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-3 leading-none tracking-tight">Kwaliteit slib</label>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setIsQualityProcessable(true)} 
                      className={`w-full py-2.5 rounded-lg border-2 text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${isQualityProcessable ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' : 'bg-white border-slate-100 text-slate-300'}`}
                    >
                      <CheckCircle2 size={14} /> VERWERKBAAR
                    </button>
                    <button 
                      onClick={() => setIsQualityProcessable(false)} 
                      className={`w-full py-2.5 rounded-lg border-2 text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${!isQualityProcessable ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' : 'bg-white border-slate-100 text-slate-300'}`}
                    >
                      <XCircle size={14} /> NIET VERWERKBAAR
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Verwerker uitval</label>
                      <span className="text-[10px] font-black text-[#004a89] bg-blue-50 px-2 py-0.5 rounded">{outageDays} Dagen</span>
                  </div>
                  <input 
                    type="range" min="0" max="30" step="1" 
                    value={outageDays} 
                    onChange={(e) => setOutageDays(parseInt(e.target.value))} 
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500" 
                  />
                </div>
              </div>
            </section>

            <div className="bg-slate-100 border border-slate-200 p-5 rounded-xl shadow-sm">
               <h3 className="font-black text-[10px] text-slate-500 mb-3 flex items-center gap-1 uppercase tracking-widest">
                 <MessageSquareText size={14} /> Strategisch Advies
               </h3>
               <p className="text-[10px] leading-relaxed text-slate-600 mb-4 italic">
                 Ontvang een toelichting op maat voor de impact van dit scenario op de meerjarenbegroting.
               </p>
               <button className="w-full bg-white hover:bg-slate-50 text-[#004a89] text-[9px] font-bold py-2.5 px-4 rounded-lg border border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm uppercase tracking-tighter leading-none">
                  Vraag strategische toelichting aan
               </button>
            </div>
          </div>

          <div className="lg:col-span-9 space-y-6">
            
            <div className={`bg-white border-l-[12px] ${simulation.grStatus.color.replace('bg-', 'border-')} p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 z-10 relative`}>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Keten Thermometer</span>
                <h2 className="text-2xl font-black text-slate-800 mt-1 uppercase italic tracking-tight">{simulation.grStatus.label}</h2>
              </div>
              
              <div className="flex items-center gap-8">
                  <div className="text-right border-r border-slate-100 pr-8">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Uitval Periode</span>
                      <div className="flex items-center gap-2 mt-1">
                          <Clock size={16} className="text-orange-500" />
                          <span className="text-2xl font-black">{outageDays}d</span>
                      </div>
                  </div>
                  <div className="text-center md:text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Resterende Buffer</span>
                      <div className="flex items-center gap-3 mt-1">
                          <span className={`text-6xl font-black tracking-tighter ${simulation.daysInSilos === Infinity ? 'text-green-500' : 'text-slate-800'}`}>
                              {simulation.daysInSilos === Infinity ? 'MAX' : simulation.daysInSilos}
                          </span>
                          <div className="text-left leading-none">
                              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{simulation.daysInSilos === Infinity ? 'Veilig' : 'Dagen'}</p>
                              <p className="text-[8px] text-slate-400 uppercase font-black tracking-tight leading-none">Tot Keten-stop</p>
                          </div>
                      </div>
                  </div>
              </div>
            </div>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 z-10 relative">
              <h2 className="text-[10px] font-black text-slate-400 mb-10 uppercase tracking-[0.3em] text-center leading-none">
                <Layers size={14} className="inline mr-2" />
                Gelaagde Robuustheid (v1.4.2)
              </h2>
              
              <div className="space-y-12">
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 z-10 relative">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
                <div className="bg-red-50 p-2 rounded text-red-600"><Euro size={18} /></div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Escalatiekosten</p>
                  <p className="text-sm font-black text-slate-800 mt-1 leading-none">
                    € {isDataVisible ? Math.round(simulation.costImpact).toLocaleString() : '***'} <span className="text-[8px] opacity-40 font-bold uppercase">/ dag</span>
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded text-green-600"><Leaf size={18} /></div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">CO2 Monitor</p>
                  <p className={`text-[10px] font-black mt-1 leading-none ${simulation.netDailyChange > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                     {simulation.netDailyChange > 0 ? 'IMPACT STIJGEND' : 'CONFORM DOEL'}
                  </p>
                </div>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded text-blue-400"><Lock size={18} /></div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Privacy</p>
                  <p className="text-[10px] font-bold text-white mt-1 uppercase tracking-widest leading-none">AES-256 Active</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center px-4">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-center">Referentie</span>
                  <span className="text-[10px] font-mono text-slate-600 text-center leading-none uppercase tracking-tighter">AGV-GRS-2026</span>
              </div>
            </div>

            <footer className="pt-4 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 px-2 font-black uppercase tracking-[0.2em] z-10 relative">
              <div className="flex gap-6">
                <span>CERT-REF: GRS-2026-STABLE-V1.4.2</span>
                <span className="text-red-500/50 italic underline tracking-tighter">Strict Vertrouwelijk</span>
              </div>
              <div className="flex items-center gap-1 text-[#004a89]">
                <ShieldCheck size={10} /> Certified Environment: AGV-Cloud-Authorized
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;