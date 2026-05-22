import { useState, useRef, useEffect, useCallback } from "react";

// ─── Shoe guide renderer ──────────────────────────────────────────────────────
const drawShoeGuide = (ctx, w, h) => {
  // Clean canvas — just a subtle corner label to orient the user
  ctx.save();
  ctx.font = "10px monospace";
  ctx.fillStyle = "rgba(255,100,20,0.25)";
  ctx.fillText("DRAW YOUR CONCEPT", 16, h - 14);
  ctx.restore();
};

// ─── Shoe silhouette SVG for result preview ──────────────────────────────────
const ShoeSVG = ({ colors = ["#ff4d00", "#1a1a1a", "#f5f4f0"] }) => (
  <svg viewBox="0 0 580 290" style={{ width: "100%", height: "100%" }}>
    <defs>
      <linearGradient id="upperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={colors[0]} stopOpacity="0.95" />
        <stop offset="70%" stopColor={colors[0]} stopOpacity="0.8" />
        <stop offset="100%" stopColor={colors[1]} stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id="midsoleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors[2]} stopOpacity="0.55" />
        <stop offset="100%" stopColor={colors[1]} stopOpacity="0.85" />
      </linearGradient>
      <linearGradient id="outsoleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={colors[1]} />
        <stop offset="100%" stopColor={colors[1]} stopOpacity="0.7" />
      </linearGradient>
      <filter id="swooshGlow" x="-20%" y="-60%" width="140%" height="220%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="shoeShadow" x="-5%" y="-5%" width="115%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor={colors[1]} floodOpacity="0.5"/>
      </filter>
    </defs>

    {/* Ground shadow */}
    <ellipse cx="295" cy="272" rx="215" ry="11" fill={colors[1]} fillOpacity="0.2"/>

    {/* Outsole */}
    <path d="M 65,236 C 160,250 370,250 492,237 C 512,233 522,224 520,212 C 518,202 506,197 490,198 L 72,202 C 54,200 46,210 48,222 C 50,232 58,236 65,236 Z"
      fill={colors[1]}/>

    {/* Midsole */}
    <path d="M 72,202 L 490,198 C 508,182 512,166 506,150 L 72,162 C 58,164 50,172 50,182 C 50,192 60,200 72,202 Z"
      fill="url(#midsoleGrad)"/>

    {/* Air unit bubble */}
    <ellipse cx="148" cy="200" rx="52" ry="11" fill={colors[2]} fillOpacity="0.2"
      stroke={colors[2]} strokeWidth="1.5" strokeOpacity="0.5"/>

    {/* Main upper body */}
    <path d="
      M 80,108
      C 64,100 56,112 58,136
      C 60,156 64,172 68,186
      L 506,150
      C 510,132 508,116 498,104
      C 484,90 462,82 432,78
      C 378,68 308,62 248,64
      C 208,63 182,67 168,72
      C 148,78 126,86 104,96
      C 94,100 84,108 80,108 Z"
      fill="url(#upperGrad)" filter="url(#shoeShadow)"/>

    {/* Collar cutout (ankle opening) */}
    <path d="
      M 80,108
      C 86,90 100,80 120,80
      C 140,80 150,92 145,108
      C 138,118 118,122 98,116
      C 86,112 78,110 80,108 Z"
      fill={colors[1]} fillOpacity="0.75"/>

    {/* Tongue */}
    <path d="
      M 120,80 C 142,68 172,62 192,66
      C 204,70 208,78 198,86
      C 182,92 154,94 130,90
      C 122,88 116,84 120,80 Z"
      fill={colors[0]} fillOpacity="0.55"/>

    {/* Lace row */}
    <line x1="132" y1="84" x2="165" y2="78" stroke={colors[2]} strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="158" y1="76" x2="195" y2="70" stroke={colors[2]} strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="185" y1="68" x2="222" y2="66" stroke={colors[2]} strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round"/>

    {/* Swoosh */}
    <path d="M 175,130 C 235,104 330,98 418,118 C 362,124 275,134 175,130 Z"
      fill={colors[2]} fillOpacity="0.9" filter="url(#swooshGlow)"/>

    {/* Toe box highlight */}
    <path d="M 450,76 C 480,86 502,100 508,118 C 492,104 468,88 450,76 Z"
      fill={colors[2]} fillOpacity="0.14"/>

    {/* Heel tab */}
    <rect x="56" y="98" width="10" height="22" rx="3"
      fill={colors[2]} fillOpacity="0.4"/>

    {/* Outline */}
    <path d="
      M 80,108
      C 64,100 56,112 58,136 C 60,156 64,172 68,186
      L 506,150
      C 510,132 508,116 498,104 C 484,90 462,82 432,78
      C 378,68 308,62 248,64 C 208,63 182,67 168,72
      C 148,78 126,86 104,96 C 94,100 84,108 80,108 Z"
      fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2"/>
  </svg>
);

// ─── Colour palette ────────────────────────────────────────────────────────────
const PALETTE = [
  "#ff4d00","#ffffff","#0a0a0a","#1a1a2e","#e63946",
  "#457b9d","#2a9d8f","#e9c46a","#f4a261","#264653",
  "#9b5de5","#0077b6","#90e0ef","#d62828","#606c38",
  "#f72585","#4cc9f0","#4361ee","#7209b7","#b5e48c",
];

// ─── Main component ────────────────────────────────────────────────────────────
export default function DesignStudio() {
  const [tab, setTab] = useState("upload");
  const [uploaded, setUploaded] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [color, setColor] = useState("#ff4d00");
  const [brush, setBrush] = useState(10);
  const [tool, setTool] = useState("brush");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [err, setErr] = useState(null);
  const [showPalette, setShowPalette] = useState(false);

  const cvs = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const fileRef = useRef(null);

  // font injection
  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Mono:wght@400;500&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
  }, []);

  // init canvas
  useEffect(() => {
    if (tab === "draw" && cvs.current) {
      const c = cvs.current;
      const ctx = c.getContext("2d");
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, c.width, c.height);
      drawShoeGuide(ctx, c.width, c.height);
      setHasDrawn(false);
      setResult(null);
    }
  }, [tab]);

  const getXY = (e, c) => {
    const r = c.getBoundingClientRect();
    const sx = c.width / r.width, sy = c.height / r.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - r.left) * sx, y: (src.clientY - r.top) * sy };
  };

  const onDown = useCallback((e) => {
    if (tab !== "draw") return;
    e.preventDefault();
    drawing.current = true;
    last.current = getXY(e, cvs.current);
    setHasDrawn(true);
  }, [tab]);

  const onMove = useCallback((e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const c = cvs.current;
    const ctx = c.getContext("2d");
    const pos = getXY(e, c);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(pos.x, pos.y);
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = brush * 2.5;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = brush;
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    last.current = pos;
  }, [tool, color, brush]);

  const onUp = useCallback(() => { drawing.current = false; last.current = null; }, []);

  const clear = () => {
    const c = cvs.current;
    const ctx = c.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, c.width, c.height);
    drawShoeGuide(ctx, c.width, c.height);
    setHasDrawn(false);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) {
      const r = new FileReader();
      r.onload = ev => setUploaded(ev.target.result);
      r.readAsDataURL(f);
    }
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setUploaded(ev.target.result);
    r.readAsDataURL(f);
  };

  const [genStep, setGenStep] = useState(""); // tracks current generation step

  const generate = async () => {
    setGenerating(true); setErr(null); setGenStep("Interpreting your design…");
    try {
      // ── Step 1: Claude interprets the design ──────────────────────────────
      let messages = [];
      const jsonInstr = `Return ONLY valid JSON — no markdown, no preamble:
{"name":"creative shoe name","tagline":"punchy tagline max 7 words","colorway":["#hex1","#hex2","#hex3"],"upper":"upper design description 1-2 sentences","sole":"sole design 1 sentence","tongue":"tongue and laces 1 sentence","style":"Runner|Court|Lifestyle|Performance","materials":"3D print texture recommendation","inspiration":"1 sentence on design inspiration","refinements":["idea 1","idea 2","idea 3"],"imagePrompt":"A detailed Ideogram image generation prompt for this exact sneaker — side profile, product photography style, specific materials, textures, colorway, clean white background, studio lighting, highly detailed. Max 80 words."}`;

      if (tab === "upload" && uploaded) {
        const [meta, b64] = uploaded.split(",");
        const mt = meta.match(/:(.*?);/)[1];
        messages = [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: mt, data: b64 } },
          { type: "text", text: `You are a Nike × Zellerfeld sneaker design AI. Interpret this image as a custom 3D-printed Air Max sneaker.${prompt ? ` Designer notes: ${prompt}` : ""}\n\n${jsonInstr}` }
        ]}];
      } else if (tab === "draw" && cvs.current) {
        const b64 = cvs.current.toDataURL("image/png").split(",")[1];
        messages = [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: b64 } },
          { type: "text", text: `You are a Nike × Zellerfeld sneaker design AI. The user drew a sneaker concept. Interpret their design.${prompt ? ` Designer notes: ${prompt}` : ""}\n\n${jsonInstr}` }
        ]}];
      } else if (prompt) {
        messages = [{ role: "user", content: `You are a Nike × Zellerfeld sneaker design AI. Create a custom 3D-printed Air Max concept from: "${prompt}"\n\n${jsonInstr}` }];
      }

      const res = await fetch("/.netlify/functions/interpret-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages })
      });
      const data = await res.json();
      const txt = data.content?.find(b => b.type === "text")?.text || "";
      const clean = txt.replace(/```json|```/g, "").trim();
      const concept = JSON.parse(clean);

      // ── Step 2: Ideogram generates the image ──────────────────────────────
      setGenStep("Rendering shoe with AI…");
      const imgPrompt = concept.imagePrompt ||
        `Side profile Nike Air Max sneaker, ${concept.upper}, ${concept.colorway?.join(", ")} colorway, ${concept.materials}, product photography, clean white background, studio lighting, highly detailed`;

      try {
        const imgRes = await fetch("/.netlify/functions/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prompt: imgPrompt })
        });
        const imgData = await imgRes.json();
        concept.generatedImage = imgData?.data?.[0]?.url || null;
      } catch (imgErr) {
        // Image generation failed — continue without it
        concept.generatedImage = null;
      }

      setResult(concept);
    } catch (e) {
      setErr("Generation failed. Add a text description and try again.");
      console.error(e);
    }
    setGenerating(false);
    setGenStep("");
  };

  const canGen = (tab === "upload" && uploaded) || (tab === "draw" && hasDrawn) || prompt.length > 2;

  const s = {
    root: { background:"#111214", minHeight:"100vh", color:"#f5f4f0", fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", userSelect:"none" },
    header: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #2a2a2e", background:"#16171a" },
    logo: { fontFamily:"'Bebas Neue',sans-serif", fontSize:"22px", letterSpacing:"0.05em", color:"#f5f4f0", display:"flex", alignItems:"center", gap:"8px" },
    logoX: { color:"#ff4d00" },
    badge: { fontFamily:"'DM Mono',monospace", fontSize:"9px", letterSpacing:"0.15em", color:"#ff6a20", background:"rgba(255,77,0,0.18)", padding:"3px 8px", borderRadius:"2px", textTransform:"uppercase" },
    tabs: { display:"flex", background:"#1e1f23", borderRadius:"4px", padding:"3px", gap:"2px" },
    tab: (active) => ({ padding:"6px 16px", borderRadius:"3px", fontSize:"12px", fontWeight:"500", letterSpacing:"0.05em", cursor:"pointer", transition:"all 0.2s", background: active?"#ff4d00":"transparent", color: active?"#000":"#999", border:"none", fontFamily:"'DM Sans',sans-serif" }),
    main: { flex:1, display:"flex", overflow:"hidden", height:"calc(100vh - 57px)" },
    // left panel
    left: { flex:"1 1 55%", display:"flex", flexDirection:"column", borderRight:"1px solid #2a2a2e", overflow:"hidden" },
    toolbar: { display:"flex", alignItems:"center", gap:"8px", padding:"10px 16px", borderBottom:"1px solid #2a2a2e", background:"#16171a" },
    toolBtn: (active) => ({ width:"32px", height:"32px", borderRadius:"4px", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", background: active?"rgba(255,77,0,0.25)":"rgba(255,255,255,0.04)", color: active?"#ff6a20":"#888", transition:"all 0.15s", fontSize:"14px" }),
    divider: { width:"1px", height:"20px", background:"#2e2e32", margin:"0 2px" },
    colorDot: { width:"22px", height:"22px", borderRadius:"50%", border:"2px solid rgba(255,255,255,0.25)", cursor:"pointer", transition:"transform 0.15s", flexShrink:0 },
    brushSlider: { WebkitAppearance:"none", appearance:"none", width:"80px", height:"3px", background:"#3a3a3e", borderRadius:"2px", outline:"none", cursor:"pointer" },
    canvasWrap: { flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", position:"relative", overflow:"hidden", background:"#16171a" },
    canvas: { background:"#1c1d21", borderRadius:"6px", cursor: tool==="eraser"?"cell":"crosshair", maxWidth:"100%", maxHeight:"100%", border:"1px solid #2e2e36", boxShadow:"0 4px 24px rgba(0,0,0,0.4)" },
    // upload zone
    uploadZone: (drag) => ({ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", margin:"16px", border:`1.5px dashed ${drag?"#ff4d00":"#363640"}`, borderRadius:"8px", cursor:"pointer", transition:"all 0.2s", background: drag?"rgba(255,77,0,0.06)":"rgba(255,255,255,0.02)", position:"relative", overflow:"hidden" }),
    uploadImg: { width:"100%", height:"100%", objectFit:"contain", borderRadius:"8px" },
    uploadOverlay: { position:"absolute", inset:0, background:"rgba(0,0,0,0.65)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity 0.2s" },
    // prompt bar
    promptBar: { display:"flex", gap:"10px", padding:"12px 16px", borderTop:"1px solid #2a2a2e", background:"#16171a" },
    promptInput: { flex:1, background:"#1e1f23", border:"1px solid #363640", borderRadius:"4px", padding:"9px 14px", color:"#f0efe9", fontSize:"13px", outline:"none", fontFamily:"'DM Sans',sans-serif" },
    genBtn: (can) => ({ padding:"9px 20px", background: can?"#ff4d00":"#222226", color: can?"#000":"#555", border:"none", borderRadius:"4px", fontSize:"12px", fontWeight:"600", letterSpacing:"0.08em", fontFamily:"'DM Mono',monospace", cursor: can?"pointer":"not-allowed", transition:"all 0.2s", textTransform:"uppercase", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:"6px" }),
    // right panel
    right: { flex:"1 1 42%", display:"flex", flexDirection:"column", overflow:"hidden", background:"#131417" },
    rightHeader: { padding:"14px 20px", borderBottom:"1px solid #2a2a2e", fontFamily:"'DM Mono',monospace", fontSize:"10px", letterSpacing:"0.15em", color:"#666", textTransform:"uppercase" },
    rightBody: { flex:1, overflowY:"auto", padding:"20px" },
    emptyState: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color:"#444", textAlign:"center", gap:"12px" },
    // result styles
    designName: { fontFamily:"'Bebas Neue',sans-serif", fontSize:"36px", letterSpacing:"0.03em", lineHeight:1, color:"#f5f4f0", marginBottom:"4px" },
    tagline: { fontSize:"12px", color:"#888", fontStyle:"italic", marginBottom:"20px" },
    previewBox: { height:"160px", borderRadius:"6px", marginBottom:"20px", background:"#1c1d21", border:"1px solid #2e2e36", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", padding:"12px" },
    swatches: { display:"flex", gap:"6px", marginBottom:"20px" },
    swatch: (c) => ({ width:"28px", height:"28px", borderRadius:"50%", background:c, border:"2px solid rgba(255,255,255,0.15)", flexShrink:0 }),
    label: { fontFamily:"'DM Mono',monospace", fontSize:"9px", letterSpacing:"0.15em", color:"#ff6a20", textTransform:"uppercase", marginBottom:"5px", marginTop:"14px" },
    value: { fontSize:"13px", color:"#c8c7c1", lineHeight:"1.6" },
    tags: { display:"flex", gap:"6px", flexWrap:"wrap", marginTop:"6px" },
    tag: { fontSize:"10px", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", color:"#aaa", background:"#1e1f23", border:"1px solid #363640", padding:"3px 8px", borderRadius:"2px" },
    rfmt: (i) => ({ fontSize:"12px", color:"#aaa", padding:"8px 12px", borderRadius:"4px", border:"1px solid #2a2a2e", background:"#1a1b1f", cursor:"pointer", lineHeight:"1.5", transition:"all 0.15s", marginBottom:"6px" }),
    actions: { display:"flex", gap:"8px", marginTop:"20px", paddingTop:"16px", borderTop:"1px solid #2a2a2e" },
    actBtn: (primary) => ({ flex:1, padding:"10px", borderRadius:"4px", border: primary?"none":"1px solid #363640", background: primary?"#ff4d00":"transparent", color: primary?"#000":"#aaa", fontSize:"11px", fontWeight:"600", letterSpacing:"0.1em", fontFamily:"'DM Mono',monospace", cursor:"pointer", textTransform:"uppercase", transition:"all 0.2s" }),
    // palette popup
    palette: { position:"absolute", bottom:"48px", left:"60px", background:"#1e1f23", border:"1px solid #363640", borderRadius:"6px", padding:"10px", display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"6px", zIndex:100, boxShadow:"0 8px 32px rgba(0,0,0,0.7)" },
    palSwatch: (c) => ({ width:"24px", height:"24px", borderRadius:"50%", background:c, cursor:"pointer", border:"2px solid transparent", transition:"all 0.15s" }),
    errBox: { background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.35)", color:"#f87171", fontSize:"12px", padding:"10px 14px", borderRadius:"4px", marginBottom:"12px" },
    loadBox: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:"16px" },
  };

  // Spinning loader
  const Spinner = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" style={{animation:"spin 1s linear infinite"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="16" cy="16" r="12" fill="none" stroke="#1e1e1e" strokeWidth="2.5"/>
      <path d="M16 4 A12 12 0 0 1 28 16" fill="none" stroke="#ff4d00" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div style={s.root}>
      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.logo}>
          NIKE <span style={s.logoX}>×</span> ZELLERFELD
          <span style={s.badge}>Design Studio</span>
        </div>
        <div style={s.tabs}>
          <button style={s.tab(tab==="upload")} onClick={() => setTab("upload")}>↑ Upload</button>
          <button style={s.tab(tab==="draw")} onClick={() => setTab("draw")}>✏ Draw</button>
        </div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"10px", color:"#666", letterSpacing:"0.12em" }}>
          AIR MAX PLATFORM · v1
        </div>
      </header>

      <div style={s.main}>
        {/* ── Left Panel ── */}
        <div style={s.left}>
          {/* toolbar (draw only) */}
          {tab === "draw" && (
            <div style={s.toolbar}>
              <button title="Brush" style={s.toolBtn(tool==="brush")} onClick={() => setTool("brush")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 17l4-4 10-10 3 3L10 16 7 19z"/><path d="M7 17c0 1.7-1.3 3-3 3"/></svg>
              </button>
              <button title="Eraser" style={s.toolBtn(tool==="eraser")} onClick={() => setTool("eraser")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 20H7L3 16l13-13 4 4z"/><path d="M6 17l5-5"/></svg>
              </button>
              <div style={s.divider} />
              {/* color */}
              <div style={{ position:"relative" }}>
                <div
                  style={{ ...s.colorDot, background: color, borderColor: color==="#ffffff"?"#555":"rgba(255,255,255,0.2)" }}
                  onClick={() => setShowPalette(p => !p)}
                  title="Color"
                />
                {showPalette && (
                  <div style={s.palette}>
                    {PALETTE.map(c => (
                      <div key={c} style={{ ...s.palSwatch(c), borderColor: c===color?"white":"transparent" }}
                        onClick={() => { setColor(c); setTool("brush"); setShowPalette(false); }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div style={s.divider} />
              {/* brush size */}
              <svg width="12" height="12" viewBox="0 0 12 12" style={{color:"#444"}}><circle cx="6" cy="6" r="3" fill="currentColor"/></svg>
              <input type="range" min="2" max="28" value={brush} onChange={e => setBrush(+e.target.value)} style={s.brushSlider} title="Brush size" />
              <svg width="16" height="16" viewBox="0 0 16 16" style={{color:"#444"}}><circle cx="8" cy="8" r="5" fill="currentColor"/></svg>
              <div style={s.divider} />
              <button title="Clear" style={s.toolBtn(false)} onClick={clear}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.92"/></svg>
              </button>
            </div>
          )}

          {/* canvas / upload */}
          {tab === "draw" ? (
            <div style={s.canvasWrap} onClick={() => setShowPalette(false)}>
              <canvas
                ref={cvs}
                width={580} height={300}
                style={s.canvas}
                onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
                onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
              />
            </div>
          ) : (
            <div
              style={s.uploadZone(dragging)}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => !uploaded && fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile} />
              {uploaded ? (
                <>
                  <img src={uploaded} alt="sketch" style={s.uploadImg} />
                  <div
                    style={s.uploadOverlay}
                    className="upload-hover"
                    onMouseEnter={e => e.currentTarget.style.opacity=1}
                    onMouseLeave={e => e.currentTarget.style.opacity=0}
                  >
                    <div style={{fontSize:"12px",color:"#fff",letterSpacing:"0.1em",fontFamily:"'DM Mono',monospace"}}>CHANGE IMAGE</div>
                    <button
                      style={{...s.actBtn(false), flex:"none", marginTop:"8px", padding:"6px 16px"}}
                      onClick={e => { e.stopPropagation(); setUploaded(null); setResult(null); }}
                    >Remove</button>
                  </div>
                </>
              ) : (
                <div style={{textAlign:"center", pointerEvents:"none"}}>
                  <div style={{fontSize:"32px", marginBottom:"12px", opacity:0.3}}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff4d00" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <div style={{fontSize:"13px", color:"#888", fontWeight:"500", marginBottom:"6px"}}>Drop your sketch here</div>
                  <div style={{fontSize:"11px", color:"#555", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em"}}>PNG · JPG · WEBP · SVG</div>
                  <div style={{marginTop:"16px", padding:"7px 18px", background:"rgba(255,77,0,0.08)", border:"1px solid rgba(255,77,0,0.2)", borderRadius:"3px", fontSize:"11px", color:"#ff4d00", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", display:"inline-block"}}>
                    SELECT FILE
                  </div>
                </div>
              )}
            </div>
          )}

          {/* prompt bar */}
          <div style={s.promptBar}>
            <input
              style={s.promptInput}
              placeholder="Describe your design or add direction… (e.g. Tokyo street culture, orange and black, aggressive sole)"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key==="Enter" && canGen && !generating && generate()}
            />
            <button style={s.genBtn(canGen && !generating)} onClick={generate} disabled={!canGen || generating}>
              {generating ? <Spinner /> : <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Generate
              </>}
            </button>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div style={s.right}>
          <div style={s.rightHeader}>AI Design Output</div>
          <div style={s.rightBody}>
            {err && <div style={s.errBox}>{err}</div>}

            {generating ? (
              <div style={s.loadBox}>
                <Spinner />
                <div style={{fontFamily:"'DM Mono',monospace", fontSize:"11px", color:"#666", letterSpacing:"0.12em", textAlign:"center", lineHeight:"2"}}>
                  <span style={{color: genStep.includes("Render") ? "#ff6a20" : "#555"}}>STEP 1 — INTERPRET DESIGN</span><br/>
                  <span style={{color: genStep.includes("Render") ? "#ff6a20" : "#444"}}>STEP 2 — RENDER SHOE IMAGE</span>
                </div>
                <div style={{fontSize:"12px", color:"#ff6a20", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em"}}>{genStep}</div>
              </div>
            ) : result ? (
              <>
                <div style={s.designName}>{result.name}</div>
                <div style={s.tagline}>"{result.tagline}"</div>

                {/* shoe preview — real image or fallback */}
                <div style={s.previewBox}>
                  {result.generatedImage ? (
                    <img
                      src={result.generatedImage}
                      alt={result.name}
                      style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:"4px" }}
                    />
                  ) : (
                    <div style={{textAlign:"center", color:"#444", fontSize:"11px", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em"}}>
                      IMAGE UNAVAILABLE<br/>
                      <span style={{fontSize:"10px", color:"#333"}}>Add credits to ideogram.ai to enable renders</span>
                    </div>
                  )}
                </div>

                {/* swatches */}
                <div style={s.swatches}>
                  {(result.colorway || []).map((c, i) => (
                    <div key={i} style={{display:"flex", flexDirection:"column", alignItems:"center", gap:"4px"}}>
                      <div style={s.swatch(c)} title={c} />
                      <span style={{fontFamily:"'DM Mono',monospace", fontSize:"8px", color:"#444"}}>{c}</span>
                    </div>
                  ))}
                </div>

                {/* tags */}
                <div style={s.tags}>
                  {result.style && <span style={s.tag}>{result.style}</span>}
                  {result.materials && <span style={s.tag}>{result.materials}</span>}
                </div>

                <div style={s.label}>Upper</div>
                <div style={s.value}>{result.upper}</div>
                <div style={s.label}>Sole</div>
                <div style={s.value}>{result.sole}</div>
                <div style={s.label}>Tongue & Laces</div>
                <div style={s.value}>{result.tongue}</div>
                <div style={s.label}>Inspiration</div>
                <div style={s.value}>{result.inspiration}</div>

                {result.refinements?.length > 0 && (
                  <>
                    <div style={s.label}>Refinement Ideas</div>
                    {result.refinements.map((r, i) => (
                      <div key={i} style={s.rfmt(i)}
                        onClick={() => setPrompt(r)}
                        onMouseEnter={e => e.currentTarget.style.borderColor="#ff4d00"}
                        onMouseLeave={e => e.currentTarget.style.borderColor="#1e1e1e"}
                      >
                        <span style={{color:"#ff4d00", marginRight:"6px", fontFamily:"'DM Mono',monospace", fontSize:"9px"}}>→</span>
                        {r}
                      </div>
                    ))}
                  </>
                )}

                <div style={s.actions}>
                  <button style={s.actBtn(false)}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{marginRight:"5px",verticalAlign:"middle"}}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                    Save
                  </button>
                  <button style={s.actBtn(false)}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{marginRight:"5px",verticalAlign:"middle"}}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Share
                  </button>
                  <button style={s.actBtn(true)}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{marginRight:"5px",verticalAlign:"middle"}}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.97-1.67L23 6H6"/></svg>
                    Order
                  </button>
                </div>
              </>
            ) : (
              <div style={s.emptyState}>
                <div style={{fontSize:"48px", opacity:"0.06"}}>
                  <svg width="64" height="64" viewBox="0 0 580 300"><path d="M88,248 C62,248 52,265 68,282 C155,298 355,302 462,290 C504,283 518,270 514,250 C512,228 495,214 468,210 C418,196 348,186 286,182 C258,180 238,178 218,183 C178,190 146,202 118,218 C98,228 88,238 88,248 Z" fill="#ff4d00"/></svg>
                </div>
                <div style={{fontFamily:"'DM Mono',monospace", fontSize:"11px", letterSpacing:"0.12em", color:"#333", lineHeight:"2", textAlign:"center"}}>
                  {tab === "upload" ? "UPLOAD A SKETCH" : "DRAW YOUR CONCEPT"}<br/>
                  THEN HIT GENERATE
                </div>
                <div style={{fontSize:"11px", color:"#555", maxWidth:"200px", textAlign:"center", lineHeight:"1.7"}}>
                  Or just type a description in the prompt bar below
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
