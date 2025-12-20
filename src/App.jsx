import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import Campfire3D from './Campfire3D';

// --- CONFIGURATION ---
const PAYPAL_ME_USER = "CQRDN";
const DISCORD_LINK = "https://discord.gg/q3fkRmHmZu";

// ==========================================
// 1. COMPOSANTS UTILITAIRES & EFFETS VISUELS
// ==========================================

// --- IMAGE ÉDITABLE (ADMIN) ---
const EditableImage = ({ src, alt, className, onUpload, isAdmin }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      await onUpload(file);
    } catch (err) {
      alert("Erreur upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`relative group/edit ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      {isAdmin && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/edit:opacity-100 transition-opacity cursor-pointer z-20"
        >
          <span className="text-white text-xs font-bold border border-white px-2 py-1 uppercase hover:bg-white hover:text-black transition-colors">
            {uploading ? '...' : '📷 Changer'}
          </span>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
      )}
      <div className="absolute inset-0 border border-survie-khaki/20 pointer-events-none z-10"></div>
    </div>
  );
};

// --- TEXTE DÉCRYPTAGE (EFFET HACKER) ---
const HackerText = ({ text, className = "" }) => {
  const [display, setDisplay] = useState(text);
  const [hovered, setHovered] = useState(false);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

  useEffect(() => {
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplay(
        text.split("").map((letter, index) => {
          if (index < iterations) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      if (iterations >= text.length) clearInterval(interval);
      iterations += 1 / 2;
    }, 30);
    return () => clearInterval(interval);
  }, [text, hovered]);

  return (
    <span className={`font-mono cursor-default ${className}`} onMouseEnter={() => setHovered(!hovered)}>
      {display}
    </span>
  );
};

// --- IMAGE DRONE HUD ---
const DroneImage = ({ src, alt, className = "", children }) => (
  <div className={`relative group overflow-hidden border border-survie-khaki/30 ${className}`}>
    <div className="absolute inset-0 bg-survie-khaki/10 z-10 pointer-events-none mix-blend-overlay"></div>
    <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />

    <div className="absolute inset-0 z-20 pointer-events-none border-[1px] border-transparent group-hover:border-survie-khaki/50 transition-colors duration-500">
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-survie-khaki"></div>
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-survie-khaki"></div>
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-survie-khaki"></div>
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-survie-khaki"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-survie-khaki/10 to-transparent h-[10px] w-full animate-scan"></div>
      <div className="absolute top-3 right-4 text-[9px] font-mono text-survie-khaki flex items-center gap-2">
        <span className="animate-pulse">● REC</span><span>[LIVE FEED]</span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg className="w-12 h-12 text-survie-khaki/80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="50" cy="50" r="20" /><line x1="50" y1="20" x2="50" y2="80" /><line x1="20" y1="50" x2="80" y2="50" />
        </svg>
      </div>
    </div>
    {children}
  </div>
);

// --- FONCTION PARTICULES (SPRAY) ---
const createSprayEffect = (e) => {
  const particleCount = 6;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('spray-particle');
    particle.style.left = `${e.clientX}px`;
    particle.style.top = `${e.clientY}px`;
    const angle = Math.random() * Math.PI * 2;
    const dist = 10 + Math.random() * 15;
    const length = 4 + Math.random() * 4;
    particle.style.setProperty('--angle', `${angle}rad`);
    particle.style.setProperty('--dist', `${dist}px`);
    particle.style.setProperty('--length', `${length}px`);
    document.body.appendChild(particle);
    setTimeout(() => { particle.remove(); }, 300);
  }
};

// ==========================================
// 2. MODALES & ÉLÉMENTS UI "PRO"
// ==========================================

// --- ADMIN DASHBOARD (VALIDATION DONS) ---
function AdminDashboard({ onClose }) {
  const [pending, setPending] = useState([]);
  const [itemsMap, setItemsMap] = useState({});

  const fetchPending = async () => {
    // Récupère les dons en attente
    const { data } = await supabase
      .from('pending_donations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) setPending(data);

    // Récupère les noms des items pour l'affichage
    const { data: items } = await supabase.from('items').select('id, nom');
    if (items) {
      const map = {};
      items.forEach(i => map[i.id] = i.nom);
      setItemsMap(map);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id) => {
    // Appel de la fonction SQL sécurisée
    const { error } = await supabase.rpc('approve_donation', { donation_id: id });
    if (error) alert("Erreur validation: " + error.message);
    else {
      alert("Don validé et ajouté à la cagnotte !");
      fetchPending();
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Rejeter ce don ?")) return;
    const { error } = await supabase.from('pending_donations').update({ status: 'rejected' }).eq('id', id);
    if (!error) fetchPending();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-6 animate-fade-in-up">
      <div className="w-full max-w-3xl bg-survie-bg border border-survie-khaki p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-red-500 font-bold">FERMER [X]</button>
        <h2 className="text-2xl text-survie-khaki font-display mb-6 uppercase tracking-widest border-b border-survie-grey/30 pb-4">
          Centre de Commandement - Dons en Attente
        </h2>

        {pending.length === 0 ? (
          <div className="text-gray-500 font-mono text-center py-10 flex flex-col items-center gap-4">
            <span className="text-4xl">✓</span>
            <span>R.A.S - Aucun don à vérifier pour le moment.</span>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {pending.map(don => (
              <div key={don.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black/40 border border-survie-grey/30 p-4 gap-4">
                <div>
                  <div className="text-white font-bold text-xl">{don.amount} € <span className="text-xs font-normal text-gray-400">par {don.donor_name}</span></div>
                  <div className="text-xs text-survie-khaki font-mono mt-1">CIBLE : {itemsMap[don.item_id] || 'Item Inconnu'}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{new Date(don.created_at).toLocaleString()}</div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button onClick={() => handleApprove(don.id)} className="flex-1 md:flex-none bg-green-600/20 border border-green-600 hover:bg-green-600 text-green-500 hover:text-white px-4 py-2 text-xs font-bold uppercase transition-all">
                    VALIDER
                  </button>
                  <button onClick={() => handleReject(don.id)} className="flex-1 md:flex-none bg-red-600/20 border border-red-600 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 text-xs font-bold uppercase transition-all">
                    REJETER
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- MENU MOBILE TACTIQUE ---
const MobileMenu = ({ isOpen, onClose, setView, currentView }) => {
  if (!isOpen) return null;

  const handleNav = (viewName) => {
    setView(viewName);
    onClose();
  };

  const links = [
    { id: 'aventure', label: 'NOTRE AVENTURE', sub: 'Briefing Mission' },
    { id: 'home', label: 'INVENTAIRE', sub: 'Arsenal & Besoins' },
    { id: 'collaborators', label: 'ALLIANCE', sub: 'Partenaires' },
    { id: 'about', label: 'À PROPOS', sub: 'Profils Opérateurs' },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in-up">
      <div className="flex justify-between items-center p-6 border-b border-survie-grey/20">
        <span className="text-survie-khaki text-xs font-mono tracking-widest animate-pulse">SYSTEM MENU // OPEN</span>
        <button onClick={onClose} className="text-white border border-survie-grey/50 px-4 py-2 text-xs font-bold uppercase hover:bg-survie-khaki hover:text-black transition-all">
          Fermer [X]
        </button>
      </div>
      <div className="flex-grow flex flex-col justify-center px-8 gap-8">
        {links.map((link, index) => (
          <button
            key={link.id}
            onClick={() => handleNav(link.id)}
            className="group text-left"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`flex items-center gap-4 text-3xl md:text-5xl font-display uppercase tracking-wide transition-all ${currentView === link.id ? 'text-survie-khaki translate-x-4' : 'text-gray-500 hover:text-white hover:translate-x-2'}`}>
              <span className="text-xs font-mono opacity-50 group-hover:text-survie-khaki">0{index + 1}</span>
              {link.label}
            </div>
            <div className={`text-xs font-mono tracking-widest pl-8 mt-1 transition-colors ${currentView === link.id ? 'text-survie-khaki/60' : 'text-gray-700 group-hover:text-gray-400'}`}>
              // {link.sub}
            </div>
          </button>
        ))}
      </div>
      <div className="p-6 border-t border-survie-grey/20">
        <div className="flex justify-between items-end">
          <div className="text-[10px] text-gray-500 font-mono">SECURE CONNECTION<br />V.1.0.4 MOBILE</div>
          <div className="w-12 h-12 border border-survie-khaki/30 flex items-center justify-center"><div className="w-8 h-8 border-t-2 border-l-2 border-survie-khaki animate-spin"></div></div>
        </div>
      </div>
    </div>
  );
};

// --- MODAL MENTIONS LÉGALES ---
const LegalModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 p-4 animate-fade-in-up" onClick={onClose}>
    <div className="max-w-xl w-full bg-survie-bg border border-survie-khaki p-6 relative shadow-[0_0_50px_rgba(138,154,91,0.1)]" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-4 right-4 text-survie-grey hover:text-white">✕</button>
      <h2 className="font-display text-xl text-white mb-6 uppercase border-b border-survie-grey/30 pb-2">Mentions Légales</h2>
      <div className="space-y-4 text-[10px] md:text-xs text-gray-400 font-mono text-justify leading-relaxed h-64 overflow-y-auto pr-2">
        <p><strong>1. ÉDITEUR :</strong> Ce site est un projet personnel à but non lucratif visant à financer le matériel pour le projet "CQRDN".</p>
        <p><strong>2. FLUX FINANCIERS :</strong> Les dons sont traités exclusivement via PayPal. Aucune donnée bancaire ne transite par ce site.</p>
        <p><strong>3. UTILISATION DES FONDS :</strong> 100% des fonds collectés servent à l'achat du matériel listé dans l'inventaire. Des preuves d'achat seront fournies sur le Discord.</p>
        <p><strong>4. HÉBERGEMENT :</strong> Site hébergé par Vercel Inc. / Base de données par Supabase.</p>
        <p><strong>5. COOKIES :</strong> Ce site utilise uniquement des cookies techniques nécessaires au fonctionnement (session).</p>
      </div>
      <button onClick={onClose} className="w-full mt-6 py-3 bg-survie-khaki text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors">Fermer le dossier</button>
    </div>
  </div>
);

// --- FOOTER TACTIQUE ---
const Footer = ({ onOpenLegal }) => (
  <footer className="w-full border-t border-survie-grey/20 bg-black/80 backdrop-blur-sm py-6 mt-auto relative z-30 pointer-events-auto">
    <div className="max-w-[95vw] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] md:text-[10px] font-mono text-survie-grey uppercase tracking-widest">
      <div className="opacity-60">© 2025 CQRDN OPS. TACTICAL FUNDING.</div>
      <div className="flex gap-6 items-center">
        <button onClick={onOpenLegal} className="hover:text-survie-khaki transition-colors border-b border-transparent hover:border-survie-khaki">MENTIONS LÉGALES</button>
        <a href={DISCORD_LINK} target="_blank" rel="noreferrer" className="hover:text-survie-khaki transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>STATUS: ONLINE</a>
      </div>
    </div>
  </footer>
);

// --- AUTH MODAL ---
function AuthModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    let result = isSignUp ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) alert(result.error.message);
    else onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in-up p-4">
      <div className="w-full max-w-md bg-survie-bg border border-survie-khaki p-6 md:p-8 relative shadow-[0_0_50px_rgba(138,154,91,0.2)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-survie-grey hover:text-white">✕</button>
        <h2 className="font-display text-2xl md:text-3xl text-white mb-2 uppercase tracking-wide">{isSignUp ? 'Identifiez-vous' : 'Connexion'}</h2>
        <form onSubmit={handleAuth} className="space-y-4 md:space-y-6 mt-6">
          <input type="email" placeholder="Email" className="w-full bg-survie-card border border-survie-grey/50 p-3 md:p-4 text-white outline-none focus:border-survie-khaki text-sm md:text-base" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" className="w-full bg-survie-card border border-survie-grey/50 p-3 md:p-4 text-white outline-none focus:border-survie-khaki text-sm md:text-base" value={password} onChange={e => setPassword(e.target.value)} required />
          <button disabled={loading} className="w-full py-3 md:py-4 bg-survie-khaki text-black font-display uppercase tracking-widest text-base md:text-lg hover:bg-white transition-colors">
            {loading ? '...' : (isSignUp ? "Créer Compte" : 'Connexion')}
          </button>
        </form>
        <button onClick={() => setIsSignUp(!isSignUp)} className="mt-4 md:mt-6 w-full text-center text-xs text-survie-grey underline uppercase tracking-widest hover:text-survie-khaki">
          {isSignUp ? "J'ai déjà un compte" : "Créer un compte"}
        </button>
      </div>
    </div>
  );
}

// --- MODAL EDITION ITEM (INVENTAIRE) ---
function EditItemModal({ item, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [nom, setNom] = useState(item?.nom || '');
  const [desc, setDesc] = useState(item?.description || '');
  const [prix, setPrix] = useState(item?.prix || '');
  const [cagnotte, setCagnotte] = useState(item?.cagnotte || 0);
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let publicUrl = item?.image_url;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `item-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('images-objets').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('images-objets').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }
      const payload = { nom, description: desc, prix: parseFloat(prix), cagnotte: parseFloat(cagnotte), image_url: publicUrl };
      if (item?.id) {
        const { error } = await supabase.from('items').update(payload).eq('id', item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('items').insert([payload]);
        if (error) throw error;
      }
      onSuccess();
      onClose();
    } catch (error) { alert("Erreur: " + error.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in-up p-4">
      <div className="w-full max-w-lg bg-survie-bg border border-survie-khaki p-6 md:p-8 relative shadow-[0_0_50px_rgba(138,154,91,0.2)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-survie-grey hover:text-white">✕</button>
        <h2 className="font-display text-2xl text-white mb-6 uppercase tracking-wide border-b border-survie-grey/30 pb-4">{item?.id ? 'Modifier' : 'Nouveau'} Matériel</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-[10px] uppercase text-survie-khaki tracking-widest block mb-1">Nom</label>
            <input type="text" className="w-full bg-survie-card border border-survie-grey/50 p-3 text-white focus:border-survie-khaki outline-none" required value={nom} onChange={e => setNom(e.target.value)} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] uppercase text-survie-khaki tracking-widest block mb-1">Objectif (€)</label>
              <input type="number" className="w-full bg-survie-card border border-survie-grey/50 p-3 text-white focus:border-survie-khaki outline-none" required value={prix} onChange={e => setPrix(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-[10px] uppercase text-survie-khaki tracking-widest block mb-1">Cagnotte Actuelle (€)</label>
              <input type="number" className="w-full bg-survie-card border border-survie-grey/50 p-3 text-white focus:border-survie-khaki outline-none font-bold" required value={cagnotte} onChange={e => setCagnotte(e.target.value)} />
            </div>
          </div>
          <div><label className="text-[10px] uppercase text-survie-khaki tracking-widest block mb-1">Photo</label><input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="w-full text-xs text-survie-grey file:bg-survie-khaki file:text-black hover:file:bg-white cursor-pointer" /></div>
          <div><label className="text-[10px] uppercase text-survie-khaki tracking-widest block mb-1">Description</label><textarea className="w-full bg-survie-card border border-survie-grey/50 p-3 text-white focus:border-survie-khaki outline-none h-24 resize-none" required value={desc} onChange={e => setDesc(e.target.value)} /></div>
          <button disabled={loading} className="w-full py-4 bg-survie-khaki text-black font-display uppercase tracking-widest text-lg hover:bg-white transition-colors mt-4">{loading ? '...' : 'VALIDER'}</button>
        </form>
      </div>
    </div>
  );
}

// --- MODAL EDITION MEMBRE ---
function MemberModal({ member, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(member?.name || '');
  const [role, setRole] = useState(member?.role || '');
  const [desc, setDesc] = useState(member?.description || '');
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let publicUrl = member?.image_url;
      if (file) {
        const fileName = `member-${Date.now()}.${file.name.split('.').pop()}`;
        const { error: upErr } = await supabase.storage.from('images-objets').upload(fileName, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('images-objets').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }
      const payload = { name, role, description: desc, image_url: publicUrl };
      if (member?.id) await supabase.from('team_members').update(payload).eq('id', member.id);
      else await supabase.from('team_members').insert([payload]);
      onSuccess();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 text-left">
      <div className="bg-survie-bg border border-survie-khaki p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-white">✕</button>
        <h2 className="text-white uppercase font-display text-xl mb-4">{member?.id ? 'Modifier' : 'Ajouter'} Membre</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full bg-survie-card border border-survie-grey p-2 text-white text-xs" placeholder="Nom" value={name} onChange={e => setName(e.target.value)} required />
          <input className="w-full bg-survie-card border border-survie-grey p-2 text-white text-xs" placeholder="Rôle" value={role} onChange={e => setRole(e.target.value)} required />
          <textarea className="w-full bg-survie-card border border-survie-grey p-2 text-white text-xs h-20" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} required />
          <div className="text-xs text-white"><label className="block mb-1">Photo</label><input type="file" onChange={e => setFile(e.target.files[0])} className="text-gray-400" /></div>
          <button className="w-full bg-survie-khaki text-black py-2 font-bold uppercase text-xs hover:bg-white">{loading ? '...' : 'Sauvegarder'}</button>
        </form>
      </div>
    </div>
  );
}

// --- MODAL EDITION COLLABORATEUR ---
function CollaboratorModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!file) throw new Error("Veuillez sélectionner un logo.");
      const fileName = `collab-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: upErr } = await supabase.storage.from('images-objets').upload(fileName, file);
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('images-objets').getPublicUrl(fileName);

      const { error: dbErr } = await supabase.from('collaborators').insert([{ name, link, logo_url: data.publicUrl }]);
      if (dbErr) throw dbErr;
      onSuccess();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 text-left">
      <div className="bg-survie-bg border border-survie-khaki p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-white">✕</button>
        <h2 className="text-white uppercase font-display text-xl mb-4">Nouveau Collaborateur</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full bg-survie-card border border-survie-grey p-2 text-white text-xs" placeholder="Nom de l'entreprise" value={name} onChange={e => setName(e.target.value)} required />
          <input className="w-full bg-survie-card border border-survie-grey p-2 text-white text-xs" placeholder="Lien Site Web (Optionnel)" value={link} onChange={e => setLink(e.target.value)} />
          <div className="text-xs text-white"><label className="block mb-1">Logo</label><input type="file" onChange={e => setFile(e.target.files[0])} className="text-gray-400" required /></div>
          <button className="w-full bg-survie-khaki text-black py-2 font-bold uppercase text-xs hover:bg-white">{loading ? '...' : 'Ajouter à l\'Alliance'}</button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 3. SECTIONS & PAGES
// ==========================================

// --- PAGE AVENTURE ---
function PageAventure({ onGoToInventory, isAdmin }) {
  const [images, setImages] = useState({});

  const fetchImages = async () => {
    const { data } = await supabase.from('site_content').select('*');
    if (data) {
      const imgMap = {};
      data.forEach(item => imgMap[item.key] = item.image_url);
      setImages(imgMap);
    }
  };
  useEffect(() => { fetchImages(); }, []);

  const updateImage = async (key, file) => {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.split('.').slice(0, -1).join('.').normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const fileName = `site-${key}-${cleanFileName}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error: upErr } = await supabase.storage.from('images-objets').upload(fileName, file);
    if (upErr) throw upErr;
    const { data: { publicUrl } } = supabase.storage.from('images-objets').getPublicUrl(fileName);
    const { error: dbErr } = await supabase.from('site_content').upsert({ key, image_url: publicUrl });
    if (dbErr) throw dbErr;
    fetchImages();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pb-20 pt-10 animate-fade-in-up text-left w-full relative z-10 font-mono">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-survie-grey/30 pb-6 mb-12 gap-6">
        <div>
          <p className="text-survie-khaki text-xs uppercase tracking-widest mb-1">Dossier de Mission #042</p>
          <h1 className="font-display text-4xl md:text-6xl text-white uppercase leading-none">
            <HackerText text="CE QU'IL RESTERA" /> <br />
            <span className="text-survie-khaki"><HackerText text="DE NOUS" /></span>
          </h1>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <div className="text-right text-[10px] text-gray-500 mb-1">STATUT: EN PRÉPARATION</div>
          <div className="flex gap-4">
            <button onClick={() => window.open(DISCORD_LINK, '_blank')} className="flex-1 md:flex-none text-xs font-bold text-survie-grey border border-survie-grey px-6 py-3 hover:bg-survie-grey hover:text-black uppercase tracking-widest transition-all">Discord</button>
            <button onClick={onGoToInventory} className="flex-1 md:flex-none text-xs font-bold text-black bg-survie-khaki border border-survie-khaki px-6 py-3 hover:bg-white hover:border-white uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(138,154,91,0.4)]">Inventaire →</button>
          </div>
        </div>
      </div>
      <div className="space-y-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-survie-khaki animate-pulse"></div>
              <h2 className="font-display text-xl text-white uppercase tracking-widest"><HackerText text="OBJECTIF PRINCIPAL" /></h2>
            </div>
            <p className="text-gray-400 leading-relaxed mb-4 border-l-2 border-survie-grey/20 pl-4">Dans quelques semaines, l'unité Alpha quittera la civilisation. <strong className="text-white">Zéro confort. Zéro filet de sécurité.</strong></p>
            <p className="text-gray-400 leading-relaxed pl-4">L'objectif est simple : Tenir 30 jours en autonomie totale. Nous documenterons chaque victoire et chaque échec. Sans filtre. Ce n'est pas de la télé-réalité, c'est de la survie brute.</p>
          </div>
          <div className="order-1 md:order-2 h-64 w-full relative">
            <DroneImage src={images['aventure_intro'] || "https://images.unsplash.com/photo-1518390264023-faabcd39634e?auto=format&fit=crop&q=80"} alt="Intro" className="w-full h-full">
              {isAdmin && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 z-50 pointer-events-auto"><EditableImage src="" alt="" className="absolute inset-0 opacity-0" isAdmin={true} onUpload={(file) => updateImage('aventure_intro', file)} /><span className="bg-black text-white text-xs px-2 py-1">CHANGER SOURCE</span></div>}
            </DroneImage>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="h-64 w-full relative">
            <DroneImage src={images['aventure_totem'] || "https://images.unsplash.com/photo-1533552222634-934c9973273e?auto=format&fit=crop&q=80"} alt="Totem" className="w-full h-full">
              {isAdmin && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 z-50 pointer-events-auto"><EditableImage src="" alt="" className="absolute inset-0 opacity-0" isAdmin={true} onUpload={(file) => updateImage('aventure_totem', file)} /><span className="bg-black text-white text-xs px-2 py-1">CHANGER SOURCE</span></div>}
            </DroneImage>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-white"></div>
              <h2 className="font-display text-xl text-white uppercase tracking-widest"><HackerText text="OPÉRATION TOTEM" /></h2>
            </div>
            <p className="text-gray-400 leading-relaxed mb-4">Au-delà de la survie physique, c'est une quête de sens. Que laisse-t-on derrière soi ?</p>
            <p className="text-gray-400 leading-relaxed">Sur l'île, nous bâtirons un <strong>Totem</strong>. Chaque contributeur verra son nom gravé dans le bois. Ce Totem restera sur l'île comme témoin de notre passage et de votre soutien. <span className="text-survie-khaki">Votre nom, gravé dans l'histoire.</span></p>
          </div>
        </div>
        <div className="border border-survie-khaki/30 bg-survie-card/20 p-8 relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-survie-khaki"></div><div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-survie-khaki"></div><div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-survie-khaki"></div><div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-survie-khaki"></div>
          <h2 className="font-display text-2xl text-center text-white mb-8 uppercase"><span className="text-survie-khaki">VOTRE RÔLE :</span> <HackerText text="LE 3ÈME SURVIVANT" /></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="group p-6 border border-survie-grey/20 hover:border-survie-khaki/60 transition-all bg-black/40 hover:bg-survie-khaki/5"><div className="text-3xl mb-2">📦</div><h3 className="font-display text-white text-lg uppercase mb-2">Logistique</h3><p className="text-xs text-gray-500 font-mono">Chaque achat finance directement nos rations et notre équipement.</p></div>
            <div className="group p-6 border border-survie-grey/20 hover:border-survie-khaki/60 transition-all bg-black/40 hover:bg-survie-khaki/5"><div className="text-3xl mb-2">💊</div><h3 className="font-display text-white text-lg uppercase mb-2">Sécurité</h3><p className="text-xs text-gray-500 font-mono">Vos dons payent la trousse de secours et le téléphone satellite.</p></div>
            <div className="group p-6 border border-survie-grey/20 hover:border-survie-khaki/60 transition-all bg-black/40 hover:bg-survie-khaki/5"><div className="text-3xl mb-2">📡</div><h3 className="font-display text-white text-lg uppercase mb-2">Intel</h3><p className="text-xs text-gray-500 font-mono">Sur Discord, vous votez pour les décisions cruciales de l'aventure.</p></div>
          </div>
        </div>
        <div className="text-center pt-8 pb-4 opacity-80">
          <p className="font-display text-lg md:text-2xl text-white uppercase italic tracking-wide">"<HackerText text="NE SOYEZ PAS SPECTATEURS." /> <br /><span className="text-survie-khaki font-bold"><HackerText text="SOYEZ ACTEURS DE NOTRE SURVIE." /></span>"</p>
        </div>
      </div>
    </div>
  );
}

// --- PAGE COLLABORATEURS ---
function PageCollaborators({ isAdmin }) {
  const [collabs, setCollabs] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchCollabs = async () => {
    const { data } = await supabase.from('collaborators').select('*').order('created_at');
    if (data) setCollabs(data);
  };
  useEffect(() => { fetchCollabs(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce collaborateur ?")) return;
    await supabase.from('collaborators').delete().eq('id', id);
    fetchCollabs();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pb-20 pt-16 animate-fade-in-up text-left w-full relative z-10 min-h-[60vh]">
      {showModal && <CollaboratorModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchCollabs(); }} />}

      <div className="flex justify-between items-end mb-12 border-b border-survie-grey/30 pb-4">
        <div>
          <p className="text-survie-khaki text-xs uppercase tracking-widest mb-1">UNITÉS DE SOUTIEN</p>
          <h1 className="font-display text-3xl md:text-5xl text-white uppercase leading-none">ALLIANCE <span className="text-survie-khaki">STRATÉGIQUE</span></h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="bg-survie-khaki text-black px-4 py-2 font-bold uppercase text-xs hover:bg-white transition-colors">
            + Ajouter Partenaire
          </button>
        )}
      </div>

      {collabs.length === 0 ? (
        <div className="border border-dashed border-survie-grey/40 p-12 text-center bg-black/40 rounded-sm">
          <div className="text-4xl mb-4 opacity-50">📡</div>
          <h3 className="text-white font-display text-xl uppercase mb-2">AUCUN SIGNAL DÉTECTÉ</h3>
          <p className="text-gray-400 font-mono text-sm max-w-md mx-auto mb-6">
            Pour le moment, nous avançons seuls. La réussite de la mission dépend de l'équipement que nous pourrons emporter.
          </p>
          <div className="inline-block border border-survie-khaki text-survie-khaki px-6 py-3 uppercase tracking-widest text-xs font-bold animate-pulse">
            LA MOINDRE AIDE EST LA BIENVENUE. REJOIGNEZ L'ALLIANCE.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {collabs.map(collab => (
            <div key={collab.id} className="relative group bg-survie-card border border-survie-grey/30 p-6 flex flex-col items-center justify-center hover:border-survie-khaki transition-colors h-48">
              {isAdmin && (
                <button onClick={() => handleDelete(collab.id)} className="absolute top-2 right-2 text-red-500 hover:text-white font-bold px-2">✕</button>
              )}
              <img src={collab.logo_url} alt={collab.name} className="max-w-full max-h-24 object-contain opacity-70 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" />
              <div className="absolute bottom-4 text-center">
                <span className="block text-white font-display text-sm uppercase tracking-wider">{collab.name}</span>
                {collab.link && (
                  <a href={collab.link} target="_blank" rel="noreferrer" className="text-[10px] text-survie-khaki hover:underline mt-1 block">VISITER QG</a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- PAGE A PROPOS ---
function PageAbout({ onBack, isAdmin }) {
  const [members, setMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);

  const socialLinks = [
    {
      instagram: "https://www.instagram.com/mathis.terriot/",
      tiktok: "https://www.tiktok.com/@fkraitro12",
      youtube: "https://www.youtube.com/@FKRaitro12",
      twitch: "https://www.twitch.tv/fk_raitro12"
    },
    {
      instagram: "https://www.instagram.com/sfxi00/",
      tiktok: "https://www.tiktok.com/@sofoxi0",
      youtube: "https://www.youtube.com/@Sofoxi0",
      twitch: "https://www.twitch.tv/sfxi0"
    }
  ];

  const fetchMembers = async () => {
    const { data } = await supabase.from('team_members').select('*').order('id').limit(2);
    if (data) setMembers(data);
  };
  useEffect(() => { fetchMembers(); }, []);

  const updateMember = async () => { setEditingMember(null); fetchMembers(); };

  return (
    <div className="w-full min-h-screen flex flex-col items-center animate-fade-in-up relative overflow-hidden">
      <Campfire3D />
      <div className="relative z-10 w-full max-w-6xl px-4 pt-24 md:pt-32 text-center flex flex-col flex-grow pointer-events-none">
        {editingMember && <div className="pointer-events-auto"><MemberModal member={editingMember} onClose={() => setEditingMember(null)} onSuccess={updateMember} /></div>}
        <div className="pointer-events-auto">
          <button onClick={onBack} className="mb-4 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest flex items-center gap-2 mx-auto transition-all">← Retour au QG</button>
          <h1 className="font-display text-3xl md:text-5xl text-white uppercase mb-4 drop-shadow-lg">L'Escouade <span className="text-orange-500">Alpha</span></h1>
        </div>
        <div className="flex-grow flex items-center justify-between w-full pb-20 max-w-5xl mx-auto">
          <div className="w-1/3 flex justify-start">{members[0] && <MemberCard member={members[0]} socials={socialLinks[0]} align="left" isAdmin={isAdmin} onEdit={setEditingMember} onDelete={async (id) => { if (window.confirm('Supprimer?')) { await supabase.from('team_members').delete().eq('id', id); fetchMembers(); } }} />}</div>
          <div className="w-1/3"></div>
          <div className="w-1/3 flex justify-end">{members[1] && <MemberCard member={members[1]} socials={socialLinks[1]} align="right" isAdmin={isAdmin} onEdit={setEditingMember} onDelete={async (id) => { if (window.confirm('Supprimer?')) { await supabase.from('team_members').delete().eq('id', id); fetchMembers(); } }} />}</div>
        </div>
      </div>
    </div>
  );
}

// --- CARTE MEMBRE ---
function MemberCard({ member, socials, align, isAdmin, onEdit, onDelete }) {
  const [showInfo, setShowInfo] = useState(false);

  const icons = {
    instagram: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3 h-3"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" strokeWidth="2"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2"></line></svg>,
    tiktok: <svg fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path></svg>,
    youtube: <svg fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>,
    twitch: <svg fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3"><path d="M11.571 4.714h2.572v9h-2.572v-9zm-4.715 0h2.572v9H6.856v-9zm14.571-4.714v16.286l-5.143 5.143h-5.143l-3.428 2.571v-2.571h-3.429L1.714 18.857V0h19.714zM2.571 18h4.286v2.571l2.571-2.571h4.286l5.143-5.143V1.714H2.571V18z"></path></svg>
  };

  return (
    <div className={`pointer-events-auto transform transition-all duration-300 md:w-80 relative group z-10 ${align === 'right' ? 'text-right' : 'text-left'}`} onClick={() => setShowInfo(!showInfo)}>
      {isAdmin && (
        <div className={`absolute -top-8 ${align === 'right' ? 'right-0' : 'left-0'} flex gap-2 z-30`}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(member) }} className="text-[10px] bg-blue-600 px-2 py-1 text-white font-bold">EDIT</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(member.id) }} className="text-[10px] bg-red-600 px-2 py-1 text-white font-bold">X</button>
        </div>
      )}
      <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-orange-500/50 shadow-[0_0_20px_rgba(255,100,0,0.3)] relative mx-auto lg:mx-0 ${align === 'right' ? 'lg:ml-auto' : 'lg:mr-auto'} transition-all duration-500 cursor-pointer ${showInfo ? 'scale-110 border-orange-500 ring-2 ring-orange-500/30' : 'grayscale opacity-90 lg:hover:grayscale-0 lg:hover:opacity-100 lg:hover:scale-105'}`}>
        <img src={member.image_url || "https://placehold.co/400"} className="w-full h-full object-cover" alt={member.name} />
      </div>
      <div className={`mt-4 bg-black/80 backdrop-blur-md border border-orange-900/50 p-4 rounded-lg shadow-2xl transition-all duration-500 ease-in-out origin-top ${showInfo ? 'opacity-100 max-h-[500px] translate-y-0' : 'opacity-0 max-h-0 translate-y-[-20px] overflow-hidden'} lg:opacity-100 lg:max-h-[500px] lg:translate-y-0 lg:block`}>
        <h3 className="font-display text-lg md:text-xl text-white uppercase leading-none">{member.name}</h3>
        <p className="text-orange-500 text-[10px] md:text-xs uppercase tracking-widest mb-2 mt-1">{member.role}</p>
        <p className="text-gray-300 text-xs font-light leading-relaxed mb-4">{member.description}</p>

        <div className={`flex gap-3 pt-3 border-t border-orange-900/30 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
          {socials && Object.entries(socials).map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full border border-survie-grey/50 flex items-center justify-center text-gray-400 hover:text-black hover:bg-survie-khaki hover:border-survie-khaki transition-all duration-300 group/icon"
              title={platform}
            >
              {icons[platform]}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- CARTE OBJET (3D) ---
const CarteObjet = ({ item, onDonationSuccess, onDelete, onEdit, isAdmin, user, openAuth }) => {
  const pourcentage = Math.min((item.cagnotte / item.prix) * 100, 100);
  const isCompleted = pourcentage >= 100;
  const [step, setStep] = useState(0);
  const [montantDon, setMontantDon] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleContributeClick = () => { if (!user) { openAuth(); } else { setStep(1); } };

  const lancerPaiement = () => {
    const montant = parseFloat(montantDon);
    if (!montant || montant < 2) { alert("Le montant minimum est de 2€."); return; }
    const url = `https://www.paypal.com/paypalme/${PAYPAL_ME_USER}/${montant}EUR`;
    window.open(url, '_blank');
    setStep(2);
  };

  // --- MODIFICATION ICI : ENVOI VERS PENDING_DONATIONS ---
  const confirmerDon = async () => {
    const montant = parseFloat(montantDon);
    if (!montant) return;

    try {
      const { error } = await supabase.from('pending_donations').insert([
        { item_id: item.id, amount: montant, status: 'pending' }
      ]);

      if (error) throw error;

      alert("Merci ! Votre don a été transmis au QG. Il sera ajouté à la cagnotte après validation par un administrateur.");
      setStep(0);
      setMontantDon("");
    } catch (err) {
      alert("Erreur transmission: " + err.message);
    }
  };
  // -------------------------------------------------------

  const handleImageUpload = async (event) => { if (!isAdmin) return; try { setUploading(true); const file = event.target.files[0]; if (!file) return; const fileExt = file.name.split('.').pop(); const fileName = `${item.id}-${Math.random().toString(36).substring(2)}.${fileExt}`; const { error: uploadError } = await supabase.storage.from('images-objets').upload(fileName, file); if (uploadError) throw uploadError; const { data: { publicUrl } } = supabase.storage.from('images-objets').getPublicUrl(fileName); const { error: updateError } = await supabase.from('items').update({ image_url: publicUrl }).eq('id', item.id); if (updateError) throw updateError; onDonationSuccess(); alert("Image mise à jour."); } catch (error) { alert("Erreur: " + error.message); } finally { setUploading(false); } };

  return (
    <div className="h-full w-full group relative bg-survie-card border border-survie-grey/30 p-0 overflow-hidden flex flex-col select-none bg-opacity-100 hover:border-survie-khaki/50 transition-colors">
      {isAdmin && (
        <div className="absolute top-2 left-2 z-30 flex gap-2">
          <button onClick={() => onEdit(item)} className="bg-blue-600/80 hover:bg-blue-600 text-white p-1.5 rounded backdrop-blur-sm transition-colors" title="Modifier">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button onClick={() => onDelete(item.id)} className="bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded backdrop-blur-sm transition-colors" title="Supprimer">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
          </button>
        </div>
      )}
      <div className="h-32 md:h-64 w-full bg-[#0f0f0f] relative flex items-center justify-center overflow-hidden shrink-0 group/image">
        {item.image_url ? (<img src={item.image_url} alt={item.nom} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0 pointer-events-none" />) : (<div className="text-survie-grey border-2 border-dashed border-survie-grey/20 p-8 rounded"><span className="font-display text-4xl opacity-20">IMG</span></div>)}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-survie-bg/90 backdrop-blur border border-survie-grey/50 px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-xs font-bold tracking-widest text-survie-khaki uppercase">{item.prix} €</div>
        {isAdmin && (<div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 pointer-events-auto cursor-pointer" onClick={() => fileInputRef.current?.click()}><span className="text-white text-xs uppercase font-bold tracking-widest border border-white px-3 py-1 hover:bg-white hover:text-black transition-colors">{uploading ? '...' : '📷 Admin'}</span><input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" /></div>)}
      </div>
      <div className="p-3 md:p-6 flex flex-col flex-grow bg-survie-card">
        <h3 className="font-display text-base md:text-xl mb-1 text-white uppercase tracking-wide truncate">{item.nom}</h3>
        <p className={`text-gray-400 text-[9px] md:text-xs mb-2 md:mb-4 font-light border-l-2 border-survie-grey/30 pl-2 md:pl-4 flex-grow leading-tight ${step > 0 ? 'hidden' : 'line-clamp-3'}`}>{item.description}</p>
        <div className="mt-auto">
          <div className="flex justify-between text-[9px] font-bold text-survie-khaki mb-1 md:mb-2 uppercase tracking-[0.2em]"><span>{item.cagnotte}€</span><span>{Math.round(pourcentage)}%</span></div>
          <div className="w-full h-0.5 md:h-1 bg-survie-grey/30 mb-2 md:mb-4 relative"><div className="h-full bg-survie-khaki transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(138,154,91,0.4)]" style={{ width: `${pourcentage}%` }}></div></div>
          {isCompleted ? (<button disabled className="w-full py-2 md:py-3 bg-survie-grey/20 text-survie-grey border border-survie-grey/20 font-display uppercase tracking-widest text-[9px] md:text-xs cursor-not-allowed">Objectif Atteint</button>) : step === 0 ? (<button onClick={handleContributeClick} className="w-full py-2 md:py-3 bg-transparent border border-survie-khaki text-survie-khaki hover:bg-survie-khaki hover:text-black font-display uppercase tracking-widest text-[9px] md:text-xs transition-all duration-300 active:scale-95 touch-manipulation relative z-10">Contribuer {user ? '' : '(Connexion)'}</button>) : step === 1 ? (<div className="bg-white/5 p-2 rounded border border-survie-khaki/30 animate-fade-in-up relative z-10"><label className="text-[9px] uppercase text-survie-khaki tracking-widest block mb-1 text-center">Montant du don (€)</label><input type="number" min="2" step="1" placeholder="2" autoFocus className="w-full bg-survie-card border border-survie-grey/50 p-2 text-white text-center font-display text-lg focus:border-survie-khaki outline-none mb-3" value={montantDon} onChange={(e) => setMontantDon(e.target.value)} /><button onClick={lancerPaiement} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[9px] md:text-xs tracking-widest mb-2">Ouvrir PayPal</button><button onClick={() => setStep(0)} className="text-[9px] text-survie-grey w-full text-center hover:text-white uppercase">Annuler</button></div>) : (<div className="bg-green-900/20 p-2 rounded border border-green-500/30 animate-fade-in-up relative z-10"><p className="text-[9px] md:text-xs text-white text-center mb-2">Virement PayPal effectué ?</p><button onClick={confirmerDon} className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold uppercase text-[9px] md:text-xs tracking-widest mb-2">Je confirme</button><button onClick={() => setStep(1)} className="text-[9px] text-survie-grey w-full text-center hover:text-white uppercase">Non</button></div>)}
        </div>
      </div>
    </div>
  );
};

// --- LOGO DELTA ---
const LogoDelta = ({ onClick }) => (
  <svg onClick={onClick} className="h-8 w-auto md:h-10 cursor-pointer hover:opacity-80 transition-opacity" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10L90 90H10L50 10Z" stroke="#8a9a5b" strokeWidth="3" fill="none" />
    <path d="M50 25L80 85H20L50 25Z" fill="#8a9a5b" fillOpacity="0.2" />
    <line x1="10" y1="90" x2="90" y2="90" stroke="white" strokeWidth="1" strokeDasharray="4 2" />
  </svg>
);

// ==========================================
// 4. MAIN APP
// ==========================================

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showLegal, setShowLegal] = useState(false);

  // --- NOUVEAUX STATES ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [view, setView] = useState('aventure');
  const [nightVision, setNightVision] = useState(false);
  const [nvgAnimating, setNvgAnimating] = useState(false);

  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const carouselRef = useRef(null);
  const animationFrameId = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const [radius, setRadius] = useState(950);

  const totalCagnotte = items.reduce((acc, item) => acc + (item.cagnotte || 0), 0);
  const totalObjectif = items.reduce((acc, item) => acc + (item.prix || 0), 0);
  const progressGlobal = totalObjectif > 0 ? (totalCagnotte / totalObjectif) * 100 : 0;

  useEffect(() => {
    window.addEventListener('click', createSprayEffect);
    return () => window.removeEventListener('click', createSprayEffect);
  }, []);

  const toggleNightVision = () => {
    if (nightVision) {
      setNightVision(false);
    } else {
      setNvgAnimating(true);
      setTimeout(() => { setNightVision(true); }, 400);
      setTimeout(() => { setNvgAnimating(false); }, 1400);
    }
  };

  useEffect(() => {
    const calculateRadius = () => {
      const w = window.innerWidth;
      const count = items.length || 1;
      let spacing, minVisualRadius;
      if (w < 768) { spacing = 230; minVisualRadius = 520; }
      else if (w < 1024) { spacing = 340; minVisualRadius = 750; }
      else { spacing = 380; minVisualRadius = 1000; }
      const radiusBasedOnCount = (count * spacing) / (2 * Math.PI);
      setRadius(Math.max(minVisualRadius, radiusBasedOnCount));
    };
    calculateRadius();
    window.addEventListener('resize', calculateRadius);
    return () => window.removeEventListener('resize', calculateRadius);
  }, [items]);

  useEffect(() => {
    const checkAdmin = async (currentUser) => {
      if (!currentUser?.email) { setIsAdmin(false); return; }
      const { data } = await supabase.from('admins').select('email').eq('email', currentUser.email).single();
      setIsAdmin(!!data);
    };
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      checkAdmin(session?.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      checkAdmin(session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from('items').select('*').order('id');
    if (!error) setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchItems(); }, []);

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet équipement ? Cette action est irréversible.")) return;
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) alert("Erreur suppression: " + error.message);
    else fetchItems();
  };

  const animate = () => {
    if (view !== 'home') return;
    currentRotation.current += (targetRotation.current - currentRotation.current) * 0.02;
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateZ(-${radius}px) rotateY(${currentRotation.current}deg)`;
      const cards = carouselRef.current.children;
      const anglePerItem = items.length > 0 ? 360 / items.length : 0;
      for (let i = 0; i < cards.length; i++) {
        const cardAngle = i * anglePerItem + currentRotation.current;
        let normalizedAngle = (cardAngle % 360 + 360) % 360;
        if (normalizedAngle > 180) normalizedAngle -= 360;
        const distanceFromFront = Math.abs(normalizedAngle);
        const brightness = 100 - (distanceFromFront / 180) * 70;
        cards[i].style.filter = `brightness(${brightness}%)`;
        cards[i].style.zIndex = Math.round(1000 - distanceFromFront);
      }
    }
    animationFrameId.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!loading && items.length > 0 && view === 'home') {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [loading, items, radius, view]);

  useEffect(() => {
    const preventDefaultWheel = (e) => {
      if (view === 'home') {
        e.preventDefault();
        targetRotation.current -= e.deltaY * 0.05;
      }
    };
    window.addEventListener('wheel', preventDefaultWheel, { passive: false });
    return () => window.removeEventListener('wheel', preventDefaultWheel);
  }, [view]);

  const handleTouchStart = (e) => {
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
    currentRotation.current = targetRotation.current;
  };
  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX.current;
    targetRotation.current += deltaX * 0.04;
    startX.current = currentX;
    currentRotation.current = targetRotation.current;
  };
  const handleTouchEnd = () => { isDragging.current = false; };

  const anglePerItem = items.length > 0 ? 360 / items.length : 0;

  return (
    <div
      className={`min-h-screen bg-survie-bg font-body selection:bg-survie-khaki selection:text-black overflow-hidden flex flex-col ${nightVision ? 'mode-nvg' : ''}`}
      style={{ touchAction: view === 'home' ? 'none' : 'auto' }}
      onTouchStart={view === 'home' ? handleTouchStart : undefined}
      onTouchMove={view === 'home' ? handleTouchMove : undefined}
      onTouchEnd={view === 'home' ? handleTouchEnd : undefined}
    >
      <div className={`nvg-transition-overlay ${nvgAnimating ? 'nvg-animating' : ''}`}></div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {showLegal && <LegalModal onClose={() => setShowLegal(false)} />}

      {/* OVERLAY MENU MOBILE */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        setView={setView}
        currentView={view}
      />

      {/* DASHBOARD ADMIN */}
      {showAdminPanel && <AdminDashboard onClose={() => setShowAdminPanel(false)} />}

      {editingItem && <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} onSuccess={fetchItems} />}
      {editingItem === false && <EditItemModal item={null} onClose={() => setEditingItem(null)} onSuccess={fetchItems} />}

      <header className="fixed w-full z-40 bg-survie-bg/80 backdrop-blur-md border-b border-survie-grey/20 pointer-events-auto">
        <div className="max-w-[95vw] mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4 md:gap-6">
            <LogoDelta onClick={() => setView('aventure')} />
            <nav className="hidden md:flex gap-4">
              <button onClick={() => setView('aventure')} className={`text-xs uppercase tracking-widest hover:text-survie-khaki transition-colors ${view === 'aventure' ? 'text-survie-khaki font-bold' : 'text-survie-grey'}`}>Notre Aventure</button>
              <button onClick={() => setView('home')} className={`text-xs uppercase tracking-widest hover:text-survie-khaki transition-colors ${view === 'home' ? 'text-survie-khaki font-bold' : 'text-survie-grey'}`}>Inventaire</button>
              <button onClick={() => setView('about')} className={`text-xs uppercase tracking-widest hover:text-survie-khaki transition-colors ${view === 'about' ? 'text-survie-khaki font-bold' : 'text-survie-grey'}`}>À Propos</button>
              <button onClick={() => setView('collaborators')} className={`text-xs uppercase tracking-widest hover:text-survie-khaki transition-colors ${view === 'collaborators' ? 'text-survie-khaki font-bold' : 'text-survie-grey'}`}>Collaborateurs</button>
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={toggleNightVision} className={`p-2 border rounded-full transition-all group ${nightVision ? 'bg-survie-khaki border-survie-khaki' : 'border-survie-grey hover:border-survie-khaki'}`} title="Vision Nocturne">
              <svg className={`h-4 w-4 ${nightVision ? 'text-black' : 'text-survie-grey group-hover:text-survie-khaki'}`} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="7" cy="10" r="3" /> <circle cx="17" cy="10" r="3" /> <circle cx="12" cy="17" r="3" />
              </svg>
            </button>

            {/* BOUTON BURGER (VISIBLE UNIQUEMENT MOBILE) */}
            <div className="flex md:hidden mr-1">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 border border-survie-grey/50 hover:bg-survie-khaki/20 hover:border-survie-khaki transition-colors"
                aria-label="Menu"
              >
                <div className="space-y-1">
                  <div className="w-5 h-0.5 bg-survie-khaki"></div>
                  <div className="w-5 h-0.5 bg-survie-khaki"></div>
                  <div className="w-3 h-0.5 bg-survie-khaki ml-auto"></div>
                </div>
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden md:block">
                  <div className="text-[10px] text-survie-khaki uppercase tracking-widest">{isAdmin ? 'CMD' : 'OP'}</div>
                </div>
                {isAdmin && (
                  <>
                    <button onClick={() => setShowAdminPanel(true)} className="px-2 py-1 md:px-4 md:py-2 border border-yellow-500 text-yellow-500 text-[10px] md:text-xs uppercase hover:bg-yellow-500 hover:text-black transition-colors font-bold animate-pulse">
                      ⚠️ DONS
                    </button>
                    <button onClick={() => setEditingItem(false)} className="px-2 py-1 md:px-4 md:py-2 border border-survie-khaki bg-survie-khaki/10 text-survie-khaki text-[10px] md:text-xs uppercase hover:bg-survie-khaki hover:text-black transition-colors font-bold">+ </button>
                  </>
                )}
                <button onClick={() => supabase.auth.signOut()} className="px-2 py-1 md:px-4 md:py-2 border border-survie-grey/50 text-[10px] md:text-xs uppercase hover:text-red-500 text-survie-grey bg-survie-card">Exit</button>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="px-3 py-1 md:px-6 md:py-2 bg-survie-khaki text-black text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">Login</button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-center relative w-full pt-20 md:pt-24">

        {view === 'aventure' && <PageAventure onGoToInventory={() => setView('home')} isAdmin={isAdmin} />}

        {view === 'about' && <PageAbout onBack={() => setView('aventure')} isAdmin={isAdmin} />}

        {view === 'collaborators' && <PageCollaborators isAdmin={isAdmin} />}

        {view === 'home' && (
          <>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-20 md:opacity-40 overflow-hidden">
              <h1 className="font-display text-[20vw] md:text-[10vw] text-survie-grey/20 uppercase leading-none text-center whitespace-nowrap">TACTICAL<br />GEAR</h1>
            </div>

            <div className="px-4 md:px-12 mb-2 md:mb-4 animate-fade-in-up pointer-events-none select-none text-center z-10 relative mt-4 md:mt-0">
              <p className="text-survie-khaki text-[9px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] mb-1 md:mb-2">Inventaire</p>
              <h2 className="font-display text-3xl md:text-6xl text-white uppercase leading-[0.9]"><span className="text-transparent bg-clip-text bg-gradient-to-r from-survie-khaki to-white">Nos</span> Besoins</h2>
            </div>

            {!loading && items.length > 0 && (
              <div className="w-full max-w-2xl mx-auto px-6 mb-8 relative z-20 animate-fade-in-up">
                <div className="flex justify-between items-end mb-2 font-mono text-xs md:text-sm">
                  <span className="text-survie-khaki tracking-widest">PROGRESSION MISSION</span>
                  <span className="text-white">{Math.round(progressGlobal)}%</span>
                </div>
                <div className="w-full h-3 bg-survie-card border border-survie-grey/50 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #8a9a5b 10px, #8a9a5b 11px)' }}></div>
                  <div className="h-full bg-survie-khaki shadow-[0_0_20px_rgba(138,154,91,0.6)] transition-all duration-1000 ease-out relative" style={{ width: `${progressGlobal}%` }}>
                    <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50"></div>
                  </div>
                </div>
                <div className="flex justify-between mt-1 font-mono text-[10px] text-gray-500">
                  <span>{totalCagnotte.toLocaleString()} € COLLECTÉS</span>
                  <span>OBJECTIF: {totalObjectif.toLocaleString()} €</span>
                </div>
              </div>
            )}

            {loading ? <div className="text-center text-survie-khaki font-mono animate-pulse z-20">CHARGEMENT...</div> : (
              <div className="scene-3d z-20 mt-2 md:mt-8 relative">
                <div className="absolute bottom-0 w-[80%] h-20 bg-black/80 blur-[60px] md:blur-[100px] rounded-[50%] pointer-events-none"></div>
                <div ref={carouselRef} className="carousel-3d">
                  {items.map((item, index) => (
                    <div key={item.id} className="card-container-3d" style={{ transform: `rotateY(${index * anglePerItem}deg) translateZ(${radius}px)` }}>
                      <CarteObjet item={item} onDonationSuccess={fetchItems} onDelete={handleDeleteItem} onEdit={(i) => setEditingItem(i)} user={user} isAdmin={isAdmin} openAuth={() => setShowAuth(true)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="text-center text-survie-grey/50 text-[9px] md:text-xs uppercase tracking-widest mt-2 md:mt-8 mb-4 animate-pulse pointer-events-none z-10">Glissez pour explorer</div>
          </>
        )}
      </main>

      <Footer onOpenLegal={() => setShowLegal(true)} />
    </div>
  );
}