import { useState } from "react";

// ── CONFIG ───────────────────────────────────────────────────────────────────
const COMERCIALES = [
  { documento: "1234567890", nombre: "Fabian Rojas",    correo: "fabian@dapper.com" },
  { documento: "9876543210", nombre: "Gerardo Vilchis", correo: "gerardo@dapper.com" },
  { documento: "5555555555", nombre: "Otro Comercial",  correo: "otro@dapper.com" },
];
const PAQUETES = {
  Standard:     { precio: 300, usuarios: 3 },
  Professional: { precio: 500, usuarios: 5 },
};
const PERIODOS = Array.from({length: 12}, (_, i) => i + 1);
const WEBHOOK_URL = "https://dapperglobal.app.n8n.cloud/webhook/07820e6a-52b9-4978-be46-4cfa3c8300fe";
const MAX_MB = 10;

// ── BRAND TOKENS ─────────────────────────────────────────────────────────────
const C = {
  purple:    "#5723F5",
  purpleLight:"#7861db",
  purpleDark: "#3A17A3",
  green:     "#84CC16",
  sky:       "#0EA5E9",
  slate:     "#64748B",
  slateLight:"#CBD5E1",
  white:     "#FFFFFF",
  bg:        "#F8F7FF",
  cardBg:    "#FFFFFF",
  err:       "#F52B2B",
  ok:        "#84CC16",
};

const font = "'Segoe UI', system-ui, sans-serif";

// ── HELPERS ──────────────────────────────────────────────────────────────────
const fmtUSD = n => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`;

function validarNIT(nit) {
  return /^\d{3}\.\d{3}\.\d{3}-\d$/.test(nit);
}
function formatNIT(val) {
  const d = val.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}
async function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ── LOGO SVG ─────────────────────────────────────────────────────────────────
function DapperLogo({ size = 36, dark = false }) {
  const col = dark ? C.white : C.purple;
  return (
    <svg width={size * 2.8} height={size} viewBox="0 0 112 40" fill="none">
      <text x="0" y="31" fontSize="30" fontWeight="800" fontFamily="'Segoe UI',sans-serif" fill={col} letterSpacing="-0.5">Dapper</text>
    </svg>
  );
}

// ── BASE INPUT STYLE ─────────────────────────────────────────────────────────
const inputBase = {
  width: "100%", padding: "10px 14px", border: `1.5px solid ${C.slateLight}`,
  borderRadius: 8, fontSize: 14, fontFamily: font, outline: "none",
  color: "#1a1a2e", background: C.white, boxSizing: "border-box", transition: "border .2s",
};

// ── STEP INDICATOR ───────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ["Auth", "Datos", "Confirmar", "Resultado"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
      {steps.map((s, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: done || active ? C.purple : C.slateLight,
                color: done || active ? C.white : C.slate,
                fontSize: 12, fontWeight: 700,
              }}>
                {done ? "✓" : idx}
              </div>
              <span style={{ fontSize: 10, color: active ? C.purple : C.slate, fontWeight: active ? 700 : 400, whiteSpace: "nowrap" }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? C.purple : C.slateLight, margin: "0 4px", marginBottom: 18 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── SECTION TITLE ────────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "24px 0 14px" }}>
      <div style={{ width: 4, height: 18, background: C.purple, borderRadius: 2 }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: "uppercase", letterSpacing: 1.2 }}>{children}</span>
    </div>
  );
}

// ── FIELD ────────────────────────────────────────────────────────────────────
function Field({ label, fkey, type = "text", form, setField, errors, touched, setTouched, children, placeholder = "" }) {
  const err = touched[fkey] && errors[fkey];
  const ok  = touched[fkey] && !errors[fkey] && form[fkey];
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate, marginBottom: 5, textTransform: "uppercase", letterSpacing: .5 }}>{label}</label>
      {children || (
        <input
          type={type} value={form[fkey]} placeholder={placeholder}
          style={{ ...inputBase, borderColor: err ? C.err : ok ? C.ok : C.slateLight }}
          onChange={e => fkey === "nit" ? setField("nit", formatNIT(e.target.value)) : setField(fkey, e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, [fkey]: true }))}
        />
      )}
      {err && <div style={{ color: C.err, fontSize: 11, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>⚠ {err}</div>}
    </div>
  );
}

// ── FILE FIELD ───────────────────────────────────────────────────────────────
function FileField({ label, fkey, files, setFiles, errors, touched, setTouched }) {
  const f = files[fkey];
  const err = touched[fkey] && errors[fkey];
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate, marginBottom: 5, textTransform: "uppercase", letterSpacing: .5 }}>{label}</label>
      <label style={{
        display: "block", border: `2px dashed ${f ? C.ok : C.slateLight}`,
        borderRadius: 8, padding: "14px 16px", cursor: "pointer", textAlign: "center",
        fontSize: 13, color: f ? C.ok : C.slate,
        background: f ? "#f0fdf4" : C.bg, transition: "all .2s",
      }}
        onMouseEnter={e => { if (!f) e.currentTarget.style.borderColor = C.purple; }}
        onMouseLeave={e => { if (!f) e.currentTarget.style.borderColor = C.slateLight; }}
      >
        {f ? `✓ ${f.name}` : "Haz clic para subir · PDF, JPG, PNG · máx 10MB"}
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }}
          onChange={e => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > MAX_MB * 1024 * 1024) { alert(`El archivo supera los ${MAX_MB}MB`); return; }
            setFiles(fs => ({ ...fs, [fkey]: file }));
            setTouched(t => ({ ...t, [fkey]: true }));
          }}
        />
      </label>
      {err && <div style={{ color: C.err, fontSize: 11, marginTop: 4 }}>⚠ {err}</div>}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [fase, setFase] = useState(1);
  const [comercial, setComercial] = useState(null);
  const [docInput, setDocInput] = useState("");
  const [docError, setDocError] = useState("");
  const [form, setFormState] = useState({
    razon_social:"", nit:"", representante_legal:"", correo:"", direccion:"",
    paquete:"", periodos:"", descuento:"0", fecha_inicio:"", fecha_termino:"", observaciones:"",
  });
  const [files, setFiles] = useState({ rut: null, cedula: null, camara: null });
  const [touched, setTouched] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  function setField(k, v) {
    setFormState(f => ({ ...f, [k]: v }));
    setTouched(t => ({ ...t, [k]: true }));
  }

  function handleAuth() {
    const found = COMERCIALES.find(c => c.documento === docInput.trim());
    if (found) { setComercial(found); setDocError(""); setFase(2); }
    else setDocError("Documento no autorizado. Verifica el número ingresado.");
  }

  const precio = form.paquete ? PAQUETES[form.paquete].precio : 0;
  const meses  = parseInt(form.periodos) || 0;
  const desc   = Math.min(100, Math.max(0, parseFloat(form.descuento) || 0));
  const subtotal  = precio * meses;
  const descMonto = subtotal * desc / 100;
  const total     = subtotal - descMonto;

  const errors = {
    razon_social: !form.razon_social ? "Campo obligatorio" : "",
    nit: !validarNIT(form.nit) ? "Formato: XXX.XXX.XXX-X (9 dígitos + verificación)" : "",
    representante_legal: !form.representante_legal ? "Campo obligatorio" : "",
    correo: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo) ? "Correo inválido" : "",
    direccion: !form.direccion ? "Campo obligatorio" : "",
    paquete: !form.paquete ? "Selecciona un paquete" : "",
    periodos: !form.periodos ? "Selecciona los periodos" : "",
    fecha_inicio: !form.fecha_inicio ? "Campo obligatorio" : "",
    fecha_termino: !form.fecha_termino ? "Campo obligatorio"
      : form.fecha_inicio && form.fecha_termino <= form.fecha_inicio ? "Debe ser posterior a la fecha de inicio" : "",
    rut: !files.rut ? "Archivo obligatorio" : "",
    cedula: !files.cedula ? "Archivo obligatorio" : "",
    camara: !files.camara ? "Archivo obligatorio" : "",
  };
  const isValid = Object.values(errors).every(e => !e);

  async function handleConfirmar() {
    setShowModal(false); setLoading(true);
    try {
      const [r64, c64, ca64] = await Promise.all([toBase64(files.rut), toBase64(files.cedula), toBase64(files.camara)]);
      const payload = {
        documento_comercial: comercial.documento, nombre_comercial: comercial.nombre,
        cliente: { razon_social: form.razon_social, nit: form.nit, representante_legal: form.representante_legal, correo: form.correo, direccion: form.direccion },
        venta: { paquete: form.paquete, precio_unitario: precio, periodos: meses, descuento_porcentaje: desc, valor_final: total, fecha_inicio: form.fecha_inicio, fecha_termino: form.fecha_termino, observaciones: form.observaciones },
        soportes: { rut: r64, cedula: c64, camara_comercio: ca64 },
        timestamp: new Date().toISOString(),
      };
      const res = await fetch(WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`ERR_N8N_${res.status}`);
      const data = await res.json().catch(() => ({}));
      setResultado({ ok: true, link: data.link || "#", cliente: form.razon_social, monto: total, inicio: form.fecha_inicio, termino: form.fecha_termino });
    } catch (err) {
      setResultado({ ok: false, error: err.message });
    }
    setLoading(false); setFase(5);
  }

  function reiniciar() {
    setFormState({ razon_social:"",nit:"",representante_legal:"",correo:"",direccion:"",paquete:"",periodos:"",descuento:"0",fecha_inicio:"",fecha_termino:"",observaciones:"" });
    setFiles({ rut:null, cedula:null, camara:null }); setTouched({}); setResultado(null); setFase(2);
  }
  function cerrarSesion() { reiniciar(); setComercial(null); setDocInput(""); setFase(1); }

  const stepMap = { 1:1, 2:2, 5:4 };
  const currentStep = stepMap[fase] || 2;

  return (
    <div style={{ fontFamily: font, minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px" }}>
      {/* HEADER */}
      <div style={{ width: "100%", maxWidth: 680, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.purple, borderRadius: "14px 14px 0 0", padding: "18px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <DapperLogo size={32} dark />
            <div>
              <div style={{ color: C.white, fontWeight: 700, fontSize: 16, letterSpacing: .3 }}>Generador de Contratos</div>
              <div style={{ color: "rgba(255,255,255,.65)", fontSize: 12 }}>Sistema automatizado · {comercial ? `👤 ${comercial.nombre}` : "Autenticación requerida"}</div>
            </div>
          </div>
          {comercial && (
            <button onClick={cerrarSesion} style={{ background: "rgba(255,255,255,.15)", border: "none", color: C.white, fontSize: 12, padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 600 }}>
              Cerrar sesión
            </button>
          )}
        </div>

        {/* CARD */}
        <div style={{ background: C.cardBg, borderRadius: "0 0 14px 14px", boxShadow: "0 8px 32px rgba(87,35,245,.10)", padding: "32px 36px" }}>
          <Steps current={currentStep} />

          {/* ── FASE 1: AUTH ── */}
          {fase === 1 && (
            <div style={{ maxWidth: 400, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ width: 64, height: 64, background: C.bg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: `2px solid ${C.slateLight}` }}>
                  <span style={{ fontSize: 28 }}>🔐</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginBottom: 6 }}>Autenticación</div>
                <div style={{ fontSize: 14, color: C.slate }}>Ingresa tu número de documento para acceder al generador de contratos.</div>
              </div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate, marginBottom: 5, textTransform: "uppercase", letterSpacing: .5 }}>Número de documento</label>
              <input
                style={{ ...inputBase, borderColor: docError ? C.err : C.slateLight, fontSize: 16, padding: "12px 16px" }}
                value={docInput} placeholder="Ej: 1234567890"
                onChange={e => setDocInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAuth()}
              />
              {docError && <div style={{ color: C.err, fontSize: 12, marginTop: 6 }}>⚠ {docError}</div>}
              <button
                onClick={handleAuth}
                style={{ width: "100%", marginTop: 20, padding: "13px", background: C.purple, color: C.white, border: "none", borderRadius: 9, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: font, letterSpacing: .3 }}
              >
                Ingresar →
              </button>
            </div>
          )}

          {/* ── FASE 2: FORMULARIO ── */}
          {fase === 2 && (
            <>
              <SectionTitle>1 · Datos del Cliente</SectionTitle>
              <Field label="Razón social *" fkey="razon_social" placeholder="Coca-Cola Colombia S.A." form={form} setField={setField} errors={errors} touched={touched} setTouched={setTouched} />
              <Field label="NIT *" fkey="nit" placeholder="890.123.456-7" form={form} setField={setField} errors={errors} touched={touched} setTouched={setTouched} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Representante legal *" fkey="representante_legal" placeholder="Juan Pérez" form={form} setField={setField} errors={errors} touched={touched} setTouched={setTouched} />
                <Field label="Correo de contacto *" fkey="correo" type="email" placeholder="juan@empresa.com" form={form} setField={setField} errors={errors} touched={touched} setTouched={setTouched} />
              </div>
              <Field label="Dirección *" fkey="direccion" placeholder="Calle 50 #10-20, Bogotá" form={form} setField={setField} errors={errors} touched={touched} setTouched={setTouched} />

              <SectionTitle>2 · Venta</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate, marginBottom: 5, textTransform: "uppercase", letterSpacing: .5 }}>Paquete *</label>
                  <select style={{ ...inputBase, borderColor: touched.paquete && errors.paquete ? C.err : C.slateLight }}
                    value={form.paquete} onChange={e => setField("paquete", e.target.value)} onBlur={() => setTouched(t => ({ ...t, paquete: true }))}>
                    <option value="">Seleccionar…</option>
                    {Object.entries(PAQUETES).map(([k, v]) => (
                      <option key={k} value={k}>{k} — {fmtUSD(v.precio)}/mes</option>
                    ))}
                  </select>
                  {touched.paquete && errors.paquete && <div style={{ color: C.err, fontSize: 11, marginTop: 4 }}>⚠ {errors.paquete}</div>}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate, marginBottom: 5, textTransform: "uppercase", letterSpacing: .5 }}>Periodos (Meses) *</label>
                  <select style={{ ...inputBase, borderColor: touched.periodos && errors.periodos ? C.err : C.slateLight }}
                    value={form.periodos} onChange={e => {
                      const p = e.target.value;
                      setField("periodos", p);
                      // Calcular fecha de término automáticamente
                      if (form.fecha_inicio && p) {
                        const d = new Date(form.fecha_inicio);
                        d.setMonth(d.getMonth() + parseInt(p));
                        setField("fecha_termino", d.toISOString().split("T")[0]);
                      }
                    }} onBlur={() => setTouched(t => ({ ...t, periodos: true }))}>
                    <option value="">Seleccionar…</option>
                    {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {touched.periodos && errors.periodos && <div style={{ color: C.err, fontSize: 11, marginTop: 4 }}>⚠ {errors.periodos}</div>}
                </div>
              </div>
              <Field label="Descuento %" fkey="descuento" type="number" placeholder="0" form={form} setField={setField} errors={errors} touched={touched} setTouched={setTouched} />

              {/* CÁLCULO EN VIVO */}
              {form.paquete && form.periodos && (
                <div style={{ background: C.bg, border: `1px solid ${C.slateLight}`, borderRadius: 10, padding: 18, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Cálculo en vivo</div>
                  {[
                    [`${form.paquete} × ${meses} ${meses===1?"mes":"meses"}`, fmtUSD(subtotal)],
                    ...(desc > 0 ? [[`Descuento ${desc}%`, `− ${fmtUSD(descMonto)}`]] : []),
                  ].map(([l,r], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: i===1 ? C.ok : C.slate, marginBottom: 6 }}>
                      <span>{l}</span><span style={{ fontWeight: 600 }}>{r}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: `2px solid ${C.purple}`, paddingTop: 10, marginTop: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: "#1a1a2e" }}>TOTAL A COBRAR</span>
                    <span style={{ fontWeight: 800, fontSize: 16, color: C.purple }}>{fmtUSD(total)}</span>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate, marginBottom: 5, textTransform: "uppercase", letterSpacing: .5 }}>Fecha de inicio *</label>
                  <input type="date" value={form.fecha_inicio}
                    style={{ ...inputBase, borderColor: touched.fecha_inicio && errors.fecha_inicio ? C.err : C.slateLight }}
                    onChange={e => {
                      const fi = e.target.value;
                      setField("fecha_inicio", fi);
                      if (fi && form.periodos) {
                        const d = new Date(fi);
                        d.setMonth(d.getMonth() + parseInt(form.periodos));
                        setField("fecha_termino", d.toISOString().split("T")[0]);
                      }
                    }}
                    onBlur={() => setTouched(t => ({ ...t, fecha_inicio: true }))}
                  />
                  {touched.fecha_inicio && errors.fecha_inicio && <div style={{ color: C.err, fontSize: 11, marginTop: 4 }}>⚠ {errors.fecha_inicio}</div>}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate, marginBottom: 5, textTransform: "uppercase", letterSpacing: .5 }}>Fecha de término</label>
                  <input type="date" value={form.fecha_termino} readOnly
                    style={{ ...inputBase, background: C.bg, color: C.slate, borderColor: C.slateLight, cursor: "not-allowed" }}
                  />
                  <div style={{ color: C.slate, fontSize: 11, marginTop: 4 }}>Calculada automáticamente según inicio + periodos.</div>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate, marginBottom: 5, textTransform: "uppercase", letterSpacing: .5 }}>Observaciones</label>
                <textarea style={{ ...inputBase, minHeight: 72, resize: "vertical" }} value={form.observaciones}
                  onChange={e => setField("observaciones", e.target.value)} placeholder="Condiciones especiales, notas…" />
              </div>

              <SectionTitle>3 · Soportes</SectionTitle>
              <FileField label="RUT *" fkey="rut" files={files} setFiles={setFiles} errors={errors} touched={touched} setTouched={setTouched} />
              <FileField label="Cédula representante legal *" fkey="cedula" files={files} setFiles={setFiles} errors={errors} touched={touched} setTouched={setTouched} />
              <FileField label="Cámara de Comercio *" fkey="camara" files={files} setFiles={setFiles} errors={errors} touched={touched} setTouched={setTouched} />

              <button
                style={{ width: "100%", marginTop: 28, padding: "13px", background: isValid ? C.purple : C.slateLight, color: isValid ? C.white : C.slate, border: "none", borderRadius: 9, fontWeight: 700, fontSize: 15, cursor: isValid ? "pointer" : "not-allowed", fontFamily: font, transition: "background .2s" }}
                onClick={() => { setTouched(Object.fromEntries(Object.keys(errors).map(k=>[k,true]))); if (isValid) setShowModal(true); }}
              >
                Revisar y Generar Contrato →
              </button>
              {!isValid && <div style={{ color: C.slate, fontSize: 12, textAlign: "center", marginTop: 8 }}>Completa todos los campos obligatorios para continuar.</div>}
            </>
          )}

          {/* ── LOADING ── */}
          {loading && (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <div style={{ width: 56, height: 56, border: `4px solid ${C.slateLight}`, borderTop: `4px solid ${C.purple}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 24px" }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#1a1a2e", marginBottom: 8 }}>Generando contrato…</div>
              <div style={{ color: C.slate, fontSize: 14 }}>Enviando datos y archivos a N8n. Por favor espera.</div>
            </div>
          )}

          {/* ── FASE 5: RESULTADO ── */}
          {fase === 5 && !loading && resultado && (
            resultado.ok ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 72, height: 72, background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: `2px solid ${C.ok}` }}>
                  <span style={{ fontSize: 32 }}>✅</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.ok, marginBottom: 6 }}>¡Contrato Generado!</div>
                <div style={{ fontSize: 14, color: C.slate, marginBottom: 24 }}>El contrato fue enviado exitosamente y está disponible en Google Drive.</div>
                <div style={{ background: C.bg, borderRadius: 12, padding: 20, textAlign: "left", marginBottom: 24, borderLeft: `4px solid ${C.ok}` }}>
                  {[["Cliente", resultado.cliente], ["Monto total", fmtUSD(resultado.monto)], ["Vigencia", `${resultado.inicio} → ${resultado.termino}`], ["Ubicación Drive", `/Contratos/${resultado.cliente}/`], ["Notificado a", "Comercial + Facturación"]].map(([k,v]) => (
                    <div key={k} style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 14 }}>
                      <span style={{ color: C.slate, minWidth: 100 }}>{k}:</span>
                      <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <a href={resultado.link} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                    <button style={{ padding: "11px 22px", background: C.purple, color: C.white, border: "none", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Ver en Google Drive</button>
                  </a>
                  <button onClick={reiniciar} style={{ padding: "11px 22px", background: C.bg, color: C.purple, border: `1.5px solid ${C.purple}`, borderRadius: 9, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Generar otro</button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 72, height: 72, background: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: `2px solid ${C.err}` }}>
                  <span style={{ fontSize: 32 }}>❌</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.err, marginBottom: 6 }}>Error en la generación</div>
                <div style={{ background: "#fef2f2", borderRadius: 12, padding: 20, textAlign: "left", marginBottom: 24, borderLeft: `4px solid ${C.err}` }}>
                  <div style={{ fontSize: 14, marginBottom: 8 }}><b>Código:</b> {resultado.error}</div>
                  <div style={{ fontSize: 14, color: C.slate }}>Contacta a soporte@dapper.com indicando este código.</div>
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button onClick={() => { setFase(2); setResultado(null); }} style={{ padding: "11px 22px", background: C.purple, color: C.white, border: "none", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Reintentar</button>
                  <button onClick={cerrarSesion} style={{ padding: "11px 22px", background: C.bg, color: C.err, border: `1.5px solid ${C.err}`, borderRadius: 9, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Cerrar sesión</button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(29,12,82,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 32, maxWidth: 500, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(87,35,245,.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 4, height: 22, background: C.purple, borderRadius: 2 }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>Confirmar Contrato</span>
            </div>

            {[
              ["Cliente", [["Razón social", form.razon_social], ["NIT", form.nit], ["Representante", form.representante_legal], ["Correo", form.correo]]],
              ["Venta", [["Comercial", comercial?.nombre], ["Paquete", form.paquete], ["Periodos", `${form.periodos} ${parseInt(form.periodos)===1?"mes":"meses"}`], ["Precio unitario", fmtUSD(precio)+"/mes"]]],
            ].map(([title, rows]) => (
              <div key={title} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{title}</div>
                {rows.map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 12, marginBottom: 6, fontSize: 14 }}>
                    <span style={{ color: C.slate, minWidth: 110 }}>{k}:</span>
                    <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ background: C.bg, borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Resumen financiero</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: C.slate, marginBottom: 6 }}>
                <span>Subtotal ({meses} {meses===1?"mes":"meses"})</span><span style={{ fontWeight: 600 }}>{fmtUSD(subtotal)}</span>
              </div>
              {desc > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: C.ok, marginBottom: 6 }}>
                  <span>Descuento {desc}%</span><span style={{ fontWeight: 600 }}>− {fmtUSD(descMonto)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: `2px solid ${C.purple}`, paddingTop: 10, marginTop: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: "#1a1a2e" }}>TOTAL A COBRAR</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: C.purple }}>{fmtUSD(total)}</span>
              </div>
            </div>

            <div style={{ fontSize: 13, color: C.slate, marginBottom: 24 }}>
              <b>Vigencia:</b> {form.fecha_inicio} → {form.fecha_termino}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleConfirmar} style={{ flex: 1, padding: "13px", background: C.purple, color: C.white, border: "none", borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: font }}>
                ✓ Confirmar y Generar
              </button>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "13px", background: C.bg, color: C.slate, border: `1.5px solid ${C.slateLight}`, borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: font }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
