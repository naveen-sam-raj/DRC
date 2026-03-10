import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = ["Home", "About", "Services", "Events", "Gallery", "Contact"];

const DEFAULT_SERVICES = [
  { id: "s1",  day: "All Days",     title: "Morning Service",    desc: "6:00 AM",  icon: "🌅" },
  { id: "s2",  day: "Sunday",       title: "Morning Service",    desc: "9:00 AM",  icon: "☀️" },
  { id: "s3",  day: "Daily",        title: "Evening Prayer",     desc: "7:00 PM",  icon: "🌙" },
  { id: "s4",  day: "Wednesday",    title: "Lithaniya",          desc: "7:00 PM",  icon: "🕯️" },
  { id: "s5",  day: "Friday",       title: "Free Service",       desc: "7:00 PM",  icon: "🔥" },
  { id: "s6",  day: "1st Friday",   title: "All Night Prayer",   desc: "7:00 PM",  icon: "⭐" },
  { id: "s7",  day: "2nd Sunday",   title: "Communion Service",  desc: "9:00 AM",  icon: "🍷" },
  { id: "s8",  day: "Last Sunday",  title: "Free Service",       desc: "9:00 AM",  icon: "✝️" },
  { id: "s9",  day: "3rd Saturday", title: "Fasting Prayer",     desc: "11:00 AM", icon: "🙏" },
  { id: "s10", day: "Monthly 1st",  title: "Promise Service",    desc: "6:00 AM",  icon: "🌟" },
  { id: "s11", day: "Monthly 1st",  title: "Communion Service",  desc: "6:00 PM",  icon: "🕊️" },
];

const DEFAULT_EVENTS = [
  { id: "e1", date: "MAR 15", title: "Easter Prayer Vigil",       desc: "All night prayer and worship",       tag: "Upcoming" },
  { id: "e2", date: "MAR 22", title: "Easter Sunday Celebration", desc: "Grand worship & communion",          tag: "Special"  },
  { id: "e3", date: "APR 05", title: "Youth Retreat",             desc: "2-day spiritual retreat for youth",  tag: "Youth"    },
  { id: "e4", date: "APR 20", title: "Community Outreach",        desc: "Serving Mullakkadu community",       tag: "Outreach" },
];

const VERSES = [
  { text: "I am the resurrection and the life. The one who believes in me will live, even though they die.", ref: "John 11:25" },
  { text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", ref: "John 3:16" },
  { text: "He is not here; he has risen!", ref: "Luke 24:6" },
];

const F = "'Inter', sans-serif";

export default function Home() {
  const [activeVerse, setActiveVerse] = useState(0);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [gallery, setGallery] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // ── Hero animations ──────────────────────────────────
    gsap.fromTo(".hero-title",
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.4, ease: "power3.out", delay: 0.3 }
    );
    gsap.fromTo(".hero-subtitle",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.6 }
    );
    gsap.fromTo(".hero-cta",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.9 }
    );
    gsap.fromTo(".cross-glow",
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 2, ease: "elastic.out(1,0.5)", delay: 0.2 }
    );
    gsap.to(".cross-glow", {
      y: -12, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.2,
    });
    gsap.utils.toArray(".particle").forEach((el, i) => {
      gsap.to(el, {
        y: -40 - i * 10,
        x: (i % 2 === 0 ? 1 : -1) * (15 + i * 5),
        opacity: 0, duration: 2.5 + i * 0.3,
        ease: "power1.out", repeat: -1, delay: i * 0.4,
      });
    });

    // ── Scroll-triggered: section headings (top → down) ──────
    gsap.utils.toArray(".reveal").forEach((el, i) => {
      gsap.fromTo(el,
        { y: -50, opacity: 0, scale: 0.97 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out",
          delay: (i % 3) * 0.06,
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        }
      );
    });

    // ── Left → Center (even cards) ─────────────────────
    gsap.utils.toArray(".reveal-left").forEach((el, i) => {
      gsap.fromTo(el,
        { x: -100, opacity: 0, scale: 0.95 },
        {
          x: 0, opacity: 1, scale: 1, duration: 0.85, ease: "power3.out",
          delay: i * 0.05,
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
        }
      );
    });

    // ── Right → Center (odd cards) ────────────────────
    gsap.utils.toArray(".reveal-right").forEach((el, i) => {
      gsap.fromTo(el,
        { x: 100, opacity: 0, scale: 0.95 },
        {
          x: 0, opacity: 1, scale: 1, duration: 0.85, ease: "power3.out",
          delay: i * 0.05,
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
        }
      );
    });

    const interval = setInterval(() => {
      setActiveVerse((v) => (v + 1) % VERSES.length);
    }, 5000);

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fetch dynamic data from server
  useEffect(() => {
    const srv = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `http://${window.location.hostname}:3001`
      : "https://drc-32zw.onrender.com";
    fetch(`${srv}/api/services`).then(r => r.json()).then(setServices).catch(() => {});
    fetch(`${srv}/api/events`).then(r => r.json()).then(setEvents).catch(() => {});
    fetch(`${srv}/api/gallery`).then(r => r.json()).then(setGallery).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fdfaf4", color: "#1a1a2e", fontFamily: F, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }

        :root {
          --navy: #1a237e;
          --royal: #283593;
          --gold:  #b8860b;
          --gold2: #d4a017;
          --gold3: #e8c547;
          --cream: #fdfaf4;
        }

        .gold-gradient {
          background: linear-gradient(130deg, #b8860b, #d4a017, #e8c547, #b8860b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .blue-gradient {
          background: linear-gradient(130deg, #1a237e, #283593, #3949ab);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cross-shape {
          clip-path: polygon(38% 0%,62% 0%,62% 38%,100% 38%,100% 62%,62% 62%,62% 100%,38% 100%,38% 62%,0% 62%,0% 38%,38% 38%);
        }

        /* NAV */
        .nav-link { position: relative; text-decoration: none; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; color: rgba(255,255,255,0.92); transition: color 0.2s; }
        .nav-link::after { content:''; position:absolute; bottom:-3px; left:0; width:0; height:2px; background: linear-gradient(90deg, #e8c547, #fff); border-radius:2px; transition: width 0.3s; }
        .nav-link:hover::after { width: 100%; }
        .nav-link:hover { color: #e8c547; }
        .nav-scrolled .nav-link { color: #1a237e; }
        .nav-scrolled .nav-link:hover { color: #b8860b; }

        /* BUTTONS */
        .btn-primary { background: linear-gradient(135deg, #1a237e, #3949ab); color: #fff; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; padding: 14px 38px; border-radius: 50px; border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 6px 24px rgba(26,35,126,0.3); text-decoration: none; display: inline-block; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(26,35,126,0.4); }
        .btn-outline { background: transparent; color: #1a237e; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; padding: 13px 38px; border-radius: 50px; border: 2px solid #1a237e; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; }
        .btn-outline:hover { background: #1a237e; color: #fff; }

        /* HERO */
        .hero-section { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #aec6e0; }
        .hero-bg-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center top; z-index:0; }
        .hero-overlay { position:absolute; inset:0; z-index:1; background: linear-gradient(to bottom, rgba(5,10,30,0.42) 0%, rgba(5,10,30,0.08) 35%, rgba(5,10,30,0.08) 65%, rgba(5,10,30,0.58) 100%); }
        .hero-overlay2 { position:absolute; bottom:0; left:0; right:0; height:180px; z-index:2; background: linear-gradient(to top, rgba(253,250,244,1) 0%, transparent 100%); }

        @media (max-width: 768px) {
          .hero-section { min-height: 100svh; }
          .hero-bg-img { object-fit: cover; object-position: 62% top; }
          .hero-overlay { background: linear-gradient(to bottom, rgba(5,10,30,0.42) 0%, rgba(5,10,30,0.08) 35%, rgba(5,10,30,0.08) 65%, rgba(5,10,30,0.65) 100%); }
        }

        /* VERSE */
        .verse-banner { background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%); color: white; padding: 64px 24px; }
        .verse-dot { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.3); transition:all 0.3s; cursor:pointer; border:none; }
        .verse-dot.active { background:#e8c547; width:24px; border-radius:4px; }

        /* CARDS */
        .service-card { background:#fff; border-radius:20px; padding:28px 20px; text-align:center; border:1px solid rgba(184,134,11,0.18); box-shadow:0 2px 20px rgba(26,35,126,0.06); transition:transform 0.3s, box-shadow 0.3s; }
        .service-card:hover { transform:translateY(-8px); box-shadow:0 20px 48px rgba(26,35,126,0.12); }
        @media (max-width: 900px) { .services-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 500px) { .services-grid { grid-template-columns: 1fr !important; } }
        .event-card { background:rgba(255,255,255,0.08); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.15); border-radius:20px; padding:28px; transition:background 0.3s, transform 0.3s; }
        .event-card:hover { background:rgba(255,255,255,0.15); transform:translateY(-4px); }
        .contact-info-card { background:#fff; border:1px solid rgba(26,35,126,0.1); border-radius:16px; padding:20px 24px; display:flex; align-items:flex-start; gap:16px; box-shadow:0 2px 12px rgba(26,35,126,0.05); }
        .contact-form-card { background:#fff; border:1px solid rgba(184,134,11,0.18); border-radius:24px; padding:36px; box-shadow:0 8px 40px rgba(26,35,126,0.08); }
        .value-row { display:flex; align-items:flex-start; gap:16px; margin-bottom:24px; padding:14px; border-radius:12px; transition:background 0.2s; }
        .value-row:hover { background:#f0f4ff; }
        .gallery-item { border-radius:20px; overflow:hidden; aspect-ratio:1; position:relative; display:flex; align-items:center; justify-content:center; transition:transform 0.3s, box-shadow 0.3s; border:1px solid rgba(184,134,11,0.15); }
        .gallery-item img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; }
        .gallery-item:hover { transform:scale(1.03); box-shadow:0 16px 48px rgba(26,35,126,0.15); }
        .gallery-item:nth-child(odd) { background:linear-gradient(135deg,#e8eaf6,#c5cae9); }
        .gallery-item:nth-child(even) { background:linear-gradient(135deg,#fff8e7,#ffe0b2); }

        /* FORM */
        .form-input { width:100%; padding:14px 18px; border:1.5px solid #e0e0e0; border-radius:12px; font-family:'Inter',sans-serif; font-size:0.875rem; color:#1a237e; background:#fafafa; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
        .form-input:focus { border-color:#3949ab; box-shadow:0 0 0 3px rgba(57,73,171,0.1); background:#fff; }
        .form-input::placeholder { color:#aaa; }

        /* TAGS */
        .tag-upcoming { background:rgba(255,234,153,0.9); color:#7a5700; }
        .tag-special  { background:rgba(255,205,210,0.9); color:#b71c1c; }
        .tag-youth    { background:rgba(187,222,251,0.9); color:#0d47a1; }
        .tag-outreach { background:rgba(200,230,201,0.9); color:#1b5e20; }

        /* SECTION LABEL */
        .section-label { font-size:0.68rem; letter-spacing:0.35em; text-transform:uppercase; color:#b8860b; font-weight:700; margin-bottom:12px; display:block; }

        /* MOBILE NAV */
        .mobile-nav { background:rgba(255,255,255,0.97); backdrop-filter:blur(16px); margin:8px 16px 0; border-radius:16px; padding:20px; display:flex; flex-direction:column; gap:16px; border:1px solid rgba(184,134,11,0.18); box-shadow:0 8px 32px rgba(26,35,126,0.1); }
        @media (max-width:768px) { .desktop-nav { display:none !important; } }
        @media (min-width:769px) { .mobile-menu-btn { display:none !important; } .mobile-nav { display:none !important; } }

        /* RESPONSIVE */
        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
        .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
        .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .grid-events { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
        @media (max-width:1024px) { .grid-2 { grid-template-columns:1fr; gap:40px; } .grid-4 { grid-template-columns:1fr 1fr; } }
        @media (max-width:640px) { .grid-4 { grid-template-columns:1fr 1fr; } .grid-events { grid-template-columns:1fr !important; } .grid-3 { grid-template-columns:1fr 1fr; } }

        /* SCROLLBAR */
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#e8eaf6; }
        ::-webkit-scrollbar-thumb { background:#3949ab; border-radius:3px; }
      `}</style>

      {/* ── NAV ── */}
      <nav className={scrolled ? "nav-scrolled" : ""} style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        transition: "all 0.4s ease",
        ...(scrolled
          ? { background: "rgba(255,255,255,0.96)", backdropFilter: "blur(16px)", boxShadow: "0 2px 24px rgba(26,35,126,0.1)", padding: "10px 0" }
          : { background: "transparent", padding: "20px 0" })
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            <div>
              <div style={{ fontFamily: F, fontSize: "0.65rem", fontWeight: 800, color: scrolled ? "#b8860b" : "#e8c547", letterSpacing: "0.3em", lineHeight: 1 }}>DIVINE</div>
              <div style={{ fontFamily: F, fontSize: "0.65rem", fontWeight: 600, color: scrolled ? "#1a237e" : "rgba(255,255,255,0.9)", letterSpacing: "0.18em", lineHeight: 1, marginTop: 3 }}>RESURRECTION</div>
            </div>
          </div>

          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 36 }}>
            {NAV_LINKS.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="nav-link">{link}</a>
            ))}
          </div>

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: scrolled ? "#1a237e" : "#fff", padding: 4, fontFamily: F }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-nav">
            {NAV_LINKS.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)}
                style={{ fontFamily: F, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a237e", textDecoration: "none", textAlign: "center", padding: "8px 0", borderBottom: "1px solid rgba(26,35,126,0.08)" }}>
                {link}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="hero-section">
        {/* Background image */}
        <img src="/images/church-hero.jpg" alt="Divine Resurrection Church" className="hero-bg-img" />
        {/* Dark blue overlay for readability */}
        <div className="hero-overlay"></div>
        {/* Bottom fade into page background */}
        <div className="hero-overlay2"></div>

        {[...Array(10)].map((_, i) => (
          <div key={i} className="particle" style={{
            position: "absolute", width: 6, height: 6, borderRadius: "50%",
            background: i % 2 === 0 ? "#1a237e" : "#d4a017", opacity: 0.45,
            left: `${10 + i * 9}%`, bottom: `${25 + (i % 4) * 12}%`,
          }}></div>
        ))}

        <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 760, margin: "0 auto", padding: "0 24px", paddingTop: 80 }}>
          <div className="hero-title">
            <span className="section-label" style={{ fontSize: "0.72rem", color: "#f5d76e", letterSpacing: "0.3em", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>Welcome to</span>
            <h1 style={{ fontFamily: F, fontSize: "clamp(2.6rem, 8vw, 5.5rem)", fontWeight: 900, lineHeight: 1.08, marginBottom: 6, letterSpacing: "-0.02em", textShadow: "0 4px 32px rgba(0,0,0,0.5)" }}>
              <span style={{ background: "linear-gradient(130deg, #FFD700, #FFF176, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Divine</span>
            </h1>
            <h1 style={{ fontFamily: F, fontSize: "clamp(2.6rem, 8vw, 5.5rem)", fontWeight: 900, lineHeight: 1.08, color: "#ffffff", letterSpacing: "-0.02em", textShadow: "0 4px 32px rgba(0,0,0,0.55)" }}>
              Resurrection
            </h1>
            <h2 style={{ fontFamily: F, fontSize: "clamp(1.2rem, 3.5vw, 1.9rem)", fontWeight: 500, color: "#ffffff", marginTop: 10, letterSpacing: "0.12em", textShadow: "0 3px 20px rgba(0,0,0,0.5)" }}>Church</h2>
          </div>

          <p className="hero-subtitle" style={{ fontFamily: F, fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)", color: "#ffffff", fontWeight: 600, marginTop: 28, marginBottom: 8, textShadow: "0 2px 16px rgba(0,0,0,0.55)", letterSpacing: "0.04em" }}>
            Mullakkadu, Thoothukudi
          </p>
          <p className="hero-subtitle" style={{ fontFamily: F, fontSize: "1rem", color: "rgba(255,255,255,0.92)", fontWeight: 400, marginBottom: 40, textShadow: "0 2px 12px rgba(0,0,0,0.5)", fontStyle: "italic" }}>
            "He is Risen — Come Encounter the Living God"
          </p>

          <div className="hero-cta" style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            <a href="#services" className="btn-primary">Join Us Sunday</a>
            <a href="#about" style={{
              background: "transparent", color: "#fff", fontFamily: F, fontWeight: 600, fontSize: "0.78rem",
              letterSpacing: "0.12em", textTransform: "uppercase", padding: "13px 38px", borderRadius: 50,
              border: "2px solid rgba(255,255,255,0.6)", cursor: "pointer", textDecoration: "none",
              display: "inline-block", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.15)"; e.target.style.borderColor = "#fff"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.borderColor = "rgba(255,255,255,0.6)"; }}
            >Our Story</a>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.6, zIndex: 10 }}>
          <span style={{ fontFamily: F, fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Scroll</span>
          <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom, #1a237e, transparent)" }}></div>
        </div>
      </section>

      {/* ── VERSE BANNER ── */}
      <section className="verse-banner">
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center", marginBottom: 24 }}>
            <div style={{ width: 60, height: 1.5, background: "linear-gradient(90deg, transparent, #b8860b)" }}></div>
            <span style={{ fontSize: 22 }}>✝</span>
            <div style={{ width: 60, height: 1.5, background: "linear-gradient(90deg, #b8860b, transparent)" }}></div>
          </div>
          <div key={activeVerse}>
            <p style={{ fontFamily: F, fontSize: "clamp(1rem, 2.8vw, 1.45rem)", fontWeight: 400, lineHeight: 1.75, color: "rgba(255,255,255,0.92)", marginBottom: 18 }}>
              "{VERSES[activeVerse].text}"
            </p>
            <p style={{ fontFamily: F, fontSize: "0.72rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#e8c547", fontWeight: 700 }}>
              — {VERSES[activeVerse].ref}
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
            {VERSES.map((_, i) => (
              <button key={i} className={`verse-dot ${i === activeVerse ? "active" : ""}`} onClick={() => setActiveVerse(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ background: "#fff", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="grid-2" style={{ alignItems: "center" }}>
            <div className="reveal">
              <span className="section-label">About Us</span>
              <div style={{ width: 40, height: 2, background: "linear-gradient(90deg, #b8860b, transparent)", marginBottom: 20 }}></div>
              <h2 style={{ fontFamily: F, fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 800, color: "#1a237e", lineHeight: 1.2, marginBottom: 20, letterSpacing: "-0.01em" }}>
                A Community Built on <span className="gold-gradient">Faith & Resurrection</span>
              </h2>
              <p style={{ fontFamily: F, fontSize: "1.05rem", fontWeight: 400, color: "#546e7a", marginBottom: 20, lineHeight: 1.8 }}>
                "Where the Spirit of the Lord is, there is freedom."
              </p>
              <p style={{ fontFamily: F, fontSize: "0.9rem", color: "#455a64", lineHeight: 1.9, marginBottom: 16 }}>
                Divine Resurrection Church in Mullakkadu is a vibrant, Spirit-filled congregation dedicated to proclaiming the risen Christ. We believe in the transforming power of the resurrection and invite every soul to experience the love of Jesus.
              </p>
              <p style={{ fontFamily: F, fontSize: "0.9rem", color: "#455a64", lineHeight: 1.9, marginBottom: 36 }}>
                Our doors are open to all — every background, every burden, every broken heart. Come as you are, leave renewed by His grace.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {[["100+", "Years"], ["200+", "Families"], ["4", "Services/Week"]].map(([num, label]) => (
                  <div key={label} style={{ background: "linear-gradient(135deg, #e8eaf6, #fff)", border: "1px solid rgba(26,35,126,0.12)", borderRadius: 16, padding: "20px 12px", textAlign: "center" }}>
                    <div className="blue-gradient" style={{ fontFamily: F, fontSize: "1.9rem", fontWeight: 900, letterSpacing: "-0.02em" }}>{num}</div>
                    <div style={{ fontFamily: F, fontSize: "0.7rem", color: "#78909c", marginTop: 4, fontWeight: 500 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal" style={{ background: "linear-gradient(135deg, #e8eaf6, #fdfaf4)", borderRadius: 28, padding: 36, border: "1px solid rgba(26,35,126,0.1)", boxShadow: "0 12px 48px rgba(26,35,126,0.08)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(184,134,11,0.12), transparent)" }}></div>
              <div style={{ fontFamily: F, fontSize: "1.05rem", fontWeight: 700, color: "#1a237e", marginBottom: 24 }}>Our Core Values</div>
              {[
                { icon: "✝️", title: "Christ-Centered", desc: "Every message, every ministry rooted in Christ" },
                { icon: "🕊️", title: "Spirit-Led", desc: "Moved and guided by the Holy Spirit" },
                { icon: "❤️", title: "Love in Action", desc: "Serving our community with compassion" },
                { icon: "📖", title: "Word-Based", desc: "Standing firm on the truth of Scripture" },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="value-row">
                  <div style={{ fontSize: 26, lineHeight: 1 }}>{icon}</div>
                  <div>
                    <div style={{ fontFamily: F, fontSize: "0.875rem", fontWeight: 700, color: "#1a237e" }}>{title}</div>
                    <div style={{ fontFamily: F, fontSize: "0.8rem", color: "#546e7a", marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ background: "linear-gradient(180deg, #fdfaf4 0%, #fff8e7 100%)", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 60 }}>
            <span className="section-label">Worship Times</span>
            <h2 style={{ fontFamily: F, fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 800, color: "#1a237e", letterSpacing: "-0.01em" }}>
              Join Us in <span className="gold-gradient">Worship</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="services-grid">
            {services.map((s, i) => (
              <div key={i} className={`service-card ${i % 2 === 0 ? 'reveal-left' : 'reveal-right'}`}>
                <div style={{ fontSize: 42, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontFamily: F, fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#b8860b", fontWeight: 700, marginBottom: 8 }}>{s.day}</div>
                <div style={{ fontFamily: F, fontSize: "1rem", fontWeight: 700, color: "#1a237e", marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontFamily: F, fontSize: "0.95rem", color: "#546e7a", fontWeight: 400 }}>{s.desc}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── EVENTS ── */}
      <section id="events" style={{ background: "linear-gradient(160deg, #1a237e 0%, #3949ab 100%)", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 60 }}>
            <span className="section-label" style={{ color: "#e8c547" }}>Calendar</span>
            <h2 style={{ fontFamily: F, fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>
              Upcoming{" "}
              <span style={{ background: "linear-gradient(130deg,#e8c547,#f5d76e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Events</span>
            </h2>
          </div>
          <div className="grid-events">
            {events.map((e, i) => (
              <div key={i} className={`event-card ${i % 2 === 0 ? 'reveal-left' : 'reveal-right'}`} style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                <div style={{ textAlign: "center", minWidth: 54 }}>
                  <div style={{ fontFamily: F, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#e8c547", fontWeight: 700 }}>{e.date.split(" ")[0]}</div>
                  <div style={{ fontFamily: F, fontSize: "2.2rem", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>{e.date.split(" ")[1]}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                    <h3 style={{ fontFamily: F, fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>{e.title}</h3>
                    <span className={`tag-${e.tag.toLowerCase()}`} style={{ fontSize: "0.62rem", padding: "3px 10px", borderRadius: 20, fontFamily: F, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>{e.tag}</span>
                  </div>
                  <p style={{ fontFamily: F, fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" style={{ background: "#fff", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 60 }}>
            <span className="section-label">Memories</span>
            <h2 style={{ fontFamily: F, fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 800, color: "#1a237e", letterSpacing: "-0.01em" }}>
              Life at <span className="gold-gradient">DRC</span>
            </h2>
          </div>
          <div className="reveal grid-3">
            {gallery.length === 0
              ? [...Array(6)].map((_, i) => (
                  <div key={i} className={`gallery-item ${i % 2 === 0 ? 'reveal-left' : 'reveal-right'}`}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 40, marginBottom: 10 }}>✝️</div>
                      <div style={{ fontFamily: F, fontSize: "0.72rem", color: "#78909c", fontWeight: 500 }}>Photo Coming Soon</div>
                    </div>
                  </div>
                ))
              : gallery.map((img, i) => (
                  <div
                    key={img.id}
                    className={`gallery-item ${i % 2 === 0 ? 'reveal-left' : 'reveal-right'}`}
                    style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.querySelector(".gallery-overlay").style.opacity = "1"}
                    onMouseLeave={e => e.currentTarget.querySelector(".gallery-overlay").style.opacity = "0"}
                  >
                    <img
                      src={img.url}
                      alt={img.caption || "Church Gallery"}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    {img.caption && (
                      <div
                        className="gallery-overlay"
                        style={{
                          position: "absolute", inset: 0,
                          background: "linear-gradient(to top, rgba(26,35,126,0.85) 0%, transparent 60%)",
                          display: "flex", alignItems: "flex-end", padding: "18px 16px",
                          opacity: 0, transition: "opacity 0.3s ease",
                        }}
                      >
                        <span style={{ fontFamily: F, fontSize: "0.82rem", fontWeight: 600, color: "#fff" }}>{img.caption}</span>
                      </div>
                    )}
                  </div>
                ))
            }

          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ background: "linear-gradient(160deg, #fdfaf4 0%, #e8eaf6 100%)", padding: "96px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 60 }}>
            <span className="section-label">Get In Touch</span>
            <h2 style={{ fontFamily: F, fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 800, color: "#1a237e", letterSpacing: "-0.01em" }}>
              We'd Love to <span className="gold-gradient">Hear From You</span>
            </h2>
          </div>
          <div className="reveal grid-2" style={{ alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: "📍", label: "Address", val: "Divine Resurrection Church\nMullakkadu, Thoothukkudi\nTamil Nadu, India" },
                { icon: "✉️", label: "Email", val: "csimullakkadu@gmail.com" },
                { icon: "🕐", label: "Office Hours", val: "Mon–Sat: 9 AM – 6 PM\nSunday: Open for Worship" },
              ].map(({ icon, label, val }) => (
                <div key={label} className="contact-info-card">
                  <div style={{ fontSize: 20 }}>{icon}</div>
                  <div>
                    <div style={{ fontFamily: F, fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#b8860b", fontWeight: 700, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontFamily: F, fontSize: "0.86rem", color: "#374151", whiteSpace: "pre-line", lineHeight: 1.65 }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="contact-form-card">
              <div style={{ fontFamily: F, fontSize: "1.1rem", fontWeight: 700, color: "#1a237e", marginBottom: 24 }}>Send a Message</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input type="text" placeholder="Your Name" className="form-input" />
                <input type="email" placeholder="Email Address" className="form-input" />
                <textarea rows={4} placeholder="Your Message" className="form-input" style={{ resize: "none" }}></textarea>
                <button className="btn-primary" style={{ width: "100%", textAlign: "center" }}>Send Message</button>
              </div>
            </div>
          </div>
          {/* ── Find Us / Map ── */}
          <div className="reveal" style={{ marginTop: 48 }}>
            <div style={{ fontFamily: F, fontSize: "1.1rem", fontWeight: 700, color: "#1a237e", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              📍 Find Us
            </div>
            {/* Google Maps embed – Mullakkadu, Chennai */}
            <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 40px rgba(26,35,126,0.12)", border: "1px solid rgba(184,134,11,0.18)" }}>
              <iframe
                title="Divine Resurrection Church Location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=78.1180%2C8.7290%2C8.7360%2C78.1300&layer=mapnik&marker=8.7322%2C78.1225"
                width="100%"
                height="320"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <div style={{ fontFamily: F, fontSize: "0.85rem", color: "#455a64", lineHeight: 1.6 }}>
                P4G9+P7W, SaltPan Road, Ganesh Nagar, Mullakadu, Thoothukudi, Tamil Nadu 628005
              </div>
              <a
                href="https://maps.google.com/?q=P4G9+P7W,+SaltPan+Road,+Ganesh+Nagar,+Mullakadu,+Thoothukudi,+Tamil+Nadu+628005"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: F, fontSize: "0.75rem", fontWeight: 700, color: "#1a237e", textDecoration: "none", background: "#e8eaf6", padding: "6px 16px", borderRadius: 20, whiteSpace: "nowrap", border: "1px solid rgba(26,35,126,0.15)" }}
              >
                Open in Maps →
              </a>
            </div>

            {/* Church Photo */}
            <div className="reveal" style={{ borderRadius: 28, overflow: "hidden", position: "relative", minHeight: 400, boxShadow: "0 24px 64px rgba(26,35,126,0.15)", border: "1px solid rgba(184,134,11,0.15)" }}>
              <img
                src="/images/church-hero.jpg"
                alt="Divine Resurrection Church"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", minHeight: 400, display: "block" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,35,126,0.75) 0%, transparent 55%)" }}>
                <div style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
                  <div style={{ fontFamily: F, fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: 4 }}>Divine Resurrection Church</div>
                  <div style={{ fontFamily: F, fontSize: "0.8rem", color: "rgba(255,255,255,0.8)" }}>SaltPan Road, Mullakkadu, Thoothukudi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#1a237e", color: "white", padding: "48px 24px", borderTop: "3px solid #d4a017" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

              <div>
                <div style={{ fontFamily: F, fontSize: "0.82rem", fontWeight: 700, color: "#e8c547" }}>Divine Resurrection Church</div>
                <div style={{ fontFamily: F, fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", marginTop: 2, fontWeight: 400 }}>Mullakkadu, Thoothukkudi</div>
              </div>
            </div>
            <div style={{ fontFamily: F, fontSize: "0.95rem", fontWeight: 400, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
              "He is Risen — Hallelujah!"
            </div>
            <div style={{ fontFamily: F, fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", textAlign: "center", lineHeight: 1.7 }}>
              © 2026 Divine Resurrection Church<br />All Rights Reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}