import React, { useState } from "react";

const GOLD = "#D4A017";
const DARK = "#1a1a2e";
const GRAY = "#555";

export default function Landing({ onEnter }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    { icon: "📚", title: "Courses and Assignments", desc: "Lecturers post materials, notes and assignments. Students submit work and track deadlines all in one place." },
    { icon: "🤖", title: "AI Tutor", desc: "A 24/7 academic assistant that knows your field. Ask it anything — concepts, formulas, career advice, study notes." },
    { icon: "⚙️", title: "Tools Hub", desc: "Live calculators for GPA, loans, pension, bond pricing, VaR, currency conversion and more. All interactive." },
    { icon: "🎓", title: "Programme Structure", desc: "The full official curriculum for your programme — every unit, every year, with descriptions and free references." },
    { icon: "🏛️", title: "Student Services", desc: "HELB, NHIF, KRA PIN, eCitizen, mobile loans and more — all Kenyan student essentials with direct links." },
    { icon: "💡", title: "Innovation Hub", desc: "Post ideas, enter hackathons, respond to corporate challenges and get AI-generated innovation ideas." },
    { icon: "💬", title: "Community Chat", desc: "An open conversation space for all students and staff across fields and years." },
    { icon: "📣", title: "Events", desc: "Bootcamps, workshops, seminars and trips posted by students and staff. Never miss what is happening." },
    { icon: "❤️", title: "Wellness", desc: "Anonymous wellness check-ins with private responses from the wellness team. Your wellbeing matters here." },
  ];

  const stats = [
    { value: "60+", label: "Registered Users" },
    { value: "40+", label: "Fields of Study" },
    { value: "11", label: "Live Calculators" },
    { value: "20+", label: "Student Services" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', Arial, sans-serif", color: DARK, margin: 0, padding: 0, overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{ background: DARK, padding: "0 5%", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo2.png" alt="AKADIMIA" style={{ height: 36 }} onError={e => e.target.style.display = "none"} />
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 20, letterSpacing: 3 }}>AKADIMIA</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="#features" style={{ color: "#aaa", textDecoration: "none", fontSize: 13, display: window.innerWidth < 600 ? "none" : "block" }}>Features</a>
          <a href="#about" style={{ color: "#aaa", textDecoration: "none", fontSize: 13, display: window.innerWidth < 600 ? "none" : "block" }}>About</a>
          <button onClick={onEnter} style={{ background: GOLD, color: "#000", border: "none", borderRadius: 8, padding: "8px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Sign In</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #16213e 60%, #0f3460 100%)`, padding: "80px 5% 100px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(212,160,23,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(212,160,23,0.15)", border: "1px solid rgba(212,160,23,0.3)", borderRadius: 20, padding: "4px 16px", fontSize: 12, color: GOLD, fontWeight: 600, marginBottom: 24, letterSpacing: 1 }}>
            BUILT IN KENYA, FOR KENYAN STUDENTS
          </div>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 900, color: "#fff", margin: "0 0 16px", lineHeight: 1.1, letterSpacing: -1 }}>
            Your Academic Home.<br />
            <span style={{ color: GOLD }}>Ujuzi Bila Mipaka.</span>
          </h1>
          <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: "#aaa", lineHeight: 1.8, margin: "0 auto 40px", maxWidth: 560 }}>
            AKADIMIA brings together everything a Kenyan university student and lecturer needs — courses, assignments, AI tutoring, student services, wellness support and a community — in one platform.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onEnter} style={{ background: GOLD, color: "#000", border: "none", borderRadius: 10, padding: "14px 36px", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 20px rgba(212,160,23,0.4)" }}>
              Sign In to AKADIMIA
            </button>
            <a href="#features" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "14px 36px", fontWeight: 600, fontSize: 15, textDecoration: "none", display: "inline-block" }}>
              Explore Features
            </a>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ background: GOLD, padding: "28px 5%" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
          {stats.map(st => (
            <div key={st.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: DARK }}>{st.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#000", opacity: 0.7 }}>{st.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" style={{ background: "#f8f9fa", padding: "80px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: DARK, margin: "0 0 12px" }}>Everything You Need in One Place</h2>
            <p style={{ fontSize: 15, color: GRAY, maxWidth: 520, margin: "0 auto" }}>Purpose-built for Kenyan university students, lecturers and researchers.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: "#fff", borderRadius: 12, padding: "24px", border: "1px solid #e8e8e8", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", transition: "all 0.2s" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: GRAY, lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <div id="about" style={{ background: DARK, padding: "80px 5%" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: "#fff", margin: "0 0 24px" }}>Why AKADIMIA?</h2>
          <p style={{ fontSize: 15, color: "#aaa", lineHeight: 1.9, margin: "0 0 20px" }}>
            The name comes from the ancient Greek word Akadimia — the school founded by Plato in Athens in 387 BC, the world's first institution of serious learning. We chose it deliberately. Not to copy the West, but to claim that same spirit of scholarship and root it firmly in an African context.
          </p>
          <p style={{ fontSize: 15, color: "#aaa", lineHeight: 1.9, margin: "0 0 20px" }}>
            AKADIMIA was built by Dr. Jeffar Junior Oburu, a Kenyan statistician, lecturer and researcher who sat in the same lecture halls and faced the same frustrations. Every feature exists because a real student or lecturer needed it.
          </p>
          <p style={{ fontSize: 15, color: GOLD, lineHeight: 1.9, fontWeight: 600, margin: "0 0 40px" }}>
            Ujuzi Bila Mipaka — Knowledge Without Borders.
          </p>
          <button onClick={onEnter} style={{ background: GOLD, color: "#000", border: "none", borderRadius: 10, padding: "14px 40px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
            Sign In or Register
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: "#111", padding: "24px 5%", textAlign: "center" }}>
        <p style={{ color: "#555", fontSize: 12, margin: 0 }}>
          AKADIMIA · akadimia.co.ke · Kenya Data Protection Act 2019 Compliant · Built in Kenya
        </p>
        <p style={{ color: "#444", fontSize: 11, margin: "6px 0 0" }}>
          Founder and Developer: Dr. Jeffar Junior Oburu
        </p>
      </div>
    </div>
  );
}
