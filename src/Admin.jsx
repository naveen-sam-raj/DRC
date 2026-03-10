import { useState, useEffect, useRef } from "react";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? `http://${window.location.hostname}:3001/api`
  : "https://drc-32zw.onrender.com/api";
const F = "'Inter', sans-serif";

// ── helpers ──────────────────────────────────────────────────────
const apiFetch = async (url, opts = {}) => {
  const res = await fetch(API + url, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  return res.json();
};
const api = {
  get:    (url)        => apiFetch(url),
  post:   (url, data)  => apiFetch(url, { method: "POST", body: JSON.stringify(data) }),
  put:    (url, data)  => apiFetch(url, { method: "PUT",  body: JSON.stringify(data) }),
  delete: (url)        => apiFetch(url, { method: "DELETE" }),
};

const formatDate = (d) => { if (!d) return "-"; const [y,m,day]=d.split("-"); return `${day}/${m}/${y}`; };
const getAge = (b) => { if(!b) return ""; const t=new Date(),bd=new Date(b); let a=t.getFullYear()-bd.getFullYear(); if(t.getMonth()-bd.getMonth()<0||(t.getMonth()===bd.getMonth()&&t.getDate()<bd.getDate()))a--; return a; };
const isBirthdayToday = (b) => { if(!b)return false; const t=new Date(); return b.slice(5)===`${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`; };

// ── TOAST ─────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "#22c55e", error: "#ef4444", info: "#3b82f6" };
  return (
    <div style={{ position:"fixed",bottom:28,right:28,zIndex:9999,background:"#1e293b",color:"#fff",padding:"14px 22px",borderRadius:12,fontFamily:F,fontSize:"0.875rem",fontWeight:500,display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 32px rgba(0,0,0,0.25)",borderLeft:`4px solid ${colors[type]||colors.info}`,maxWidth:380,animation:"slideIn 0.3s ease" }}>
      <span>{type==="success"?"✅":type==="error"?"❌":"ℹ️"}</span>{msg}
    </div>
  );
}

// ── GENERIC MODAL WRAPPER ─────────────────────────────────────────
function Modal({ children }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div style={{ background:"#fff",borderRadius:20,padding:32,width:"100%",maxWidth:500,boxShadow:"0 24px 64px rgba(0,0,0,0.2)",maxHeight:"90vh",overflowY:"auto" }}>
        {children}
      </div>
    </div>
  );
}

const INP = { width:"100%",padding:"11px 14px",border:"1.5px solid #e2e8f0",borderRadius:10,fontFamily:F,fontSize:"0.875rem",color:"#1e293b",background:"#f8fafc",outline:"none",boxSizing:"border-box" };
const LBL = { fontFamily:F,fontSize:"0.72rem",fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:5 };
function Field({ label, ...props }) { return <div><label style={LBL}>{label}</label><input style={INP} onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} {...props}/></div>; }

// ── MEMBER FORM ────────────────────────────────────────────────────
function MemberForm({ member, onSave, onCancel }) {
  const [form,setForm] = useState(member || {name:"",phone:"",birthday:"",email:"",address:""});
  const [loading,setLoading] = useState(false);
  const h = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const submit = async e => {
    e.preventDefault(); if(!form.name||!form.phone) return alert("Name and Phone required");
    setLoading(true);
    if(member?.id) await api.put(`/members/${member.id}`,form); else await api.post("/members",form);
    setLoading(false); onSave();
  };
  return (
    <Modal>
      <div style={{fontFamily:F,fontSize:"1.1rem",fontWeight:700,color:"#1e293b",marginBottom:24}}>{member?.id?"✏️ Edit Member":"➕ Add Member"}</div>
      <form onSubmit={submit}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[{label:"Full Name *",name:"name",type:"text"},{label:"Phone *",name:"phone",type:"tel"},{label:"Birthday",name:"birthday",type:"date"},{label:"Email",name:"email",type:"email"},{label:"Address",name:"address",type:"text"}].map(({label,name,type})=>(
            <Field key={name} label={label} type={type} name={name} value={form[name]} onChange={h}/>
          ))}
        </div>
        <div style={{display:"flex",gap:12,marginTop:24}}>
          <button type="submit" disabled={loading} style={{flex:1,padding:"12px",background:"linear-gradient(135deg,#1a237e,#3949ab)",color:"#fff",border:"none",borderRadius:10,fontFamily:F,fontWeight:700,fontSize:"0.875rem",cursor:"pointer"}}>{loading?"Saving...":member?.id?"Update":"Add Member"}</button>
          <button type="button" onClick={onCancel} style={{flex:1,padding:"12px",background:"#f1f5f9",color:"#475569",border:"none",borderRadius:10,fontFamily:F,fontWeight:600,fontSize:"0.875rem",cursor:"pointer"}}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

// ── EVENT FORM ─────────────────────────────────────────────────────
function EventForm({ event, onSave, onCancel }) {
  const [form,setForm] = useState(event || {date:"",title:"",desc:"",tag:"Upcoming"});
  const [loading,setLoading] = useState(false);
  const h = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const submit = async e => {
    e.preventDefault(); if(!form.title||!form.date) return alert("Date and Title required");
    setLoading(true);
    if(event?.id) await api.put(`/events/${event.id}`,form); else await api.post("/events",form);
    setLoading(false); onSave();
  };
  const TAGS = ["Upcoming","Special","Youth","Outreach","Community","Prayer","Other"];
  return (
    <Modal>
      <div style={{fontFamily:F,fontSize:"1.1rem",fontWeight:700,color:"#1e293b",marginBottom:24}}>{event?.id?"✏️ Edit Event":"➕ Add Event"}</div>
      <form onSubmit={submit}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Field label="Date Label *" name="date" type="text" value={form.date} onChange={h} placeholder="e.g. MAR 15"/>
          <Field label="Event Title *" name="title" type="text" value={form.title} onChange={h} placeholder="Event name"/>
          <Field label="Description" name="desc" type="text" value={form.desc} onChange={h} placeholder="Short description"/>
          <div>
            <label style={LBL}>Tag</label>
            <select name="tag" value={form.tag} onChange={h} style={{...INP}}>
              {TAGS.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:"flex",gap:12,marginTop:24}}>
          <button type="submit" disabled={loading} style={{flex:1,padding:"12px",background:"linear-gradient(135deg,#1a237e,#3949ab)",color:"#fff",border:"none",borderRadius:10,fontFamily:F,fontWeight:700,fontSize:"0.875rem",cursor:"pointer"}}>{loading?"Saving...":event?.id?"Update":"Add Event"}</button>
          <button type="button" onClick={onCancel} style={{flex:1,padding:"12px",background:"#f1f5f9",color:"#475569",border:"none",borderRadius:10,fontFamily:F,fontWeight:600,fontSize:"0.875rem",cursor:"pointer"}}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

// ── SERVICE FORM ───────────────────────────────────────────────────
function ServiceForm({ service, onSave, onCancel }) {
  const [form,setForm] = useState(service || {day:"",title:"",desc:"",icon:"🙏"});
  const [loading,setLoading] = useState(false);
  const h = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const submit = async e => {
    e.preventDefault(); if(!form.day||!form.title) return alert("Day and Title required");
    setLoading(true);
    if(service?.id) await api.put(`/services/${service.id}`,form); else await api.post("/services",form);
    setLoading(false); onSave();
  };
  const ICONS = ["🌅","☀️","🌙","🕯️","🔥","⭐","🍷","✝️","🙏","🌟","🕊️","📖","🎵","🎶","❤️","✨"];
  return (
    <Modal>
      <div style={{fontFamily:F,fontSize:"1.1rem",fontWeight:700,color:"#1e293b",marginBottom:24}}>{service?.id?"✏️ Edit Service":"➕ Add Service"}</div>
      <form onSubmit={submit}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Field label="Day *" name="day" type="text" value={form.day} onChange={h} placeholder="e.g. Sunday, Friday, Monthly 1st"/>
          <Field label="Service Title *" name="title" type="text" value={form.title} onChange={h} placeholder="e.g. Morning Service"/>
          <Field label="Time" name="desc" type="text" value={form.desc} onChange={h} placeholder="e.g. 9:00 AM"/>
          <div>
            <label style={LBL}>Icon</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
              {ICONS.map(ic=>(
                <button type="button" key={ic} onClick={()=>setForm(f=>({...f,icon:ic}))} style={{fontSize:22,padding:"6px 10px",borderRadius:8,border:`2px solid ${form.icon===ic?"#1a237e":"#e2e8f0"}`,background:form.icon===ic?"#e8eaf6":"#f8fafc",cursor:"pointer"}}>{ic}</button>
              ))}
            </div>
            <input style={INP} name="icon" value={form.icon} onChange={h} placeholder="Or type emoji"/>
          </div>
        </div>
        <div style={{display:"flex",gap:12,marginTop:24}}>
          <button type="submit" disabled={loading} style={{flex:1,padding:"12px",background:"linear-gradient(135deg,#1a237e,#3949ab)",color:"#fff",border:"none",borderRadius:10,fontFamily:F,fontWeight:700,fontSize:"0.875rem",cursor:"pointer"}}>{loading?"Saving...":service?.id?"Update":"Add Service"}</button>
          <button type="button" onClick={onCancel} style={{flex:1,padding:"12px",background:"#f1f5f9",color:"#475569",border:"none",borderRadius:10,fontFamily:F,fontWeight:600,fontSize:"0.875rem",cursor:"pointer"}}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

// ── SETTINGS ────────────────────────────────────────────────────────
function Settings({ onClose, showToast }) {
  const [cfg,setCfg] = useState({smsApiKey:"",senderName:"",churchName:"",adminPassword:""});
  const [testPhone,setTestPhone] = useState(""); const [loading,setLoading] = useState(false);
  useEffect(()=>{fetch(`http://${window.location.hostname}:3001/api/config`).then(r=>r.json()).then(d=>setCfg(c=>({...c,...d})));}, []);
  const save = async()=>{ await api.put("/config",cfg); showToast("Settings saved!","success"); };
  const testSMS = async()=>{
    if(!testPhone) return showToast("Enter test phone number","error");
    if(!cfg.smsApiKey) return showToast("⚠️ Enter and Save API key first!","error");
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/sms/test`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:testPhone})});
      const data = await res.json(); setLoading(false);
      if(data.success) showToast("✅ Test SMS sent!","success"); else showToast("❌ "+data.error,"error");
    } catch(err){ setLoading(false); showToast("❌ "+err.message,"error"); }
  };
  return (
    <Modal>
      <div style={{fontFamily:F,fontSize:"1.1rem",fontWeight:700,color:"#1e293b",marginBottom:24}}>⚙️ Settings</div>
      <div style={{background:"#f0f9ff",borderRadius:12,padding:16,marginBottom:16,border:"1px solid #bae6fd"}}>
        <div style={{fontFamily:F,fontSize:"0.8rem",fontWeight:700,color:"#0369a1",marginBottom:6}}>📱 Fast2SMS API Key</div>
        <div style={{fontFamily:F,fontSize:"0.72rem",color:"#64748b",marginBottom:8}}>Get free key from <a href="https://www.fast2sms.com" target="_blank" rel="noopener noreferrer" style={{color:"#0369a1"}}>fast2sms.com</a> → Dev API → API Key tab</div>
        <input type="password" value={cfg.smsApiKey||""} onChange={e=>setCfg(c=>({...c,smsApiKey:e.target.value}))} placeholder="Paste Fast2SMS API key" style={INP}/>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
        {[{label:"Church Name (in SMS)",key:"churchName",t:"text"},{label:"Admin Password",key:"adminPassword",t:"password"}].map(({label,key,t})=>(
          <div key={key}><label style={LBL}>{label}</label><input type={t} value={cfg[key]||""} onChange={e=>setCfg(c=>({...c,[key]:e.target.value}))} style={INP}/></div>
        ))}
      </div>
      <div style={{background:"#f0fdf4",borderRadius:12,padding:14,marginBottom:16,border:"1px solid #bbf7d0"}}>
        <div style={{fontFamily:F,fontSize:"0.8rem",fontWeight:700,color:"#15803d",marginBottom:8}}>🧪 Test SMS</div>
        <div style={{display:"flex",gap:8}}>
          <input type="tel" value={testPhone} onChange={e=>setTestPhone(e.target.value)} placeholder="Mobile number to test" style={{...INP,flex:1}}/>
          <button onClick={testSMS} disabled={loading} style={{padding:"11px 16px",background:"#22c55e",color:"#fff",border:"none",borderRadius:10,fontFamily:F,fontWeight:700,fontSize:"0.8rem",cursor:"pointer"}}>{loading?"...":"Send"}</button>
        </div>
      </div>
      <div style={{display:"flex",gap:12}}>
        <button onClick={save} style={{flex:1,padding:"12px",background:"linear-gradient(135deg,#1a237e,#3949ab)",color:"#fff",border:"none",borderRadius:10,fontFamily:F,fontWeight:700,fontSize:"0.875rem",cursor:"pointer"}}>Save Settings</button>
        <button onClick={onClose} style={{flex:1,padding:"12px",background:"#f1f5f9",color:"#475569",border:"none",borderRadius:10,fontFamily:F,fontWeight:600,fontSize:"0.875rem",cursor:"pointer"}}>Close</button>
      </div>
    </Modal>
  );
}

// ── GALLERY UPLOAD ─────────────────────────────────────────────────
function GalleryUpload({ onUploaded, onClose }) {
  const [file,setFile] = useState(null); const [caption,setCaption] = useState(""); const [loading,setLoading] = useState(false); const [preview,setPreview] = useState(null);
  const onFile = e => { const f=e.target.files[0]; if(f){setFile(f);setPreview(URL.createObjectURL(f));} };
  const submit = async() => {
    if(!file) return alert("Select an image");
    setLoading(true);
    const fd = new FormData(); fd.append("image",file); fd.append("caption",caption);
    const res = await fetch(API+"/gallery/upload",{method:"POST",body:fd});
    const data = await res.json(); setLoading(false);
    if(data.id) onUploaded(data); else alert("Upload failed: "+JSON.stringify(data));
  };
  return (
    <Modal>
      <div style={{fontFamily:F,fontSize:"1.1rem",fontWeight:700,color:"#1e293b",marginBottom:20}}>🖼️ Upload Gallery Image</div>
      <label style={{display:"block",border:"2px dashed #cbd5e1",borderRadius:14,padding:"32px",textAlign:"center",cursor:"pointer",marginBottom:14,background:"#f8fafc"}}>
        {preview ? <img src={preview} style={{maxHeight:180,borderRadius:10,maxWidth:"100%"}} alt="preview"/> : <div style={{fontFamily:F,color:"#94a3b8"}}>Click to select image 📷</div>}
        <input type="file" accept="image/*" onChange={onFile} style={{display:"none"}}/>
      </label>
      <div style={{marginBottom:14}}><label style={LBL}>Caption (optional)</label><input style={INP} value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Enter caption..."/></div>
      <div style={{display:"flex",gap:12}}>
        <button onClick={submit} disabled={loading||!file} style={{flex:1,padding:"12px",background:"linear-gradient(135deg,#1a237e,#3949ab)",color:"#fff",border:"none",borderRadius:10,fontFamily:F,fontWeight:700,cursor:"pointer"}}>{loading?"Uploading...":"Upload"}</button>
        <button onClick={onClose} style={{flex:1,padding:"12px",background:"#f1f5f9",color:"#475569",border:"none",borderRadius:10,fontFamily:F,fontWeight:600,cursor:"pointer"}}>Cancel</button>
      </div>
    </Modal>
  );
}

// ══ MAIN ADMIN ═════════════════════════════════════════════════════
export default function Admin() {
  const [authed,setAuthed]     = useState(false);
  const [password,setPassword] = useState("");
  const [loginErr,setLoginErr] = useState("");
  const [loginLoad,setLoginLoad]=useState(false);
  const [tab,setTab]           = useState("members"); // members | events | services | gallery
  const [toast,setToast]       = useState(null);

  // data
  const [members,setMembers]   = useState([]);
  const [events,setEvents]     = useState([]);
  const [services,setServices] = useState([]);
  const [gallery,setGallery]   = useState([]);
  const [todayBdays,setTodayBdays]=useState([]);
  const [hasSmsKey,setHasSmsKey]=useState(false);

  // UI state
  const [search,setSearch]     = useState("");
  const [showForm,setShowForm] = useState(false);
  const [editItem,setEditItem] = useState(null);
  const [showSettings,setShowSettings]=useState(false);
  const [showUpload,setShowUpload]=useState(false);
  const [smsLoading,setSmsLoading]=useState(false);
  const [replacingId,setReplacingId]=useState(null);
  const replaceInputRef = useRef(null);

  const showToast = (msg,type="info") => setToast({msg,type});

  const loadAll = async () => {
    const [m,e,s,g,t,cfg] = await Promise.all([
      api.get("/members"), api.get("/events"), api.get("/services"),
      api.get("/gallery"), api.get("/birthdays/today"), api.get("/config"),
    ]);
    setMembers(m); setEvents(e); setServices(s); setGallery(g);
    setTodayBdays(t); setHasSmsKey(cfg.hasSmsKey);
  };

  useEffect(() => { if(authed) loadAll(); }, [authed]);

  const login = async e => {
    e.preventDefault(); setLoginLoad(true); setLoginErr("");
    const res = await api.post("/auth/login",{password});
    setLoginLoad(false);
    if(res.success) setAuthed(true); else setLoginErr("Invalid password.");
  };

  const sendBirthdaySMSNow = async () => {
    if(!hasSmsKey){ showToast("⚠️ SMS API key not set! Go to ⚙️ Settings.","error"); return; }
    setSmsLoading(true);
    const res = await fetch(API+"/birthdays/send-now",{method:"POST",headers:{"Content-Type":"application/json"}}).then(r=>r.json());
    setSmsLoading(false);
    if(!res.success&&res.error) showToast("❌ "+res.error,"error");
    else if(res.membersNotified>0) showToast(`🎂 SMS sent to ${res.membersNotified} member(s)!`,"success");
    else showToast("No birthdays today!","info");
  };

  const del = async (type,id,name) => {
    if(!confirm(`Delete "${name}"?`)) return;
    await api.delete(`/${type}/${id}`);
    showToast(`Deleted "${name}"`,"error");
    loadAll();
  };

  const filtered = members.filter(m=>m.name?.toLowerCase().includes(search.toLowerCase())||m.phone?.includes(search));

  // Replace gallery image
  const handleReplace = (img) => {
    setReplacingId(img.id);
    replaceInputRef.current.click();
  };
  const doReplace = async (e) => {
    const file = e.target.files[0];
    if (!file || !replacingId) return;
    const fd = new FormData(); fd.append("image", file); fd.append("caption", gallery.find(g=>g.id===replacingId)?.caption||"");
    showToast("Replacing image...", "info");
    const res = await fetch(API+"/gallery/upload",{method:"POST",body:fd}).then(r=>r.json());
    if (res.id) {
      await api.delete(`/gallery/${replacingId}`);
      loadAll();
      showToast("✅ Image replaced!", "success");
    } else { showToast("❌ Upload failed", "error"); }
    setReplacingId(null);
    e.target.value = "";
  };

  const upcomingBdays = [...members].filter(m=>m.birthday).sort((a,b)=>{
    const t=new Date(), g=d=>{const x=new Date(d);x.setFullYear(t.getFullYear());if(x<t)x.setFullYear(t.getFullYear()+1);return x;};
    return g(a.birthday)-g(b.birthday);
  }).slice(0,5);

  const TAG_COLORS = { Upcoming:"#e8eaf6:#1a237e", Special:"#fef9c3:#a16207", Youth:"#dcfce7:#15803d", Outreach:"#fce7f3:#9d174d", Community:"#f0f9ff:#0369a1", Prayer:"#ede9fe:#6d28d9", Other:"#f1f5f9:#475569" };
  const tagStyle = tag => { const [bg,color]=(TAG_COLORS[tag]||"#f1f5f9:#475569").split(":"); return {background:bg,color,fontSize:"0.7rem",fontWeight:700,padding:"3px 10px",borderRadius:20,display:"inline-block"}; };

  // ── LOGIN ──
  if(!authed) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#e8eaf6,#fdfaf4)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,padding:16}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{background:"#fff",borderRadius:24,padding:40,width:"100%",maxWidth:400,boxShadow:"0 24px 64px rgba(26,35,126,0.12)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:56,height:56,background:"linear-gradient(135deg,#1a237e,#3949ab)",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 16px"}}>✝️</div>
          <div style={{fontSize:"1.3rem",fontWeight:800,color:"#1a237e"}}>Admin Panel</div>
          <div style={{fontSize:"0.8rem",color:"#94a3b8",marginTop:4}}>Divine Resurrection Church</div>
        </div>
        <form onSubmit={login}>
          <label style={LBL}>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter admin password" style={{...INP,marginBottom:loginErr?8:20,border:`1.5px solid ${loginErr?"#ef4444":"#e2e8f0"}`}}/>
          {loginErr&&<div style={{fontSize:"0.78rem",color:"#ef4444",marginBottom:16}}>{loginErr}</div>}
          <button type="submit" disabled={loginLoad} style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#1a237e,#3949ab)",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:"0.9rem",cursor:"pointer",boxShadow:"0 4px 16px rgba(26,35,126,0.3)"}}>{loginLoad?"Logging in...":"Login →"}</button>
        </form>
        <div style={{textAlign:"center",marginTop:16,fontSize:"0.72rem",color:"#94a3b8"}}>Default: <code style={{background:"#f1f5f9",padding:"2px 8px",borderRadius:6}}>admin@123</code></div>
        <a href="/" style={{display:"block",textAlign:"center",marginTop:12,fontSize:"0.78rem",color:"#64748b",textDecoration:"none"}}>← Back to Website</a>
      </div>
    </div>
  );

  const TABS = [
    { id:"members",  label:"👥 Members",  count:members.length },
    { id:"events",   label:"📅 Events",   count:events.length  },
    { id:"services", label:"⛪ Services",  count:services.length},
    { id:"gallery",  label:"🖼️ Gallery",  count:gallery.length },
  ];

  // ── DASHBOARD ──
  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:F}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        table { width: 100%; border-collapse: collapse; }
        th { background: #f1f5f9; color: #64748b; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 11px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
        td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 0.82rem; color: #1e293b; vertical-align: middle; }
        tr:hover td { background: #fafafa; }

        /* ── HEADER MOBILE ── */
        .admin-header-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
        .admin-header-btns { display: flex; gap: 6px; }
        .admin-header-btns button, .admin-header-btns a { padding: 6px 10px !important; font-size: 0.72rem !important; }

        /* ── STATS GRID ── */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }

        /* ── TABS ── */
        .tabs-bar { display: flex; gap: 4px; background: #fff; padding: 5px; border-radius: 14px; border: 1px solid #e2e8f0; overflow-x: auto; width: fit-content; max-width: 100%; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .tabs-bar::-webkit-scrollbar { display: none; }
        .tab-btn { padding: 8px 14px; border: none; border-radius: 10px; font-family: 'Inter',sans-serif; font-weight: 600; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 5px; white-space: nowrap; transition: all 0.2s; }

        /* ── TABLE WRAPPER ── */
        .table-wrap { overflow-x: auto; margin-top: 12px; -webkit-overflow-scrolling: touch; }

        /* ── MEMBERS LAYOUT ── */
        .members-layout { display: grid; grid-template-columns: 1fr 280px; gap: 20px; }

        /* ── GALLERY GRID ── */
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }

        /* ── MODAL ── */
        .modal-box { background: #fff; border-radius: 20px; padding: 28px 24px; width: 100%; max-width: 500px; box-shadow: 0 24px 64px rgba(0,0,0,0.2); max-height: 92vh; overflow-y: auto; }

        /* ════ MOBILE ════════════════════════════════════════ */
        @media (max-width: 768px) {
          .admin-header-inner { height: auto; flex-wrap: wrap; gap: 8px; padding: 10px 0; }
          .admin-header-brand { flex: 1; }
          .admin-header-btns { flex-wrap: wrap; }
          .admin-header-btns button, .admin-header-btns a { padding: 6px 10px !important; font-size: 0.7rem !important; }

          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px; }

          .tabs-bar { width: 100%; max-width: 100%; margin-bottom: 16px; }

          .members-layout { grid-template-columns: 1fr !important; }

          .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }

          .modal-box { padding: 20px 16px; border-radius: 16px; }

          td, th { padding: 10px 10px; font-size: 0.78rem; }

          /* Hide less important table columns on mobile */
          .hide-mobile { display: none !important; }
        }

        @media (max-width: 400px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .gallery-grid { grid-template-columns: 1fr 1fr !important; }
          .tab-btn { padding: 7px 10px; font-size: 0.72rem; }
        }
      `}</style>

        <div style={{background:"linear-gradient(135deg,#1a237e,#3949ab)",padding:"0 16px",boxShadow:"0 2px 12px rgba(26,35,126,0.3)"}}>
        <div style={{maxWidth:1400,margin:"0 auto"}} className="admin-header-inner">
          <div style={{display:"flex",alignItems:"center",gap:10}} className="admin-header-brand">
            <span style={{fontSize:20}}>✝️</span>
            <div><div style={{fontSize:"0.88rem",fontWeight:700,color:"#fff"}}>DRC Admin</div><div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.6)"}}>Content Management</div></div>
          </div>
          <div className="admin-header-btns">
            <a href="/" style={{padding:"7px 14px",background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,fontFamily:F,fontWeight:600,fontSize:"0.78rem",cursor:"pointer",textDecoration:"none"}}>🌐 Website</a>
            <button onClick={()=>setAuthed(false)} style={{padding:"7px 14px",background:"rgba(255,50,50,0.25)",color:"#fca5a5",border:"1px solid rgba(255,100,100,0.3)",borderRadius:8,fontFamily:F,fontWeight:600,fontSize:"0.78rem",cursor:"pointer"}}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:"0 auto",padding:"24px"}}>

        {/* SMS Key Warning */}
        {!hasSmsKey&&<div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:12,padding:"12px 18px",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span>⚠️</span><div><div style={{fontFamily:F,fontWeight:700,color:"#b91c1c",fontSize:"0.85rem"}}>SMS API Key not configured!</div><div style={{fontFamily:F,fontSize:"0.75rem",color:"#dc2626"}}>Birthday SMS will NOT send. Add Fast2SMS key in Settings.</div></div></div>
        </div>}

        {/* Today's Birthdays */}
        {todayBdays.length>0&&<div style={{background:"linear-gradient(135deg,#fef9c3,#fde68a)",border:"1px solid #fbbf24",borderRadius:14,padding:"16px 20px",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div><div style={{fontWeight:700,color:"#92400e",fontSize:"0.9rem"}}>🎂 Today's Birthdays!</div><div style={{fontSize:"0.82rem",color:"#a16207",marginTop:3}}>{todayBdays.map(m=>m.name).join(", ")}</div></div>
          <button onClick={sendBirthdaySMSNow} disabled={smsLoading} style={{padding:"9px 18px",background:"#d97706",color:"#fff",border:"none",borderRadius:10,fontFamily:F,fontWeight:700,fontSize:"0.8rem",cursor:"pointer"}}>{smsLoading?"Sending...":"📱 Send Birthday SMS"}</button>
        </div>}

        {/* TABS */}
        <div className="tabs-bar" style={{marginBottom:16}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id);setSearch("");}} className="tab-btn" style={{background:tab===t.id?"linear-gradient(135deg,#1a237e,#3949ab)":"transparent",color:tab===t.id?"#fff":"#64748b"}}>
              {t.label} <span style={{background:tab===t.id?"rgba(255,255,255,0.2)":"#f1f5f9",color:tab===t.id?"#fff":"#94a3b8",fontSize:"0.68rem",padding:"2px 7px",borderRadius:20,fontWeight:700}}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className={tab==="members"?"members-layout":""}>

          {/* ── MEMBERS TAB ── */}
          {tab==="members"&&<>
            <div style={{background:"#fff",borderRadius:18,border:"1px solid #e2e8f0",overflow:"hidden"}}>
              <div style={{padding:"16px 14px 0",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                <div style={{fontWeight:700,color:"#1e293b",fontSize:"0.9rem"}}>👥 Members ({filtered.length})</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontFamily:F,fontSize:"0.82rem",outline:"none",width:160}}/>
                  <button onClick={()=>{setEditItem(null);setShowForm(true);}} style={{padding:"8px 14px",background:"linear-gradient(135deg,#1a237e,#3949ab)",color:"#fff",border:"none",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:"0.8rem",cursor:"pointer"}}>➕ Add</button>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Name</th><th>Phone</th><th className="hide-mobile">Birthday</th><th className="hide-mobile">Age</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filtered.length===0?<tr><td colSpan={6} style={{textAlign:"center",color:"#94a3b8",padding:"40px 0"}}>No members found. Add first member! 👆</td></tr>
                    :filtered.map((m,i)=>(
                      <tr key={m.id}>
                        <td style={{color:"#94a3b8",fontSize:"0.72rem"}}>{i+1}</td>
                        <td><div style={{fontWeight:600,fontSize:"0.82rem"}}>{m.name}{isBirthdayToday(m.birthday)&&<span style={{marginLeft:4,fontSize:"0.65rem",background:"#fef9c3",color:"#a16207",padding:"2px 6px",borderRadius:20,fontWeight:700}}>🎂</span>}</div>{m.email&&<div style={{fontSize:"0.7rem",color:"#94a3b8"}}>{m.email}</div>}</td>
                        <td style={{fontFamily:"monospace",fontSize:"0.8rem"}}>{m.phone}</td>
                        <td className="hide-mobile">{m.birthday?<span style={{background:"#f0fdf4",color:"#15803d",padding:"3px 8px",borderRadius:20,fontSize:"0.72rem",fontWeight:600}}>{formatDate(m.birthday)}</span>:<span style={{color:"#cbd5e1"}}>—</span>}</td>
                        <td className="hide-mobile" style={{color:"#64748b"}}>{getAge(m.birthday)||"—"}</td>
                        <td><div style={{display:"flex",gap:6}}>
                          <button onClick={()=>{setEditItem(m);setShowForm(true);}} style={{padding:"5px 10px",background:"#e8eaf6",color:"#1a237e",border:"none",borderRadius:6,fontFamily:F,fontWeight:600,fontSize:"0.75rem",cursor:"pointer"}}>Edit</button>
                          <button onClick={()=>del("members",m.id,m.name)} style={{padding:"5px 10px",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,fontFamily:F,fontWeight:600,fontSize:"0.75rem",cursor:"pointer"}}>Delete</button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div style={{background:"#fff",borderRadius:18,border:"1px solid #e2e8f0",padding:18,marginBottom:14}}>
                <div style={{fontWeight:700,color:"#1e293b",fontSize:"0.88rem",marginBottom:14}}>📅 Upcoming Birthdays</div>
                {upcomingBdays.length===0?<div style={{fontSize:"0.8rem",color:"#94a3b8",textAlign:"center",padding:"16px 0"}}>No birthdays added</div>
                :upcomingBdays.map(m=>{
                  const today=new Date(),next=new Date(m.birthday);next.setFullYear(today.getFullYear());if(next<today)next.setFullYear(today.getFullYear()+1);
                  const days=Math.ceil((next-today)/86400000);
                  return(<div key={m.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f1f5f9"}}>
                    <div><div style={{fontSize:"0.85rem",fontWeight:600,color:"#1e293b"}}>{m.name}</div><div style={{fontSize:"0.72rem",color:"#94a3b8"}}>{formatDate(m.birthday)}</div></div>
                    {days===0?<span style={{background:"#fef9c3",color:"#a16207",fontSize:"0.7rem",padding:"3px 8px",borderRadius:20,fontWeight:700}}>🎂 Today!</span>:<span style={{background:"#f0f9ff",color:"#0369a1",fontSize:"0.72rem",padding:"3px 8px",borderRadius:20,fontWeight:600}}>in {days}d</span>}
                  </div>);
                })}
              </div>
              <div style={{background:"linear-gradient(135deg,#1a237e,#3949ab)",borderRadius:18,padding:18,color:"#fff"}}>
                <div style={{fontWeight:700,fontSize:"0.88rem",marginBottom:8}}>📱 Auto Birthday SMS</div>
                <div style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.7)",lineHeight:1.6,marginBottom:14}}>Sends automatically every day at <strong style={{color:"#e8c547"}}>8:00 AM</strong> to birthday members.</div>
                <button onClick={sendBirthdaySMSNow} disabled={smsLoading} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.15)",color:"#fff",border:"1px solid rgba(255,255,255,0.25)",borderRadius:10,fontFamily:F,fontWeight:600,fontSize:"0.8rem",cursor:"pointer"}}>{smsLoading?"Sending...":"🎂 Send Now (Manual)"}</button>
              </div>
            </div>
          </>}

          {/* ── EVENTS TAB ── */}
          {tab==="events"&&<div style={{background:"#fff",borderRadius:18,border:"1px solid #e2e8f0",overflow:"hidden"}}>
            <div style={{padding:"18px 18px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontWeight:700,color:"#1e293b",fontSize:"0.95rem"}}>📅 Upcoming Events ({events.length})</div>
              <button onClick={()=>{setEditItem(null);setShowForm(true);}} style={{padding:"8px 14px",background:"linear-gradient(135deg,#1a237e,#3949ab)",color:"#fff",border:"none",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:"0.8rem",cursor:"pointer"}}>➕ Add Event</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Date</th><th>Title</th><th>Description</th><th>Tag</th><th>Actions</th></tr></thead>
                <tbody>
                  {events.length===0?<tr><td colSpan={6} style={{textAlign:"center",color:"#94a3b8",padding:"40px 0"}}>No events yet. Add first event! 👆</td></tr>
                  :events.map((e,i)=>(
                    <tr key={e.id}>
                      <td style={{color:"#94a3b8",fontSize:"0.75rem"}}>{i+1}</td>
                      <td><span style={{background:"#1a237e",color:"#fff",fontSize:"0.72rem",fontWeight:700,padding:"4px 10px",borderRadius:8}}>{e.date}</span></td>
                      <td style={{fontWeight:600}}>{e.title}</td>
                      <td style={{color:"#64748b",fontSize:"0.82rem"}}>{e.desc}</td>
                      <td><span style={tagStyle(e.tag)}>{e.tag}</span></td>
                      <td><div style={{display:"flex",gap:6}}>
                        <button onClick={()=>{setEditItem(e);setShowForm(true);}} style={{padding:"5px 10px",background:"#e8eaf6",color:"#1a237e",border:"none",borderRadius:6,fontFamily:F,fontWeight:600,fontSize:"0.75rem",cursor:"pointer"}}>Edit</button>
                        <button onClick={()=>del("events",e.id,e.title)} style={{padding:"5px 10px",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,fontFamily:F,fontWeight:600,fontSize:"0.75rem",cursor:"pointer"}}>Delete</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>}

          {/* ── SERVICES TAB ── */}
          {tab==="services"&&<div style={{background:"#fff",borderRadius:18,border:"1px solid #e2e8f0",overflow:"hidden"}}>
            <div style={{padding:"18px 18px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontWeight:700,color:"#1e293b",fontSize:"0.95rem"}}>⛪ Worship Services ({services.length})</div>
              <button onClick={()=>{setEditItem(null);setShowForm(true);}} style={{padding:"8px 14px",background:"linear-gradient(135deg,#1a237e,#3949ab)",color:"#fff",border:"none",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:"0.8rem",cursor:"pointer"}}>➕ Add Service</button>
            </div>
            <div style={{overflowX:"auto",marginTop:12}}>
              <table>
                <thead><tr><th>#</th><th>Icon</th><th>Day</th><th>Service</th><th>Time</th><th>Actions</th></tr></thead>
                <tbody>
                  {services.length===0?<tr><td colSpan={6} style={{textAlign:"center",color:"#94a3b8",padding:"40px 0"}}>No services yet. Add first! 👆</td></tr>
                  :services.map((s,i)=>(
                    <tr key={s.id}>
                      <td style={{color:"#94a3b8",fontSize:"0.75rem"}}>{i+1}</td>
                      <td style={{fontSize:22}}>{s.icon}</td>
                      <td><span style={{background:"#e8eaf6",color:"#1a237e",fontSize:"0.72rem",fontWeight:700,padding:"4px 10px",borderRadius:8}}>{s.day}</span></td>
                      <td style={{fontWeight:600}}>{s.title}</td>
                      <td style={{color:"#b8860b",fontWeight:600}}>{s.desc}</td>
                      <td><div style={{display:"flex",gap:6}}>
                        <button onClick={()=>{setEditItem(s);setShowForm(true);}} style={{padding:"5px 10px",background:"#e8eaf6",color:"#1a237e",border:"none",borderRadius:6,fontFamily:F,fontWeight:600,fontSize:"0.75rem",cursor:"pointer"}}>Edit</button>
                        <button onClick={()=>del("services",s.id,s.title)} style={{padding:"5px 10px",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,fontFamily:F,fontWeight:600,fontSize:"0.75rem",cursor:"pointer"}}>Delete</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>}

          {/* ── GALLERY TAB ── */}
          {tab==="gallery"&&<div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
              <div style={{fontWeight:700,color:"#1e293b",fontSize:"0.9rem"}}>🖼️ Gallery ({gallery.length})</div>
              <button onClick={()=>setShowUpload(true)} style={{padding:"8px 16px",background:"linear-gradient(135deg,#1a237e,#3949ab)",color:"#fff",border:"none",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:"0.8rem",cursor:"pointer"}}>📷 Upload Image</button>
            </div>
            {gallery.length===0?
              <div style={{background:"#fff",borderRadius:18,border:"2px dashed #e2e8f0",padding:"48px 0",textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:10}}>🖼️</div>
                <div style={{fontFamily:F,color:"#94a3b8",fontSize:"0.88rem"}}>No gallery images yet.</div>
                <button onClick={()=>setShowUpload(true)} style={{marginTop:14,padding:"10px 24px",background:"linear-gradient(135deg,#1a237e,#3949ab)",color:"#fff",border:"none",borderRadius:10,fontFamily:F,fontWeight:700,cursor:"pointer",fontSize:"0.85rem"}}>📷 Upload First Image</button>
              </div>
            :<div className="gallery-grid">
              {gallery.map(img=>(
                <div key={img.id} style={{background:"#fff",borderRadius:14,border:"1px solid #e2e8f0",overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                  <div style={{position:"relative",paddingTop:"66%",background:"#f8fafc"}}>
                    <img src={img.url} alt={img.caption||"gallery"} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
                  </div>
                  <div style={{padding:"12px 14px"}}>
                    <div style={{fontSize:"0.82rem",color:"#475569",fontFamily:F,marginBottom:10,minHeight:20}}>{img.caption||<span style={{color:"#cbd5e1"}}>No caption</span>}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <button onClick={()=>{const c=prompt("New caption:",img.caption||"");if(c!==null)api.put(`/gallery/${img.id}`,{caption:c}).then(loadAll);}} style={{flex:1,padding:"6px 0",background:"#e8eaf6",color:"#1a237e",border:"none",borderRadius:8,fontFamily:F,fontWeight:600,fontSize:"0.72rem",cursor:"pointer"}}>✏️ Caption</button>
                      <button onClick={()=>handleReplace(img)} style={{flex:1,padding:"6px 0",background:"#f0fdf4",color:"#15803d",border:"none",borderRadius:8,fontFamily:F,fontWeight:600,fontSize:"0.72rem",cursor:"pointer"}}>🔄 Replace</button>
                      <button onClick={()=>{if(confirm(`Delete this image?`))api.delete(`/gallery/${img.id}`).then(loadAll);}} style={{flex:1,padding:"6px 0",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:8,fontFamily:F,fontWeight:600,fontSize:"0.72rem",cursor:"pointer"}}>🗑️ Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>}
          </div>}

        </div>
      </div>

      {/* Hidden replace input */}
      <input ref={replaceInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={doReplace}/>

      {tab==="members"&&showForm&&<MemberForm member={editItem} onSave={()=>{setShowForm(false);loadAll();showToast(editItem?.id?"Updated!":"Member added! ✅","success");}} onCancel={()=>setShowForm(false)}/>}
      {tab==="events" &&showForm&&<EventForm   event={editItem}   onSave={()=>{setShowForm(false);loadAll();showToast(editItem?.id?"Event updated!":"Event added! ✅","success");}} onCancel={()=>setShowForm(false)}/>}
      {tab==="services"&&showForm&&<ServiceForm service={editItem} onSave={()=>{setShowForm(false);loadAll();showToast(editItem?.id?"Service updated!":"Service added! ✅","success");}} onCancel={()=>setShowForm(false)}/> }
      {showSettings&&<Settings onClose={()=>{setShowSettings(false);loadAll();}} showToast={showToast}/>}
      {showUpload&&<GalleryUpload onUploaded={()=>{setShowUpload(false);loadAll();showToast("Image uploaded! ✅","success");}} onClose={()=>setShowUpload(false)}/>}
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
}
