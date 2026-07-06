import React, { useState, useRef, useEffect } from "react";

function useIsMobile() {
  const [mob, setMob] = useState(typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mob;
}


const B = {
  burgundy: "#3B1215", gold: "#C9A258", cream: "#f9f4f0",
  soft: "#fdf8f4", border: "#e8ddd5", muted: "#8a7a72",
  green: "#2d6a2d", red: "#a02020", warn: "#a05000", blue: "#1565C0",
};

// ── Colour helpers ─────────────────────────────────────
function darken(hex, amt) {
  try {
    const h = hex.replace("#", "");
    const r = Math.max(0, parseInt(h.slice(0,2),16) - amt);
    const g = Math.max(0, parseInt(h.slice(2,4),16) - amt);
    const b = Math.max(0, parseInt(h.slice(4,6),16) - amt);
    return "#" + [r,g,b].map(v => v.toString(16).padStart(2,"0")).join("");
  } catch { return hex; }
}
function lighten(hex, amt) {
  try {
    const h = hex.replace("#", "");
    const r = Math.min(255, parseInt(h.slice(0,2),16) + amt);
    const g = Math.min(255, parseInt(h.slice(2,4),16) + amt);
    const b = Math.min(255, parseInt(h.slice(4,6),16) + amt);
    return "#" + [r,g,b].map(v => v.toString(16).padStart(2,"0")).join("");
  } catch { return hex; }
}

// ── UI primitives ──────────────────────────────────────
function Pill({ label, selected, onClick, small }) {
  return (
    <button onClick={onClick} style={{
      background: selected ? B.burgundy : "#fff",
      color: selected ? "#fff" : B.burgundy,
      border: "1.5px solid " + (selected ? B.burgundy : B.border),
      borderRadius: 20, padding: small ? "4px 10px" : "5px 14px",
      fontSize: small ? "0.72rem" : "0.79rem",
      fontWeight: selected ? 600 : 400, cursor: "pointer", margin: "3px",
    }}>
      {selected ? "✓ " : ""}{label}
    </button>
  );
}

function Sec({ icon, title, sub }) {
  return (
    <div style={{ marginTop: 20, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "1.1rem" }}>{icon}</span>
        <span style={{ fontWeight: 700, color: B.burgundy, fontSize: "0.9rem" }}>{title}</span>
      </div>
      {sub && <div style={{ fontSize: "0.71rem", color: B.muted, marginTop: 2, marginLeft: 28 }}>{sub}</div>}
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: "0.74rem", fontWeight: 600, color: B.muted, marginBottom: 4, marginTop: 8 }}>{children}</div>;
}

function InfoCard({ children, type }) {
  const colors = {
    gold: { bg: "#fffbf0", border: B.gold + "50", left: B.gold },
    warn: { bg: "#fff5f5", border: "#f0c0c0", left: B.red },
    blue: { bg: "#f0f8ff", border: "#bbdefb", left: B.blue },
    default: { bg: "#fff", border: B.border, left: B.burgundy },
  };
  const c = colors[type] || colors.default;
  return (
    <div style={{
      background: c.bg, border: "1px solid " + c.border,
      borderLeft: "3px solid " + c.left,
      borderRadius: 10, padding: "12px 14px", marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

// ── Fabric data (compact) ──────────────────────────────
const FABRICS = {
  "Cotton":          { pt: "grid",    opacity: 1,    sheen: false, feel: "Matte weave",      climate: "★★★★★", pros: ["Breathable","Washable","Comfortable"], cons: ["Wrinkles","Shrinks"],       wash: "Machine wash cold." },
  "Rayon / Viscose": { pt: "waves",   opacity: 0.95, sheen: false, feel: "Silky flow",        climate: "★★★★☆", pros: ["Good drape","Vibrant colour"],         cons: ["Shrinks","Tears wet"],      wash: "Hand wash cold." },
  "Linen":           { pt: "coarse",  opacity: 1,    sheen: false, feel: "Textured natural",  climate: "★★★★★", pros: ["Premium look","Breathable"],            cons: ["Wrinkles","Stiff"],         wash: "Hand wash. Iron damp." },
  "Georgette":       { pt: "pebble",  opacity: 0.88, sheen: false, feel: "Grainy flow",       climate: "★★★★☆", pros: ["Beautiful drape","Flowy"],              cons: ["Needs lining","Slippery"], wash: "Dry clean preferred." },
  "Chiffon":         { pt: "sheer",   opacity: 0.6,  sheen: false, feel: "Ultra-light sheer", climate: "★★★☆☆", pros: ["Ultra-light","Elegant"],                cons: ["Very sheer","Tears"],      wash: "Dry clean only." },
  "Crepe":           { pt: "pebble",  opacity: 1,    sheen: false, feel: "Pebbled smooth",    climate: "★★★★☆", pros: ["No wrinkles","Easy care"],              cons: ["Not breathable"],          wash: "Hand wash gentle." },
  "Silk (Pure)":     { pt: "sheen",   opacity: 1,    sheen: true,  feel: "Smooth sheen",      climate: "★★★★★", pros: ["Luxurious","Prestigious"],              cons: ["Expensive","Dry clean"],   wash: "Dry clean only." },
  "Chanderi":        { pt: "zari",    opacity: 0.92, sheen: true,  feel: "Light zari weave",  climate: "★★★★★", pros: ["Onam perfect","Lightweight"],           cons: ["Delicate","Expensive"],    wash: "Gentle hand wash." },
  "Muslin / Mulmul": { pt: "sheer",   opacity: 0.72, sheen: false, feel: "Ultra-soft sheer",  climate: "★★★★★", pros: ["Ultra soft","Breathable"],              cons: ["Delicate","Transparent"],  wash: "Hand wash cold." },
  "Net":             { pt: "mesh",    opacity: 0.65, sheen: false, feel: "Open mesh",          climate: "★★★☆☆", pros: ["Adds volume","Festive"],                cons: ["Needs lining","Scratchy"], wash: "Dry clean." },
  "Velvet":          { pt: "pile",    opacity: 1,    sheen: true,  feel: "Rich plush",         climate: "★★☆☆☆", pros: ["Luxurious","Premium"],                  cons: ["Hot","Hard to stitch"],    wash: "Dry clean only." },
  "Brocade":         { pt: "brocade", opacity: 1,    sheen: true,  feel: "Heavy woven motif", climate: "★★★☆☆", pros: ["Rich pattern","No embroidery needed"],  cons: ["Heavy","Stiff"],           wash: "Dry clean only." },
  "Kota Doria":      { pt: "check",   opacity: 0.88, sheen: false, feel: "Check texture",     climate: "★★★★★", pros: ["Ultra-light","Handloom"],               cons: ["Delicate","Frays"],        wash: "Hand wash only." },
  "Organza":         { pt: "sheer",   opacity: 0.55, sheen: true,  feel: "Crisp sheer",       climate: "★★★☆☆", pros: ["Structure","Festive"],                  cons: ["Stiff","Scratchy"],        wash: "Dry clean." },
  "Satin":           { pt: "sheen",   opacity: 1,    sheen: true,  feel: "Smooth sheen",      climate: "★★★☆☆", pros: ["Smooth","Shiny"],                       cons: ["Slippery","Hot"],          wash: "Dry clean or hand wash." },
};

const PALETTES = {
  "Pastel Soft":    ["#F8C8C8","#C8E6C9","#BBDEFB","#F8BBD0","#E1BEE7","#FFF9C4","#B2EBF2","#FFE0B2"],
  "Jewel Tone":     ["#7B1FA2","#1565C0","#2E7D32","#B71C1C","#E65100","#4A148C","#006064","#0D47A1"],
  "Earthy Neutral": ["#8D6E63","#A1887F","#BCAAA4","#D7CCC8","#6D4C41","#795548","#4E342E","#EFEBE9"],
  "Bright Bold":    ["#F44336","#E91E63","#9C27B0","#2196F3","#4CAF50","#FF9800","#00BCD4","#FF5722"],
  "Festive Rich":   ["#B71C1C","#880E4F","#4A148C","#1A237E","#C9A258","#F57F17","#33691E","#BF360C"],
  "Classic White":  ["#FFFFFF","#FAFAFA","#F5F5F5","#EEEEEE","#E0E0E0","#F9F4F0","#FFF8F0","#FFFDE7"],
  "Pastel Kerala":  ["#FFF8E7","#F5F0E8","#E8F5E9","#FFF3E0","#F3E5F5","#E0F2F1","#FFF9C4","#FCE4EC"],
  "Monochrome":     ["#212121","#424242","#757575","#BDBDBD","#E0E0E0","#F5F5F5","#FFFFFF","#9E9E9E"],
};

// ── SVG fabric pattern ─────────────────────────────────
function FabricPattern({ pt, color, id }) {
  const c = color || B.gold;
  const dk = darken(c, 18);
  const lk = lighten(c, 25);
  if (pt === "grid" || pt === "coarse") return (
    <pattern id={id} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill={c} />
      <line x1="0" y1="5" x2="10" y2="5" stroke={dk} strokeWidth="0.5" opacity="0.4" />
      <line x1="5" y1="0" x2="5" y2="10" stroke={dk} strokeWidth="0.4" opacity="0.35" />
    </pattern>
  );
  if (pt === "waves") return (
    <pattern id={id} x="0" y="0" width="16" height="10" patternUnits="userSpaceOnUse">
      <rect width="16" height="10" fill={c} />
      <path d="M0 5 Q4 2 8 5 Q12 8 16 5" fill="none" stroke={lk} strokeWidth="0.6" opacity="0.4" />
    </pattern>
  );
  if (pt === "pebble") return (
    <pattern id={id} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill={c} />
      <circle cx="2" cy="2" r="0.8" fill={dk} opacity="0.25" />
      <circle cx="6" cy="5" r="0.7" fill={dk} opacity="0.2" />
    </pattern>
  );
  if (pt === "sheen" || pt === "pile") return (
    <pattern id={id} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
      <rect width="24" height="24" fill={c} />
      <ellipse cx="8" cy="8" rx="10" ry="4" fill={lk} opacity="0.28" />
    </pattern>
  );
  if (pt === "sheer") return (
    <pattern id={id} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill={c} opacity="0.6" />
      <line x1="0" y1="4" x2="8" y2="4" stroke={lk} strokeWidth="0.3" opacity="0.35" />
      <line x1="4" y1="0" x2="4" y2="8" stroke={lk} strokeWidth="0.3" opacity="0.35" />
    </pattern>
  );
  if (pt === "mesh") return (
    <pattern id={id} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="transparent" />
      <circle cx="0" cy="0" r="1" fill={c} opacity="0.8" />
      <circle cx="5" cy="5" r="1" fill={c} opacity="0.8" />
      <circle cx="10" cy="0" r="1" fill={c} opacity="0.8" />
      <circle cx="0" cy="10" r="1" fill={c} opacity="0.8" />
      <circle cx="10" cy="10" r="1" fill={c} opacity="0.8" />
    </pattern>
  );
  if (pt === "zari") return (
    <pattern id={id} x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
      <rect width="18" height="18" fill={c} opacity="0.92" />
      <line x1="0" y1="9" x2="18" y2="9" stroke={B.gold} strokeWidth="0.7" opacity="0.35" />
      <line x1="9" y1="0" x2="9" y2="18" stroke={B.gold} strokeWidth="0.7" opacity="0.3" />
    </pattern>
  );
  if (pt === "brocade") return (
    <pattern id={id} x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
      <rect width="22" height="22" fill={c} />
      <ellipse cx="11" cy="11" rx="7" ry="5" fill="none" stroke={B.gold} strokeWidth="1.2" opacity="0.65" />
      <ellipse cx="11" cy="11" rx="3" ry="2" fill={B.gold} opacity="0.4" />
    </pattern>
  );
  if (pt === "check") return (
    <pattern id={id} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill={c} />
      <line x1="0" y1="8" x2="16" y2="8" stroke={dk} strokeWidth="0.6" opacity="0.35" />
      <line x1="8" y1="0" x2="8" y2="16" stroke={dk} strokeWidth="0.6" opacity="0.35" />
    </pattern>
  );
  return (
    <pattern id={id} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill={c} />
    </pattern>
  );
}

// ── Live Dress SVG ─────────────────────────────────────
function DressSVG({ sel }) {
  const fabric  = sel.mainFabric || "Cotton";
  const color   = sel.primaryColor || B.gold;
  const color2  = sel.secondaryColor || lighten(color, 35);
  const fd      = FABRICS[fabric] || FABRICS["Cotton"];
  const useGrad = (sel.colorStyle || "").includes("Gradient") || sel.colorStyle === "Ombre";
  const cx = 120;

  // Body shape
  const lenY = { "Very Short (above knee)": 220, "Short (knee length)": 265, "Mid (calf length)": 315, "Long (ankle length)": 365, "Full Floor Length": 410 };
  const bY = lenY[sel.length] || 340;
  const silW = { "Straight": [46,46], "A-Line": [44,82], "Flared / Umbrella": [42,115], "Empire Waist": [48,72], "Princess Cut": [42,50], "Fitted": [40,40], "Peplum": [42,54], "Tiered": [44,88], "Layered": [44,82] };
  const [tW, bW] = silW[sel.silhouette] || [46, 52];
  const tL = cx - tW, tR = cx + tW, bL = cx - bW, bR = cx + bW;

  let bodyPath = "M" + tL + " 100 Q" + (tL-4) + " 190 " + bL + " " + bY + " L" + bR + " " + bY + " Q" + (tR+4) + " 190 " + tR + " 100 Z";
  if (sel.garment === "Saree Blouse" || sel.garment === "Designer Blouse") {
    bodyPath = "M74 100 Q72 148 78 175 L162 175 Q168 148 166 100 Z";
  } else if (sel.garment === "Kaftan") {
    bodyPath = "M65 100 L63 " + bY + " L177 " + bY + " L175 100 Z";
  } else if (sel.garment === "Anarkali") {
    bodyPath = "M72 100 Q68 190 " + (cx-115) + " " + bY + " L" + (cx+115) + " " + bY + " Q" + (cx+68) + " 190 168 100 Z";
  } else if (sel.garment === "Lehenga") {
    bodyPath = "M70 100 L70 155 L5 " + bY + " L235 " + bY + " L170 155 L170 100 Z";
  }

  // Necklines
  const neckPaths = {
    "Round": "M96 72 Q120 92 144 72",
    "V-Neck": "M106 65 L120 96 L134 65",
    "Deep V": "M108 62 L120 110 L132 62",
    "U-Neck": "M96 72 Q120 100 144 72",
    "Sweetheart": "M98 76 Q110 68 120 78 Q130 68 142 76",
    "Boat / Bateau": "M88 68 L152 68",
    "Square": "M100 68 L100 90 L140 90 L140 68",
    "Mandarin / Chinese": "M104 68 L104 60 L136 60 L136 68",
    "High Neck": "M106 58 Q120 54 134 58 L134 72 Q120 76 106 72 Z",
    "Off-Shoulder": "M78 70 Q120 76 162 70",
    "Angrakha / Wrap": "M120 64 L96 92 M120 64 L148 82",
    "Halter": "M120 60 L98 72 M120 60 L142 72",
    "Cowl": "M96 70 Q108 92 120 86 Q132 92 144 70",
    "Collar / Shirt": "M106 68 L106 58 L120 64 L134 58 L134 68",
    "Keyhole": "M104 68 Q120 84 136 68",
    "Asymmetric": "M92 62 L148 78",
  };
  const nPath = neckPaths[sel.neckline] || neckPaths["Round"];

  // Sleeves
  const sleeveMap = {
    "Sleeveless": ["", ""],
    "Cap Sleeve": ["M74 92 Q60 102 65 118 L82 110 Z", "M166 92 Q180 102 175 118 L158 110 Z"],
    "Half Sleeve": ["M74 90 Q50 108 52 145 L82 138 L82 110 Z", "M166 90 Q190 108 188 145 L158 138 L158 110 Z"],
    "3/4 Sleeve": ["M74 90 Q44 118 46 190 L82 182 L82 110 Z", "M166 90 Q196 118 194 190 L158 182 L158 110 Z"],
    "Full Sleeve": ["M74 90 Q42 122 44 238 L82 230 L82 110 Z", "M166 90 Q198 122 196 238 L158 230 L158 110 Z"],
    "Puff Sleeve": ["M74 90 Q48 80 50 112 Q56 128 74 122 L82 110 Z", "M166 90 Q192 80 190 112 Q184 128 166 122 L158 110 Z"],
    "Bell / Flare": ["M74 90 Q46 118 28 172 L82 168 L82 110 Z", "M166 90 Q194 118 212 172 L158 168 L158 110 Z"],
    "Flutter": ["M74 90 Q56 100 52 122 Q62 115 74 124 L82 110 Z", "M166 90 Q184 100 188 122 Q178 115 166 124 L158 110 Z"],
    "Cold Shoulder": ["M52 112 Q46 134 48 170 L82 164 L82 110 Z", "M188 112 Q194 134 192 170 L158 164 L158 110 Z"],
    "Kimono": ["M74 90 Q28 98 18 165 L82 168 L82 110 Z", "M166 90 Q212 98 222 165 L158 168 L158 110 Z"],
    "Lantern": ["M74 90 Q50 108 54 138 Q46 152 50 172 L82 165 L82 110 Z", "M166 90 Q190 108 186 138 Q194 152 190 172 L158 165 L158 110 Z"],
    "One Shoulder": ["M74 75 Q44 92 44 170 L82 164 L82 110 Z", ""],
    "Tulip": ["M74 90 Q50 108 52 145 L68 132 Q72 148 82 138 L82 110 Z", "M166 90 Q190 108 188 145 L172 132 Q168 148 158 138 L158 110 Z"],
  };
  const [lSlv, rSlv] = sleeveMap[sel.sleeve] || sleeveMap["Half Sleeve"];

  // Slit
  const slitMap = {
    "Front Center": "M" + cx + " " + (bY-65) + " L" + cx + " " + bY,
    "Left Side": "M" + (bL+12) + " " + (bY-65) + " L" + bL + " " + bY,
    "Right Side": "M" + (bR-12) + " " + (bY-65) + " L" + bR + " " + bY,
    "Both Sides": "M" + (bL+12) + " " + (bY-65) + " L" + bL + " " + bY + " M" + (bR-12) + " " + (bY-65) + " L" + bR + " " + bY,
    "Curved Hem": "M" + bL + " " + (bY-22) + " Q" + cx + " " + (bY+18) + " " + bR + " " + (bY-22),
  };
  const slitPath = slitMap[sel.slit] || "";

  // Embellishment dots
  const embPos = {
    "Neckline": [[120,78]], "Yoke Front": [[120,118],[100,125],[140,125]],
    "Hem Border": [[80,330],[120,335],[160,330]], "Sleeve": [[58,135],[182,135]],
    "All Over": [[100,140],[140,160],[110,200],[130,230],[105,265]],
    "Waistband": [[90,198],[120,196],[150,198]], "Cuffs": [[50,192],[190,192]],
  };
  const embDots = (sel.embPlacement || []).flatMap(p => embPos[p] || []);
  const hasKasavu = (sel.embellishment || []).includes("Kasavu Border");
  const hasSeq = (sel.embellishment || []).includes("Sequins");
  const hasMirror = (sel.embellishment || []).includes("Mirror Work");
  const hasGota = (sel.embellishment || []).includes("Gota Patti");

  const fillRef = useGrad ? "url(#dg)" : "url(#fp)";

  return (
    <svg viewBox="0 0 240 450" style={{ width: "100%", maxWidth: 220, display: "block", margin: "0 auto", width: "100%" }}>
      <defs>
        <FabricPattern pt={fd.pt} color={color} id="fp" />
        {useGrad && (
          <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
        )}
        <clipPath id="bc"><path d={bodyPath} /></clipPath>
      </defs>

      {/* Mannequin guide */}
      <ellipse cx={cx} cy="48" rx="20" ry="24" fill="#e8ddd5" opacity="0.4" />
      <rect x={cx-7} y="68" width="14" height="18" rx="4" fill="#e8ddd5" opacity="0.35" />

      {/* Sleeves */}
      {lSlv && <path d={lSlv} fill={fillRef} opacity={fd.opacity} stroke={darken(color,18)} strokeWidth="1.2" />}
      {rSlv && <path d={rSlv} fill={fillRef} opacity={fd.opacity} stroke={darken(color,18)} strokeWidth="1.2" />}

      {/* Body */}
      <path d={bodyPath} fill={fillRef} opacity={fd.opacity} stroke={darken(color,22)} strokeWidth="1.8" />

      {/* Print patterns */}
      {sel.printType === "Stripe" && (
        <g clipPath="url(#bc)">
          {[0,24,48,72,96,120,144,168,192,216].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="500" stroke={darken(color,30)} strokeWidth="10" opacity="0.2" />
          ))}
        </g>
      )}
      {sel.printType === "Floral" && (
        <g clipPath="url(#bc)">
          {[35,90,145,195].map(x => [55,120,185,250,320,390].map(y => (
            <g key={x+"-"+y} transform={"translate(" + x + "," + y + ")"}>
              <circle cx="0" cy="-9" r="5" fill={darken(color,30)} opacity="0.3" />
              <circle cx="9" cy="0" r="5" fill={darken(color,20)} opacity="0.3" />
              <circle cx="0" cy="9" r="5" fill={darken(color,30)} opacity="0.3" />
              <circle cx="-9" cy="0" r="5" fill={darken(color,20)} opacity="0.3" />
              <circle cx="0" cy="0" r="4" fill={B.gold} opacity="0.4" />
            </g>
          )))}
        </g>
      )}
      {sel.printType === "Check" && (
        <g clipPath="url(#bc)">
          {[0,20,40,60,80,100,120,140,160,180,200,220].map(x => (
            <line key={"v"+x} x1={x} y1="0" x2={x} y2="500" stroke={darken(color,25)} strokeWidth="1" opacity="0.2" />
          ))}
          {[0,20,40,60,80,100,120,140,160,180,200,220,240,260,280,300,320,340,360,380,400,420,440,460,480,500].map(y => (
            <line key={"h"+y} x1="0" y1={y} x2="240" y2={y} stroke={darken(color,25)} strokeWidth="1" opacity="0.2" />
          ))}
        </g>
      )}
      {sel.printType === "Polka Dot" && (
        <g clipPath="url(#bc)">
          {[20,60,100,140,180,220].map(x => [30,80,130,180,230,280,330,380,430].map(y => (
            <circle key={x+"-"+y} cx={x+(y%40)} cy={y} r="5" fill={darken(color,30)} opacity="0.25" />
          )))}
        </g>
      )}
      {(sel.printType === "Kasavu Pattern" || hasKasavu) && (
        <g>
          <path d={"M" + (bL+2) + " " + (bY-20) + " L" + (bR-2) + " " + (bY-20)} stroke="#C9A258" strokeWidth="7" opacity="0.82" />
          <path d={"M" + (bL+2) + " " + (bY-12) + " L" + (bR-2) + " " + (bY-12)} stroke="#C9A258" strokeWidth="2.5" opacity="0.55" />
        </g>
      )}

      {/* Sheen */}
      {fd.sheen && <ellipse cx={cx-8} cy={145} rx={16} ry={55} fill={lighten(color,40)} opacity="0.15" clipPath="url(#bc)" />}

      {/* Tiered lines */}
      {sel.silhouette === "Tiered" && (
        <g>
          <line x1={tL-4} y1={220} x2={tR+4} y2={220} stroke={darken(color,18)} strokeWidth="1.2" opacity="0.5" />
          <line x1={bL+12} y1={285} x2={bR-12} y2={285} stroke={darken(color,18)} strokeWidth="1.2" opacity="0.5" />
        </g>
      )}
      {sel.silhouette === "Empire Waist" && (
        <line x1={tL+3} y1={140} x2={tR-3} y2={140} stroke={darken(color,22)} strokeWidth="1.8" opacity="0.6" />
      )}

      {/* Neckline */}
      <path d={nPath} fill={darken(color,12)} opacity="0.18" stroke={darken(color,32)} strokeWidth="1.8" />

      {/* Embellishments */}
      {hasSeq && [0,1,2,3,4,5,6,7,8].map(i => (
        <circle key={i} cx={cx-40+i*10+(i%3)*5} cy={115+i*8} r="2.5" fill={B.gold} opacity="0.7" />
      ))}
      {hasMirror && [0,1,2,3,4].map(i => (
        <rect key={i} x={cx-30+i*14} y={112+i*6} width="8" height="8" rx="1" fill={lighten(color,40)} stroke={B.gold} strokeWidth="0.8" opacity="0.8" />
      ))}
      {hasGota && (
        <g>
          <path d={"M" + tL + " 102 L" + tR + " 102"} stroke="#C9A258" strokeWidth="3" opacity="0.6" />
          <path d={"M" + (bL+4) + " " + (bY-5) + " L" + (bR-4) + " " + (bY-5)} stroke="#C9A258" strokeWidth="3" opacity="0.6" />
        </g>
      )}

      {/* Slit */}
      {slitPath && <path d={slitPath} fill="none" stroke={darken(color,28)} strokeWidth="1.5" strokeDasharray="3,2.5" opacity="0.85" />}

      {/* Embellishment dots */}
      {embDots.map((ep, i) => (
        <g key={i}>
          <circle cx={ep[0]} cy={ep[1]} r="7" fill={B.gold} opacity="0.55" />
          <circle cx={ep[0]} cy={ep[1]} r="3.5" fill="#fff" opacity="0.9" />
          <circle cx={ep[0]} cy={ep[1]} r="1.5" fill={B.gold} opacity="0.8" />
        </g>
      ))}

      {/* Labels */}
      <text x={cx} y={bY+22} textAnchor="middle" fontSize="9" fill={B.muted}>{sel.garment || "Select Garment"}</text>
      {sel.mainFabric && sel.mainFabric !== "Cotton" && (
        <text x={cx} y={bY+34} textAnchor="middle" fontSize="7" fill={B.gold}>{sel.mainFabric}</text>
      )}

      {/* Head */}
      <ellipse cx={cx} cy="34" rx="16" ry="20" fill="#e8c8a0" opacity="0.6" />
      <ellipse cx={cx} cy="14" rx="14" ry="8" fill="#6b4020" opacity="0.55" />
    </svg>
  );
}

// ── Fabric swatch ──────────────────────────────────────
function FabricSwatch({ fabric, color }) {
  if (!fabric) return (
    <div style={{ background: "#fff", border: "1px solid " + B.border, borderRadius: 10, padding: 14, textAlign: "center", color: B.muted, fontSize: "0.76rem" }}>
      Select a fabric to see details
    </div>
  );
  const fd = FABRICS[fabric];
  if (!fd) return null;
  const col = color || B.gold;
  return (
    <div style={{ background: "#fff", border: "1px solid " + B.border, borderRadius: 10, padding: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
        <svg width="48" height="48" style={{ borderRadius: 6, border: "1px solid " + B.border, flexShrink: 0, overflow: "hidden" }}>
          <defs><FabricPattern pt={fd.pt} color={col} id="swp" /></defs>
          <rect width="48" height="48" fill="url(#swp)" opacity={fd.opacity} />
          {fd.sheen && <ellipse cx="18" cy="18" rx="16" ry="10" fill={lighten(col,40)} opacity="0.28" />}
        </svg>
        <div>
          <div style={{ fontWeight: 700, color: B.burgundy, fontSize: "0.82rem" }}>{fabric}</div>
          <div style={{ fontSize: "0.7rem", color: B.muted }}>{fd.feel}</div>
          <div style={{ fontSize: "0.7rem", color: B.gold }}>Kerala {fd.climate}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, fontSize: "0.7rem", marginBottom: 6 }}>
        <div>{fd.pros.map(p => <div key={p} style={{ color: B.green }}>{"✓ " + p}</div>)}</div>
        <div>{fd.cons.map(c => <div key={c} style={{ color: B.red }}>{"✗ " + c}</div>)}</div>
      </div>
      <div style={{ fontSize: "0.68rem", color: B.muted, background: B.cream, borderRadius: 6, padding: "4px 8px" }}>{"💧 " + fd.wash}</div>
    </div>
  );
}

// ── Colour strip ───────────────────────────────────────
function ColourStrip({ mood, selected, onSelect, label }) {
  const cols = PALETTES[mood] || PALETTES["Pastel Kerala"];
  return (
    <div>
      {label && <div style={{ fontSize: "0.69rem", color: B.muted, marginBottom: 4 }}>{label}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {cols.map(c => (
          <div key={c} onClick={() => onSelect(c)} title={c} style={{
            width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer",
            border: selected === c ? "3px solid " + B.burgundy : "2px solid " + B.border,
            boxShadow: selected === c ? "0 0 0 2px " + B.gold : "none",
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Options ────────────────────────────────────────────
const O = {
  garment: ["Kurti","Kurta Set","Anarkali","Churidar Set","Palazzo Set","Co-ord Set","Sharara Set","Gharara Set","Saree Blouse","Designer Blouse","Kaftan","Tunic","Indo-Western","Maxi Dress","Lehenga","Nightwear","Lounge Wear","Maternity Wear","Plus Size Ethnic"],
  bodyType: ["Petite","Slim","Regular","Athletic","Curvy","Plus Size","Pear Shape","Apple Shape","Hourglass"],
  skinTone: ["Very Fair","Fair","Wheatish","Medium Brown","Dusky","Dark","Very Dark"],
  ageGroup: ["Teen (13-17)","Young (18-25)","Mid (26-35)","Adult (36-50)","Mature (50+)"],
  size: ["XS","S","M","L","XL","XXL","3XL","4XL","Custom"],
  occasion: ["Daily Wear","Office","College","Casual","Travel","Home","Nightwear","Onam","Vishu","Christmas","Eid","Haldi","Engagement","Wedding Guest","Reception","Bridal","Temple","Church","Family Function","Gift Purchase"],
  season: ["Kerala Summer","Kerala Monsoon","Kerala Winter","Coastal","AC Office","AC Event Hall","North India Summer","North India Winter","UAE Summer","UAE Winter","UK/Europe Winter","UK/Europe Summer","USA Summer","USA Winter","Southeast Asia","Outdoor Wedding Day","Outdoor Wedding Night","Indoor Banquet","Beach Event","Flight/Travel","All Season"],
  modesty: ["Hindu Traditional","Christian Modest","Muslim Modest","No Restriction","Modern Liberal"],
  budget: ["Under Rs500","Rs500-1000","Rs1000-2000","Rs2000-4000","Rs4000-8000","Above Rs8000"],
  neckline: ["Round","V-Neck","Deep V","U-Neck","Sweetheart","Boat / Bateau","Square","Collar / Shirt","Mandarin / Chinese","Keyhole","Halter","Off-Shoulder","High Neck","Angrakha / Wrap","Asymmetric","Cowl"],
  sleeve: ["Sleeveless","Cap Sleeve","Half Sleeve","3/4 Sleeve","Full Sleeve","Puff Sleeve","Bell / Flare","Flutter","Cold Shoulder","Kimono","Lantern","One Shoulder","Tulip"],
  fit: ["Loose / Relaxed","Regular","Semi-Fitted","Fitted","Body-Con"],
  silhouette: ["Straight","A-Line","Flared / Umbrella","Empire Waist","Princess Cut","Peplum","Tiered","Layered","High-Low","Angrakha Wrap"],
  slit: ["No Slit","Front Center","Left Side","Right Side","Both Sides","Back Slit","Curved Hem","Invisible"],
  length: ["Very Short (above knee)","Short (knee length)","Mid (calf length)","Long (ankle length)","Full Floor Length"],
  mainFabric: ["Cotton","Rayon / Viscose","Linen","Georgette","Chiffon","Crepe","Silk (Pure)","Chanderi","Muslin / Mulmul","Net","Velvet","Brocade","Kota Doria","Organza","Satin"],
  colorMood: ["Pastel Soft","Jewel Tone","Earthy Neutral","Bright Bold","Festive Rich","Classic White","Pastel Kerala","Monochrome"],
  colorStyle: ["Solid Single Colour","Two Tone","Gradient Top to Bottom","Ombre","Colour Block","Printed Pattern"],
  printType: ["No Print","Block Print","Digital Print","Foil Print","Tie-Dye","Batik","Ikat","Kasavu Pattern","Bandhani","Leheriya","Stripe","Check","Polka Dot","Floral","Geometric","Paisley","Kerala Motif"],
  embellishment: ["None","Kasavu Border","Aari Work","Zardosi","Chikankari","Mirror Work","Sequins","Beads","Gota Patti","Thread Work","Applique","Lace Trim","Stone Work","Kantha Stitch","Phulkari","Foil Work","Tassels","Pintucks"],
  embPlacement: ["Neckline","Yoke Front","Sleeve","Hem Border","Back Neck","Side Panel","All Over","Cuffs","Waistband"],
  embDensity: ["Minimal","Moderate","Heavy","Very Heavy (Bridal)"],
  closure: ["No Closure","Button","Hook and Eye","Concealed Zip","Visible Zip","Tie / Dori","Drawstring","Elastic Only"],
  pocket: ["No Pocket","Side Seam Pocket","Patch Pocket","Hidden Pocket"],
  dupatta: ["No Dupatta","Same as Dress","Chiffon","Georgette","Net","Silk","Kota Doria","Kasavu Border"],
  quantity: ["1 Sample","5-10 Pieces","10-25 Pieces","25-50 Pieces","50-100 Pieces","100+ Pieces"],
  sizeSet: ["Single Size","S-M-L-XL","Full Range XS-3XL","Plus Only XL-4XL","Custom"],
};

const SKIN_TONES = [
  { id: "vf", label: "Very Fair", hex: "#FDDBB4" }, { id: "f", label: "Fair", hex: "#F5C98A" },
  { id: "w", label: "Wheatish", hex: "#D4A574" },   { id: "m", label: "Medium", hex: "#C68642" },
  { id: "d", label: "Dusky", hex: "#A0522D" },       { id: "dk", label: "Dark", hex: "#8B4513" },
  { id: "vd", label: "Very Dark", hex: "#5C2E00" },
];

const MEAS = [
  { id: "bust", label: "Bust", unit: "in", group: "upper", hint: "Fullest part of bust" },
  { id: "waist", label: "Waist", unit: "in", group: "upper", hint: "Natural waistline" },
  { id: "hip", label: "Hip", unit: "in", group: "upper", hint: "Fullest part of hip" },
  { id: "shoulder", label: "Shoulder", unit: "in", group: "upper", hint: "Across back shoulder to shoulder" },
  { id: "height", label: "Height", unit: "cm", group: "upper", hint: "Standing straight" },
  { id: "front_length", label: "Front Length", unit: "in", group: "upper", hint: "Shoulder to waist" },
  { id: "sleeve_len", label: "Sleeve Length", unit: "in", group: "arm", hint: "Shoulder to wrist" },
  { id: "sleeve_round", label: "Sleeve Round", unit: "in", group: "arm", hint: "Around upper arm" },
  { id: "armhole", label: "Armhole", unit: "in", group: "arm", hint: "Around arm at armhole" },
  { id: "front_neck", label: "Front Neck Depth", unit: "in", group: "arm", hint: "Shoulder to neckline" },
  { id: "back_neck", label: "Back Neck Depth", unit: "in", group: "arm", hint: "Shoulder to back neckline" },
  { id: "kurta_len", label: "Kurta Length", unit: "in", group: "length", hint: "Shoulder to hem" },
  { id: "thigh", label: "Thigh", unit: "in", group: "lower", hint: "Around fullest thigh" },
  { id: "inseam", label: "Inseam", unit: "in", group: "lower", hint: "Crotch to ankle" },
  { id: "pant_len", label: "Pant Length", unit: "in", group: "lower", hint: "Waist to ankle" },
];

function classifyBody(m) {
  const b = parseFloat(m.bust)||0, w = parseFloat(m.waist)||0, h = parseFloat(m.hip)||0;
  if (!b || !w || !h) return null;
  if (Math.abs(b-h) <= 1 && w/b <= 0.75) return "Hourglass";
  if (h > b+2 && w/h <= 0.75) return "Pear Shape";
  if (b > h+2) return "Apple Shape";
  if (w/b >= 0.85 && w/h >= 0.85) return "Rectangular";
  return "Balanced";
}
function classifySize(bust) {
  const b = parseFloat(bust)||0;
  if (!b) return null;
  if (b <= 32) return "XS"; if (b <= 34) return "S"; if (b <= 36) return "M";
  if (b <= 38) return "L"; if (b <= 40) return "XL"; if (b <= 42) return "XXL";
  if (b <= 44) return "3XL"; return "4XL";
}

async function callAI(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}

// ── AI result renderer ─────────────────────────────────
function AIResult({ text }) {
  if (!text) return null;
  const sections = text.split("##").filter(s => s.trim());
  return (
    <div style={{ marginTop: 12 }}>
      {sections.map((sec, i) => {
        const lines = sec.trim().split("\n");
        const title = lines[0].trim();
        const body = lines.slice(1).join("\n").trim();
        const type = title.includes("WARN") || title.includes("AVOID") ? "warn" :
                     title.includes("TECH") || title.includes("OUTFIT") ? "gold" :
                     title.includes("MEAS") ? "blue" : "default";
        return (
          <InfoCard key={i} type={type}>
            <div style={{ fontWeight: 700, fontSize: "0.78rem", color: type === "warn" ? B.red : type === "gold" ? B.warn : type === "blue" ? B.blue : B.burgundy, marginBottom: 5 }}>
              {title}
            </div>
            <div style={{ fontSize: "0.74rem", color: "#3a3a3a", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{body}</div>
          </InfoCard>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════
export default function App() {
  const isMobile = useIsMobile();
  const [mod, setMod] = useState("home");
  const [sel, setSel] = useState({});
  const [meas, setMeas] = useState({});
  const [prof, setProf] = useState({ name: "", ageGroup: "", occasion: "", budget: "", skinTone: "" });
  const [measGrp, setMeasGrp] = useState("upper");
  const [aiDesign, setAIDesign] = useState("");
  const [aiBody, setAIBody] = useState("");
  const [aiRef, setAIRef] = useState("");
  const [loading, setLoading] = useState("");
  const [refDesc, setRefDesc] = useState("");
  const [refLinks, setRefLinks] = useState("");
  const [refImg, setRefImg] = useState(null);
  const [saved, setSaved] = useState([]);
  const fileRef = useRef();

  const bodyType = classifyBody(meas);
  const size = classifySize(meas.bust);
  const skinHex = SKIN_TONES.find(s => s.id === prof.skinTone)?.hex || "#D4A574";
  const filledSel = Object.keys(sel).filter(k => { const v = sel[k]; return Array.isArray(v) ? v.length > 0 : !!v; }).length;
  const filledMeas = Object.values(meas).filter(v => v && v !== "").length;

  function toggleSel(k, v, multi) {
    if (multi) {
      setSel(p => { const a = p[k] || []; return { ...p, [k]: a.includes(v) ? a.filter(x => x !== v) : [...a, v] }; });
    } else {
      setSel(p => ({ ...p, [k]: p[k] === v ? null : v }));
    }
  }

  async function genDesign() {
    setLoading("design");
    const lines = Object.entries(sel).filter(([k,v]) => v && (Array.isArray(v) ? v.length > 0 : true) && k !== "primaryColor" && k !== "secondaryColor").map(([k,v]) => k + ": " + (Array.isArray(v) ? v.join(", ") : v)).join("\n");
    const prompt = "You are a senior Indian fashion designer for Kerala boutique Shades of Pastel.\nUser selections:\n" + lines + "\n\nRespond with:\n## DESIGN SUMMARY\n## WARNINGS\n## COLOUR SUGGESTION\n## TECH PACK\nStyle Code: SOP-[4 digits]\nGarment: [type]\nFabric: [fabric + metres]\nNeckline: [style]\nSleeve: [style]\nEmbellishment: [type + placement]\nWash Care: [brief]\nTailor Notes: [2-3 points]\n\nKeep simple and practical.";
    try { setAIDesign(await callAI(prompt)); setMod("techpack"); } catch { setAIDesign("Generation failed. Please try again."); }
    setLoading("");
  }

  async function genBody() {
    setLoading("body");
    const mLines = Object.entries(meas).filter(([,v]) => v).map(([k,v]) => k + ": " + v).join(", ");
    const prompt = "Senior Indian fashion designer for Kerala boutique Shades of Pastel.\nCustomer: " + (prof.name || "Customer") + ", " + prof.ageGroup + ", " + prof.skinTone + " skin, Budget: " + prof.budget + "\nOccasion: " + prof.occasion + "\nMeasurements: " + mLines + "\nBody Type: " + (bodyType || "unknown") + "\nSize: " + (size || "unknown") + "\n\nRespond with:\n## FIT ANALYSIS\n## RECOMMENDED GARMENTS\n## WHAT TO AVOID\n## TAILOR MEASUREMENTS\n## STYLING TIPS\n## OUTFIT SUGGESTION\n\nKeep warm, positive and simple.";
    try { setAIBody(await callAI(prompt)); } catch { setAIBody("Analysis failed. Please try again."); }
    setLoading("");
  }

  async function genRef() {
    setLoading("ref");
    let prompt = "Senior Indian fashion designer for Kerala boutique Shades of Pastel.\n";
    if (refDesc) prompt += "Description: " + refDesc + "\n";
    if (refLinks) prompt += "Links: " + refLinks + "\n";
    prompt += "\nExtract design elements and assess Kerala market fit:\n## WHAT I SEE\n## DESIGN ELEMENTS\nGarment | Neckline | Sleeve | Silhouette | Fabric | Colour | Embellishment | Occasion\n## KERALA MARKET FIT\nSuitability | Target customer | Price range | What works | Adaptation suggestions\n\nKeep simple.";

    let content = [{ type: "text", text: prompt }];
    if (refImg) content = [{ type: "image", source: { type: "base64", media_type: refImg.type, data: refImg.data } }, { type: "text", text: prompt }];

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 800, messages: [{ role: "user", content }] }),
      });
      const data = await res.json();
      setAIRef(data.content?.map(b => b.text || "").join("") || "");
    } catch { setAIRef("Analysis failed."); }
    setLoading("");
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setRefImg({ type: file.type, data: reader.result.split(",")[1], name: file.name });
    reader.readAsDataURL(file);
  }

  function saveDesign() {
    const name = "Design " + (saved.length + 1) + " — " + (sel.garment || "Unnamed");
    setSaved(p => [...p, { name, sel: { ...sel }, ai: aiDesign, ts: Date.now() }]);
  }

  const NAV = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "customer", icon: "📐", label: "Customer" },
    { id: "design", icon: "🎨", label: "Design" },
    { id: "reference", icon: "🖼", label: "Reference" },
    { id: "techpack", icon: "📄", label: "Tech Pack" },
  ];

  // ── Right preview panel (reused in design) ────────────
  function PreviewPanel() {
    return (
      <div style={{ position: isMobile ? "relative" : "sticky", top: isMobile ? 0 : 54, height: isMobile ? "auto" : "calc(100vh - 120px)", overflowY: "auto", background: B.soft, borderLeft: isMobile ? "none" : ("1px solid " + B.border), borderTop: isMobile ? ("1px solid " + B.border) : "none", padding: "12px 10px" }}>
        <div style={{ fontWeight: 700, color: B.burgundy, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Live Preview</div>
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid " + B.border, padding: "8px", marginBottom: 10, display: "flex", justifyContent: "center" }}>
          <DressSVG sel={sel} />
        </div>
        {sel.colorMood && (
          <div style={{ background: "#fff", border: "1px solid " + B.border, borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: B.burgundy, marginBottom: 5 }}>🎨 Pick Colour</div>
            <ColourStrip mood={sel.colorMood} selected={sel.primaryColor} onSelect={c => setSel(p => ({ ...p, primaryColor: c }))} label="Primary:" />
            {sel.colorStyle && sel.colorStyle !== "Solid Single Colour" && (
              <div style={{ marginTop: 8 }}>
                <ColourStrip mood={sel.colorMood} selected={sel.secondaryColor} onSelect={c => setSel(p => ({ ...p, secondaryColor: c }))} label="Secondary:" />
              </div>
            )}
          </div>
        )}
        <FabricSwatch fabric={sel.mainFabric} color={sel.primaryColor} />
        {filledSel > 0 && (
          <div style={{ background: "#fff", border: "1px solid " + B.border, borderRadius: 8, padding: "8px 10px", marginTop: 8 }}>
            <div style={{ fontSize: "0.69rem", fontWeight: 600, color: B.burgundy, marginBottom: 4 }}>{"Selected (" + filledSel + ")"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {Object.entries(sel).filter(([k,v]) => v && (Array.isArray(v) ? v.length > 0 : true) && k !== "primaryColor" && k !== "secondaryColor").map(([k,v]) => (
                <span key={k} style={{ background: B.cream, border: "1px solid " + B.border, borderRadius: 8, padding: "2px 7px", fontSize: "0.64rem", color: B.burgundy }}>
                  {Array.isArray(v) ? v.join("+") : v}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: B.cream, fontFamily: "'Segoe UI', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg," + B.burgundy + ",#6b2030)", padding: isMobile ? "8px 14px" : "10px 18px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: "0.6rem", color: B.gold, letterSpacing: 2, textTransform: "uppercase" }}>Shades of Pastel</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, marginTop: 1 }}>🌸 Design Studio</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {filledSel > 0 && <span style={{ fontSize: "0.68rem", color: "#e8c8a0", background: "#ffffff15", borderRadius: 8, padding: "2px 8px" }}>{filledSel + " selections"}</span>}
          <button onClick={() => { setSel({}); setMeas({}); setAIDesign(""); setAIBody(""); }} style={{ background: "none", border: "1px solid #ffffff30", color: "#fff", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: "0.68rem" }}>Reset</button>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid " + B.border, display: "flex", zIndex: 100, boxShadow: "0 -2px 10px rgba(59,18,21,0.06)" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setMod(n.id)} style={{ flex: 1, padding: isMobile ? "10px 4px 8px" : "8px 4px 6px", border: "none", background: "none", cursor: "pointer", color: mod === n.id ? B.burgundy : B.muted, borderTop: "2px solid " + (mod === n.id ? B.gold : "transparent") }}>
            <div style={{ fontSize: isMobile ? "1.3rem" : "1.1rem" }}>{n.icon}</div>
            <div style={{ fontSize: isMobile ? "0.65rem" : "0.62rem", fontWeight: mod === n.id ? 700 : 400 }}>{n.label}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 70 }}>

        {/* HOME */}
        {mod === "home" && (
          <div style={{ padding: isMobile ? "12px 12px" : "18px 16px", maxWidth: 700, margin: "0 auto" }}>
            <div style={{ textAlign: "center", padding: "20px 16px 12px" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🌸</div>
              <h1 style={{ color: B.burgundy, fontSize: "1.2rem", margin: "0 0 4px" }}>Shades of Pastel</h1>
              <p style={{ color: B.muted, fontSize: "0.8rem", margin: 0 }}>AI-powered design studio for Kerala ethnic wear</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { icon: "📐", title: "New Customer", sub: "Measure + analyse", m: "customer", color: B.blue },
                { icon: "🎨", title: "Design Dress", sub: "Live visual builder", m: "design", color: B.burgundy },
                { icon: "🖼", title: "Add Reference", sub: "Upload inspiration", m: "reference", color: B.warn },
                { icon: "📄", title: "Tech Pack", sub: "Export for tailor", m: "techpack", color: B.green },
              ].map(a => (
                <button key={a.m} onClick={() => setMod(a.m)} style={{ background: "#fff", border: "1px solid " + B.border, borderRadius: 12, padding: "14px 12px", cursor: "pointer", textAlign: "left", borderLeft: "4px solid " + a.color }}>
                  <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{a.icon}</div>
                  <div style={{ fontWeight: 700, color: B.burgundy, fontSize: "0.85rem" }}>{a.title}</div>
                  <div style={{ fontSize: "0.72rem", color: B.muted, marginTop: 2 }}>{a.sub}</div>
                </button>
              ))}
            </div>
            <div style={{ background: "#fff", border: "1px solid " + B.border, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: B.burgundy, fontSize: "0.85rem", marginBottom: 10 }}>Session Status</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[{ l: "Selections", v: filledSel, i: "🎨" }, { l: "Measurements", v: filledMeas, i: "📐" }, { l: "Saved", v: saved.length, i: "💾" }].map(s => (
                  <div key={s.l} style={{ textAlign: "center", background: s.v > 0 ? B.cream : B.soft, borderRadius: 8, padding: "10px 6px" }}>
                    <div style={{ fontSize: "1.2rem" }}>{s.i}</div>
                    <div style={{ fontWeight: 700, color: s.v > 0 ? B.burgundy : B.muted, fontSize: "1.1rem" }}>{s.v}</div>
                    <div style={{ fontSize: "0.65rem", color: B.muted, marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            {(bodyType || size) && (
              <div style={{ background: "#fff", border: "1px solid " + B.border, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: B.burgundy, fontSize: "0.85rem", marginBottom: 8 }}>Customer Profile</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {prof.skinTone && <div style={{ width: 36, height: 36, borderRadius: "50%", background: skinHex, border: "2px solid " + B.border, flexShrink: 0 }} />}
                  <div style={{ fontSize: "0.78rem" }}>
                    {prof.name && <div style={{ fontWeight: 600, color: B.burgundy }}>{prof.name}</div>}
                    {bodyType && <div>{"Body Type: "}<b>{bodyType}</b></div>}
                    {size && <div>{"Size: "}<b style={{ color: B.gold }}>{size}</b></div>}
                  </div>
                </div>
              </div>
            )}
            {saved.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid " + B.border, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontWeight: 700, color: B.burgundy, fontSize: "0.85rem", marginBottom: 10 }}>Saved Designs</div>
                {saved.map((d, i) => (
                  <div key={i} onClick={() => { setSel({ ...d.sel }); setAIDesign(d.ai || ""); setMod("design"); }} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + B.border, cursor: "pointer" }}>
                    <div>
                      <div style={{ fontSize: "0.78rem", fontWeight: 600, color: B.burgundy }}>{d.name}</div>
                      <div style={{ fontSize: "0.68rem", color: B.muted }}>{new Date(d.ts).toLocaleDateString()}</div>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: B.blue }}>Load →</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CUSTOMER */}
        {mod === "customer" && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 180px", maxWidth: 900, margin: "0 auto" }}>
            <div style={{ padding: isMobile ? "10px 12px" : "14px 18px", overflowY: "auto", maxHeight: isMobile ? "none" : "calc(100vh - 120px)" }}>
              <Sec icon="👤" title="Customer Profile" sub="Enter basic details" />
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 12 }}>
                {[
                  { k: "name", label: "Name", type: "text", ph: "Customer name" },
                  { k: "ageGroup", label: "Age Group", type: "select", opts: ["Teen (13-17)","Young (18-25)","Mid (26-35)","Adult (36-50)","Mature (50+)"] },
                  { k: "occasion", label: "Occasion", type: "select", opts: ["Daily Wear","Office","Onam","Vishu","Christmas","Eid","Wedding Guest","Bridal","Temple","Church","Casual","Travel","Gift"] },
                  { k: "budget", label: "Budget", type: "select", opts: ["Under Rs500","Rs500-1000","Rs1000-2000","Rs2000-4000","Rs4000-8000","Above Rs8000"] },
                ].map(f => (
                  <div key={f.k}>
                    <Label>{f.label}</Label>
                    {f.type === "text" ? (
                      <input value={prof[f.k]} onChange={e => setProf(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} style={{ width: "100%", padding: "7px 10px", border: "1px solid " + B.border, borderRadius: 7, fontSize: "0.8rem", background: "#fff", boxSizing: "border-box" }} />
                    ) : (
                      <select value={prof[f.k]} onChange={e => setProf(p => ({ ...p, [f.k]: e.target.value }))} style={{ width: "100%", padding: "7px 10px", border: "1px solid " + B.border, borderRadius: 7, fontSize: "0.8rem", background: "#fff", boxSizing: "border-box" }}>
                        <option value="">Select...</option>
                        {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
              <Label>Skin Tone</Label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {SKIN_TONES.map(st => (
                  <div key={st.id} onClick={() => setProf(p => ({ ...p, skinTone: st.id }))} style={{ cursor: "pointer", textAlign: "center" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: st.hex, border: prof.skinTone === st.id ? "3px solid " + B.burgundy : "2px solid " + B.border, boxShadow: prof.skinTone === st.id ? "0 0 0 2px " + B.gold : "none", margin: "0 auto 3px" }} />
                    <div style={{ fontSize: "0.6rem", color: B.muted }}>{st.label}</div>
                  </div>
                ))}
              </div>
              <Sec icon="📏" title="Measurements" sub="All in inches except height (cm)" />
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                {["upper","arm","length","lower"].map(g => (
                  <button key={g} onClick={() => setMeasGrp(g)} style={{ background: measGrp === g ? B.burgundy : "#fff", color: measGrp === g ? "#fff" : B.burgundy, border: "1.5px solid " + (measGrp === g ? B.burgundy : B.border), borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: "0.74rem", fontWeight: 600, textTransform: "capitalize" }}>
                    {g}
                  </button>
                ))}
              </div>
              {MEAS.filter(m => m.group === measGrp).map(def => (
                <div key={def.id} style={{ background: "#fff", border: "1px solid " + (meas[def.id] ? B.gold : B.border), borderRadius: 8, padding: "8px 12px", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, color: B.burgundy, fontSize: "0.8rem" }}>{def.label}</span>
                    <span style={{ fontSize: "0.68rem", color: B.muted, background: B.cream, borderRadius: 8, padding: "1px 6px" }}>{def.unit}</span>
                    {meas[def.id] && <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: B.green }}>✓</span>}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: B.muted, marginBottom: 4 }}>{def.hint}</div>
                  <input type="number" value={meas[def.id] || ""} step="0.5" onChange={e => setMeas(p => ({ ...p, [def.id]: e.target.value }))} placeholder={"Enter " + def.unit} style={{ width: "100%", padding: "6px 10px", border: "1px solid " + B.border, borderRadius: 6, fontSize: "0.82rem", background: "#fff", boxSizing: "border-box" }} />
                </div>
              ))}
              <button onClick={genBody} disabled={loading === "body" || filledMeas < 3} style={{ width: "100%", marginTop: 12, marginBottom: 8, padding: "11px", background: filledMeas < 3 ? B.border : B.burgundy, color: "#fff", border: "none", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: filledMeas < 3 ? "default" : "pointer" }}>
                {loading === "body" ? "Analysing..." : "Get AI Recommendations"}
              </button>
              <AIResult text={aiBody} />
            </div>
            {/* Body figure panel */}
            <div style={{ background: B.soft, borderLeft: isMobile ? "none" : ("1px solid " + B.border), borderTop: isMobile ? ("1px solid " + B.border) : "none", padding: "14px 10px", position: isMobile ? "relative" : "sticky", top: isMobile ? 0 : 54, height: isMobile ? "auto" : "calc(100vh - 120px)", overflowY: "auto" }}>
              <div style={{ fontWeight: 700, color: B.burgundy, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, textAlign: "center" }}>Body</div>
              <svg viewBox="0 0 140 320" style={{ width: "100%", maxWidth: 130, display: "block", margin: "0 auto" }}>
                <ellipse cx="70" cy="30" rx="18" ry="22" fill={skinHex} opacity="0.8" />
                <ellipse cx="70" cy="12" rx="16" ry="10" fill="#5C2E00" opacity="0.7" />
                <rect x="63" y="48" width="14" height="16" rx="4" fill={skinHex} opacity="0.75" />
                {(() => {
                  const bust = parseFloat(meas.bust)||34, waist = parseFloat(meas.waist)||28, hip = parseFloat(meas.hip)||36;
                  const mx = Math.max(bust, waist, hip, 30);
                  const bW = (bust/mx)*38, wW = (waist/mx)*28, hW = (hip/mx)*42;
                  return (
                    <g>
                      <path d={"M" + (70-bW) + " 64 Q" + (70-bW-3) + " 110 " + (70-wW) + " 140 Q" + (70-hW+3) + " 158 " + (70-hW) + " 168 L" + (70+hW) + " 168 Q" + (70+hW-3) + " 158 " + (70+wW) + " 140 Q" + (70+bW+3) + " 110 " + (70+bW) + " 64 Z"} fill={skinHex} opacity="0.82" />
                      <rect x={70-16} y="168" width="14" height="80" rx="6" fill={skinHex} opacity="0.7" />
                      <rect x={70+2} y="168" width="14" height="80" rx="6" fill={skinHex} opacity="0.7" />
                      <path d={"M" + (70-bW) + " 64 Q" + (70-bW-18) + " 100 " + (70-bW-12) + " 140"} fill="none" stroke={skinHex} strokeWidth="12" strokeLinecap="round" opacity="0.7" />
                      <path d={"M" + (70+bW) + " 64 Q" + (70+bW+18) + " 100 " + (70+bW+12) + " 140"} fill="none" stroke={skinHex} strokeWidth="12" strokeLinecap="round" opacity="0.7" />
                      {meas.bust && <line x1={70-bW-4} y1={90} x2={70+bW+4} y2={90} stroke={B.gold} strokeWidth="0.8" strokeDasharray="3,2" opacity="0.7" />}
                      {meas.waist && <line x1={70-wW-4} y1={140} x2={70+wW+4} y2={140} stroke={B.burgundy} strokeWidth="0.8" strokeDasharray="3,2" opacity="0.7" />}
                      {meas.hip && <line x1={70-hW-4} y1={168} x2={70+hW+4} y2={168} stroke={B.blue} strokeWidth="0.8" strokeDasharray="3,2" opacity="0.7" />}
                    </g>
                  );
                })()}
                {bodyType && <text x="70" y="310" textAnchor="middle" fontSize="7" fill={B.burgundy} fontWeight="600">{bodyType}</text>}
              </svg>
              <div style={{ marginTop: 8 }}>
                {[{ l: "Size", v: size, c: B.gold }, { l: "Body", v: bodyType, c: B.burgundy }, { l: "Bust", v: meas.bust ? meas.bust + "\"" : null }, { l: "Waist", v: meas.waist ? meas.waist + "\"" : null }, { l: "Hip", v: meas.hip ? meas.hip + "\"" : null }].filter(s => s.v).map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid " + B.border, fontSize: "0.7rem" }}>
                    <span style={{ color: B.muted }}>{s.l}</span>
                    <span style={{ color: s.c || B.muted, fontWeight: 600 }}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DESIGN */}
        {mod === "design" && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 240px", maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ padding: isMobile ? "10px 12px" : "14px 18px", overflowY: "auto", maxHeight: isMobile ? "none" : "calc(100vh - 120px)" }}>
              <Sec icon="👗" title="Garment Type" sub="Select one" />
              <div style={{ display: "flex", flexWrap: "wrap" }}>{O.garment.map(g => <Pill key={g} label={g} selected={sel.garment === g} onClick={() => toggleSel("garment", g)} />)}</div>

              <Sec icon="👤" title="Who Is This For?" sub="All optional" />
              <Label>Body Type</Label><div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>{O.bodyType.map(g => <Pill key={g} label={g} small selected={sel.bodyType === g} onClick={() => toggleSel("bodyType", g)} />)}</div>
              <Label>Skin Tone</Label><div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>{O.skinTone.map(g => <Pill key={g} label={g} small selected={sel.skinTone === g} onClick={() => toggleSel("skinTone", g)} />)}</div>
              <Label>Age Group</Label><div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>{O.ageGroup.map(g => <Pill key={g} label={g} small selected={sel.ageGroup === g} onClick={() => toggleSel("ageGroup", g)} />)}</div>
              <Label>Size</Label><div style={{ display: "flex", flexWrap: "wrap" }}>{O.size.map(g => <Pill key={g} label={g} small selected={sel.size === g} onClick={() => toggleSel("size", g)} />)}</div>

              <Sec icon="🎉" title="Occasion and Context" />
              <Label>Occasion</Label><div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>{O.occasion.map(g => <Pill key={g} label={g} small selected={sel.occasion === g} onClick={() => toggleSel("occasion", g)} />)}</div>
              <Label>Season</Label><div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>{O.season.map(g => <Pill key={g} label={g} small selected={sel.season === g} onClick={() => toggleSel("season", g)} />)}</div>
              <Label>Modesty</Label><div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>{O.modesty.map(g => <Pill key={g} label={g} small selected={sel.modesty === g} onClick={() => toggleSel("modesty", g)} />)}</div>
              <Label>Budget</Label><div style={{ display: "flex", flexWrap: "wrap" }}>{O.budget.map(g => <Pill key={g} label={g} small selected={sel.budget === g} onClick={() => toggleSel("budget", g)} />)}</div>

              <Sec icon="✏️" title="Design Components" sub="Updates dress live on the right" />
              {[["Neckline","neckline"],["Sleeve Style","sleeve"],["Body Fit","fit"],["Silhouette","silhouette"],["Slit","slit"],["Length","length"]].map(([lbl,key]) => (
                <div key={key}><Label>{lbl}</Label><div style={{ display: "flex", flexWrap: "wrap", marginBottom: 4 }}>{O[key].map(g => <Pill key={g} label={g} small selected={sel[key] === g} onClick={() => toggleSel(key, g)} />)}</div></div>
              ))}

              <Sec icon="🧵" title="Fabric" sub="Texture appears on dress" />
              <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 8 }}>{O.mainFabric.map(g => <Pill key={g} label={g} small selected={sel.mainFabric === g} onClick={() => toggleSel("mainFabric", g)} />)}</div>
              <Label>Dupatta</Label><div style={{ display: "flex", flexWrap: "wrap" }}>{O.dupatta.map(g => <Pill key={g} label={g} small selected={sel.dupatta === g} onClick={() => toggleSel("dupatta", g)} />)}</div>

              <Sec icon="🎨" title="Colour and Print" sub="Select mood then pick colour circle on right" />
              <Label>Colour Mood</Label><div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>{O.colorMood.map(g => <Pill key={g} label={g} small selected={sel.colorMood === g} onClick={() => toggleSel("colorMood", g)} />)}</div>
              <Label>Colour Style</Label><div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>{O.colorStyle.map(g => <Pill key={g} label={g} small selected={sel.colorStyle === g} onClick={() => toggleSel("colorStyle", g)} />)}</div>
              <Label>Print / Pattern</Label><div style={{ display: "flex", flexWrap: "wrap" }}>{O.printType.map(g => <Pill key={g} label={g} small selected={sel.printType === g} onClick={() => toggleSel("printType", g)} />)}</div>

              <Sec icon="✨" title="Embellishment" sub="Multi-select - dots appear on dress" />
              <Label>Type (multi-select)</Label><div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>{O.embellishment.map(g => <Pill key={g} label={g} small selected={(sel.embellishment || []).includes(g)} onClick={() => toggleSel("embellishment", g, true)} />)}</div>
              <Label>Placement (multi-select)</Label><div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>{O.embPlacement.map(g => <Pill key={g} label={g} small selected={(sel.embPlacement || []).includes(g)} onClick={() => toggleSel("embPlacement", g, true)} />)}</div>
              <Label>Density</Label><div style={{ display: "flex", flexWrap: "wrap" }}>{O.embDensity.map(g => <Pill key={g} label={g} small selected={sel.embDensity === g} onClick={() => toggleSel("embDensity", g)} />)}</div>

              <Sec icon="🪡" title="Finishing and Production" />
              <Label>Closure</Label><div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>{O.closure.map(g => <Pill key={g} label={g} small selected={sel.closure === g} onClick={() => toggleSel("closure", g)} />)}</div>
              <Label>Pocket</Label><div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>{O.pocket.map(g => <Pill key={g} label={g} small selected={sel.pocket === g} onClick={() => toggleSel("pocket", g)} />)}</div>
              <Label>Quantity</Label><div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>{O.quantity.map(g => <Pill key={g} label={g} small selected={sel.quantity === g} onClick={() => toggleSel("quantity", g)} />)}</div>
              <Label>Size Set</Label><div style={{ display: "flex", flexWrap: "wrap" }}>{O.sizeSet.map(g => <Pill key={g} label={g} small selected={sel.sizeSet === g} onClick={() => toggleSel("sizeSet", g)} />)}</div>

              <div style={{ marginTop: 20, marginBottom: 50, background: "#fff", borderRadius: 12, border: "1px solid " + B.border, padding: 16 }}>
                <div style={{ fontSize: "0.78rem", color: B.muted, marginBottom: 10 }}>{filledSel + " selections — AI fills any blanks"}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={genDesign} disabled={loading === "design" || filledSel < 1} style={{ flex: 2, padding: "12px", background: filledSel < 1 ? B.border : B.gold, color: "#fff", border: "none", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: filledSel < 1 ? "default" : "pointer" }}>
                    {loading === "design" ? "Generating..." : "Generate Tech Pack"}
                  </button>
                  {filledSel > 0 && (
                    <button onClick={saveDesign} style={{ flex: 1, padding: "12px", background: "#fff", color: B.burgundy, border: "1px solid " + B.border, borderRadius: 10, fontSize: "0.82rem", cursor: "pointer" }}>Save</button>
                  )}
                </div>
              </div>
            </div>
            <PreviewPanel />
          </div>
        )}

        {/* REFERENCE */}
        {mod === "reference" && (
          <div style={{ padding: isMobile ? "12px 12px" : "16px 18px", maxWidth: 700, margin: "0 auto" }}>
            <Sec icon="🖼" title="Reference Library" sub="Upload photos or describe — AI extracts design elements" />
            <div onClick={() => fileRef.current && fileRef.current.click()} style={{ border: "2px dashed " + B.border, borderRadius: 12, padding: "24px", textAlign: "center", background: "#fff", cursor: "pointer", marginBottom: 14 }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
              <div style={{ fontSize: "2rem", marginBottom: 6 }}>📸</div>
              <div style={{ fontWeight: 600, color: B.burgundy, fontSize: "0.85rem" }}>{refImg ? "Photo: " + refImg.name : "Click to upload reference photo"}</div>
              <div style={{ fontSize: "0.72rem", color: B.muted, marginTop: 4 }}>Instagram, Pinterest, WhatsApp, Catalogue — any image</div>
            </div>
            {refImg && (
              <div style={{ marginBottom: 14, textAlign: "center" }}>
                <img src={"data:" + refImg.type + ";base64," + refImg.data} alt="ref" style={{ maxWidth: 200, maxHeight: 250, borderRadius: 10, border: "1px solid " + B.border, objectFit: "cover" }} />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              <div>
                <Label>What do you like about this design?</Label>
                <textarea value={refDesc} onChange={e => setRefDesc(e.target.value)} rows={3} placeholder="I love this neckline, the colour is perfect for Onam, the sleeve style is modern..." style={{ width: "100%", padding: "8px 12px", border: "1px solid " + B.border, borderRadius: 8, fontSize: "0.8rem", resize: "vertical", background: "#fff", boxSizing: "border-box" }} />
              </div>
              <div>
                <Label>Links (Instagram, Myntra, Pinterest etc.)</Label>
                <input value={refLinks} onChange={e => setRefLinks(e.target.value)} placeholder="https://instagram.com/..." style={{ width: "100%", padding: "8px 12px", border: "1px solid " + B.border, borderRadius: 8, fontSize: "0.8rem", background: "#fff", boxSizing: "border-box" }} />
              </div>
            </div>
            <button onClick={genRef} disabled={loading === "ref" || (!refDesc && !refLinks && !refImg)} style={{ width: "100%", padding: "12px", background: (!refDesc && !refLinks && !refImg) ? B.border : B.burgundy, color: "#fff", border: "none", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", marginBottom: 14 }}>
              {loading === "ref" ? "Analysing..." : "Analyse with AI"}
            </button>
            <AIResult text={aiRef} />
            {aiRef && (
              <button onClick={() => setMod("design")} style={{ width: "100%", padding: "11px", background: B.gold, color: "#fff", border: "none", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", marginTop: 8 }}>
                Go to Design Studio
              </button>
            )}
          </div>
        )}

        {/* TECH PACK */}
        {mod === "techpack" && (
          <div style={{ padding: isMobile ? "10px 10px" : "16px 18px", maxWidth: 680, margin: "0 auto" }}>
            {(aiDesign || filledSel > 0) ? (
              <div>
                <div style={{ background: "linear-gradient(135deg," + B.burgundy + ",#6b2030)", borderRadius: "12px 12px 0 0", padding: "18px 22px", color: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "0.65rem", color: B.gold, letterSpacing: 2, textTransform: "uppercase" }}>Shades of Pastel</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: 2 }}>Design Tech Pack</div>
                      <div style={{ fontSize: "0.72rem", color: "#e8c8a0", marginTop: 2 }}>Kadammanitta, Pathanamthitta, Kerala</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: B.gold, fontSize: "1rem" }}>{"SOP-" + Math.floor(1000 + Math.random() * 9000)}</div>
                      <div style={{ fontSize: "0.7rem", color: "#e8c8a0", marginTop: 2 }}>{new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                <div style={{ background: "#fff", border: "1px solid " + B.border, borderTop: "none", borderRadius: "0 0 12px 12px", padding: "20px 22px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "160px 1fr", gap: 16, marginBottom: 18 }}>
                    <div style={{ background: B.cream, borderRadius: 10, padding: 8, display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <DressSVG sel={sel} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: B.burgundy, fontSize: "0.85rem", marginBottom: 10, borderBottom: "2px solid " + B.gold, paddingBottom: 4 }}>Design Specifications</div>
                      {[["Garment", sel.garment], ["Fabric", sel.mainFabric], ["Neckline", sel.neckline], ["Sleeve", sel.sleeve], ["Silhouette", sel.silhouette], ["Length", sel.length], ["Slit", sel.slit || "No Slit"], ["Embellishment", (sel.embellishment || []).join(", ") || "None"], ["Closure", sel.closure], ["Dupatta", sel.dupatta]].filter(([,v]) => v).map(([k,v]) => (
                        <div key={k} style={{ display: "flex", gap: 8, paddingBottom: 4, marginBottom: 4, borderBottom: "1px solid " + B.border, fontSize: "0.75rem" }}>
                          <span style={{ color: B.muted, minWidth: 90 }}>{k}</span>
                          <span style={{ color: "#3a3a3a", fontWeight: 500 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {sel.primaryColor && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, color: B.burgundy, fontSize: "0.82rem", marginBottom: 6 }}>Colour Reference</div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 6, background: sel.primaryColor, border: "1px solid " + B.border }} />
                        <div style={{ fontSize: "0.75rem" }}>
                          <div style={{ fontWeight: 600 }}>{"Primary: " + sel.primaryColor}</div>
                          <div style={{ color: B.muted }}>{(sel.colorMood || "") + " " + (sel.colorStyle || "")}</div>
                        </div>
                        {sel.secondaryColor && (
                          <React.Fragment>
                            <div style={{ width: 36, height: 36, borderRadius: 6, background: sel.secondaryColor, border: "1px solid " + B.border }} />
                            <div style={{ fontSize: "0.75rem" }}><div style={{ fontWeight: 600 }}>{"Secondary: " + sel.secondaryColor}</div></div>
                          </React.Fragment>
                        )}
                      </div>
                    </div>
                  )}
                  {(prof.name || size || bodyType) && (
                    <div style={{ background: B.cream, borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, color: B.burgundy, fontSize: "0.8rem", marginBottom: 6 }}>Customer Profile</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: "0.74rem" }}>
                        {prof.name && <div><span style={{ color: B.muted }}>Name: </span>{prof.name}</div>}
                        {size && <div><span style={{ color: B.muted }}>Size: </span><b>{size}</b></div>}
                        {bodyType && <div><span style={{ color: B.muted }}>Body: </span>{bodyType}</div>}
                        {sel.occasion && <div><span style={{ color: B.muted }}>Occasion: </span>{sel.occasion}</div>}
                        {sel.budget && <div><span style={{ color: B.muted }}>Budget: </span>{sel.budget}</div>}
                      </div>
                    </div>
                  )}
                  {aiDesign && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, color: B.burgundy, fontSize: "0.82rem", marginBottom: 6, borderBottom: "1px solid " + B.border, paddingBottom: 4 }}>AI Recommendations</div>
                      <AIResult text={aiDesign} />
                    </div>
                  )}
                  {aiBody && (
                    <InfoCard type="blue">
                      <div style={{ fontWeight: 700, fontSize: "0.78rem", color: B.blue, marginBottom: 4 }}>Body Analysis and Tailor Measurements</div>
                      <div style={{ fontSize: "0.74rem", color: "#3a3a3a", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{aiBody.split("##").find(s => s.includes("TAILOR")) || ""}</div>
                    </InfoCard>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                    <div style={{ background: B.cream, borderRadius: 8, padding: "8px 12px", fontSize: "0.74rem" }}>
                      <div style={{ color: B.muted, marginBottom: 2 }}>Production Qty</div>
                      <div style={{ fontWeight: 700, color: B.burgundy }}>{sel.quantity || "Not specified"}</div>
                    </div>
                    <div style={{ background: B.cream, borderRadius: 8, padding: "8px 12px", fontSize: "0.74rem" }}>
                      <div style={{ color: B.muted, marginBottom: 2 }}>Size Set</div>
                      <div style={{ fontWeight: 700, color: B.burgundy }}>{sel.sizeSet || "Not specified"}</div>
                    </div>
                  </div>
                  <button onClick={() => window.print()} style={{ width: "100%", padding: "12px", background: B.gold, color: "#fff", border: "none", borderRadius: 10, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer" }}>
                    Print Tech Pack / Save as PDF
                  </button>
                  <div style={{ textAlign: "center", fontSize: "0.7rem", color: B.muted, marginTop: 8 }}>Browser Print then Save as PDF to export and share with stitching vendor</div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "48px 20px", color: B.muted }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📄</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>No design yet</div>
                <div style={{ fontSize: "0.8rem", marginBottom: 16 }}>Go to Design tab, make selections, and click Generate</div>
                <button onClick={() => setMod("design")} style={{ background: B.burgundy, color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
                  Go to Design Studio
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
