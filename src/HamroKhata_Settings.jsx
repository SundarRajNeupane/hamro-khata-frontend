/**
 * HAMRO KHATA — Settings Screen + Stock/Inventory Screen
 * Drop these screens into HamroKhata.jsx alongside the existing ones.
 *
 * HOW TO INTEGRATE:
 *  1. Add these state variables to HamroKhata():
 *       const [products, setProducts] = useState(INIT_PRODUCTS);
 *       const [business, setBusiness] = useState({ name: "Hamro Pasale", phone: "", address: "" });
 *
 *  2. Add to SCREENS map:
 *       settings: () => <SettingsScreen business={business} setBusiness={setBusiness} />,
 *       stock:    () => <StockScreen products={products} setProducts={setProducts} />,
 *
 *  3. Add "Stock" tab to BottomNav (or replace "Invoice" if keeping 5 tabs).
 */

import { useState, useMemo } from "react";

const TEAL  = "#1D9E75";
const GREEN = "#639922";
const RED   = "#E24B4A";
const AMBER = "#BA7517";

const fmtNPR = (n) => `Rs.\u202F${Math.round(Math.abs(+n)).toLocaleString("en-IN")}`;

// ── Seed stock data ────────────────────────────────────────────────
export const INIT_PRODUCTS = [
  { id: "p1", name: "Basmati Rice (25kg bag)", unit: "bag",  buyPrice: 1800, sellPrice: 2100, stock: 12, lowAt: 3 },
  { id: "p2", name: "Mustard Oil (1L)",        unit: "ltr",  buyPrice: 185,  sellPrice: 220,  stock: 40, lowAt: 10 },
  { id: "p3", name: "Tata Dal (1kg)",           unit: "kg",   buyPrice: 95,   sellPrice: 115,  stock: 25, lowAt: 8 },
  { id: "p4", name: "Sugar (1kg)",              unit: "kg",   buyPrice: 58,   sellPrice: 75,   stock: 30, lowAt: 10 },
  { id: "p5", name: "Tea (250g packet)",        unit: "pkt",  buyPrice: 110,  sellPrice: 135,  stock: 2,  lowAt: 5  },
  { id: "p6", name: "Soap (Lux)",               unit: "pcs",  buyPrice: 50,   sellPrice: 65,   stock: 0,  lowAt: 10 },
];

// ── Shared mini-components (self-contained) ───────────────────────
const MiniCard = ({ children, style }) => (
  <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", ...style }}>
    {children}
  </div>
);

const MiniMetric = ({ label, value, color }) => (
  <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "10px 12px", flex: 1, minWidth: 0 }}>
    <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginBottom: "3px" }}>{label}</div>
    <div style={{ fontSize: "15px", fontWeight: 500, color: color || "var(--color-text-primary)" }}>{value}</div>
  </div>
);

// ══════════════════════════════════════════════════════════════════
// SETTINGS SCREEN
// ══════════════════════════════════════════════════════════════════
export function SettingsScreen({ business, setBusiness }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState({ ...business });
  const [saved,   setSaved]   = useState(false);

  const handleSave = () => {
    setBusiness({ ...draft });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Row = ({ label, value, icon }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
      <div style={{ width: 34, height: 34, borderRadius: "var(--border-radius-md)", background: TEAL + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <i className={`ti ${icon}`} style={{ fontSize: "16px", color: TEAL }} aria-hidden="true" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{label}</div>
        <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "1px" }}>{value || "—"}</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "16px 0 12px", fontSize: "18px", fontWeight: 500 }}>Settings</div>

      {/* Business profile */}
      <MiniCard style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "14px", fontWeight: 500 }}>
            <i className="ti ti-building-store" style={{ color: TEAL, marginRight: "6px" }} aria-hidden="true" />
            Business profile
          </span>
          <button onClick={() => { setDraft({ ...business }); setEditing(!editing); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: TEAL, fontSize: "13px", fontWeight: 500, padding: "4px" }}>
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { key: "name",    label: "Business name", placeholder: "e.g. Ram ko Pasale", type: "text" },
              { key: "owner",   label: "Owner name",    placeholder: "e.g. Ram Bahadur",   type: "text" },
              { key: "phone",   label: "Phone number",  placeholder: "98XXXXXXXX",         type: "tel" },
              { key: "address", label: "Address",       placeholder: "e.g. New Road, Ktm", type: "text" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>{label}</label>
                <input type={type} placeholder={placeholder} value={draft[key] || ""} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} />
              </div>
            ))}
            <button onClick={handleSave} style={{ padding: "12px", background: TEAL, color: "#fff", border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontWeight: 500, fontSize: "14px", marginTop: "4px" }}>
              Save changes
            </button>
          </div>
        ) : (
          <div>
            <Row label="Business name" value={business.name}    icon="ti-building-store" />
            <Row label="Owner name"   value={business.owner}   icon="ti-user" />
            <Row label="Phone"        value={business.phone}   icon="ti-phone" />
            <Row label="Address"      value={business.address} icon="ti-map-pin" />
          </div>
        )}

        {saved && (
          <div style={{ marginTop: "10px", padding: "8px 12px", background: TEAL + "15", borderRadius: "var(--border-radius-md)", fontSize: "13px", color: TEAL, display: "flex", alignItems: "center", gap: "6px" }}>
            <i className="ti ti-circle-check" style={{ fontSize: "14px" }} aria-hidden="true" />
            Profile saved successfully
          </div>
        )}
      </MiniCard>

      {/* App preferences */}
      <MiniCard style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "12px" }}>
          <i className="ti ti-adjustments" style={{ color: TEAL, marginRight: "6px" }} aria-hidden="true" />
          Preferences
        </div>
        {[
          { label: "Currency",  value: "NPR (Nepalese Rupee)",   icon: "ti-currency-rupee" },
          { label: "Language",  value: "English",                 icon: "ti-language" },
          { label: "Timezone",  value: "Asia/Kathmandu (NPT)",   icon: "ti-clock" },
          { label: "Date format", value: "DD MMM YYYY",          icon: "ti-calendar" },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            <i className={`ti ${icon}`} style={{ fontSize: "16px", color: "var(--color-text-secondary)", width: 20, textAlign: "center" }} aria-hidden="true" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{label}</div>
              <div style={{ fontSize: "13px", fontWeight: 500 }}>{value}</div>
            </div>
          </div>
        ))}
      </MiniCard>

      {/* Data & sync */}
      <MiniCard style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "12px" }}>
          <i className="ti ti-database" style={{ color: TEAL, marginRight: "6px" }} aria-hidden="true" />
          Data & sync
        </div>
        {[
          { label: "Last synced",     value: "Just now",               icon: "ti-cloud-check",  color: TEAL },
          { label: "Local records",   value: "47 entries",             icon: "ti-files",        color: null },
          { label: "Pending sync",    value: "0 items",                icon: "ti-clock-upload", color: null },
          { label: "Storage used",    value: "2.3 MB / unlimited",     icon: "ti-database",     color: null },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            <i className={`ti ${icon}`} style={{ fontSize: "16px", color: color || "var(--color-text-secondary)", width: 20, textAlign: "center" }} aria-hidden="true" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{label}</div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: color || "var(--color-text-primary)" }}>{value}</div>
            </div>
          </div>
        ))}
        <button style={{ width: "100%", marginTop: "12px", padding: "10px", background: TEAL + "10", border: `0.5px solid ${TEAL}`, borderRadius: "var(--border-radius-md)", cursor: "pointer", color: TEAL, fontWeight: 500, fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <i className="ti ti-cloud-upload" style={{ fontSize: "15px" }} aria-hidden="true" />
          Backup now
        </button>
      </MiniCard>

      {/* Reminder templates */}
      <MiniCard style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "12px" }}>
          <i className="ti ti-brand-whatsapp" style={{ color: "#25D366", marginRight: "6px" }} aria-hidden="true" />
          Reminder message template
        </div>
        <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "8px" }}>
          Sent via WhatsApp when you tap "Send reminder" on a customer
        </div>
        <textarea
          rows={4}
          defaultValue={`Namaskar {name} ji,\n\nAapko {shop} ma {amount} tirnu baki chha.\nKripa garni payment garnus.\n\nDhanyabad!`}
          style={{ width: "100%", boxSizing: "border-box", resize: "vertical", fontSize: "13px", lineHeight: 1.5 }}
        />
        <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "6px" }}>
          Variables: {"{name}"} · {"{shop}"} · {"{amount}"}
        </div>
      </MiniCard>

      {/* Danger zone */}
      <MiniCard style={{ borderColor: RED + "40" }}>
        <div style={{ fontSize: "14px", fontWeight: 500, color: RED, marginBottom: "12px" }}>
          <i className="ti ti-alert-triangle" style={{ marginRight: "6px" }} aria-hidden="true" />
          Danger zone
        </div>
        {[
          { label: "Export all data (.xlsx)", icon: "ti-file-spreadsheet", color: TEAL },
          { label: "Clear local data",        icon: "ti-trash",             color: RED },
          { label: "Log out",                 icon: "ti-logout",            color: RED },
        ].map(({ label, icon, color }) => (
          <button key={label} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", background: "none", border: "none", cursor: "pointer", borderBottom: "0.5px solid var(--color-border-tertiary)", textAlign: "left" }}>
            <i className={`ti ${icon}`} style={{ fontSize: "16px", color, width: 20, textAlign: "center" }} aria-hidden="true" />
            <span style={{ fontSize: "13px", fontWeight: 500, color }}>{label}</span>
          </button>
        ))}
      </MiniCard>

      <div style={{ textAlign: "center", padding: "20px 0 4px", fontSize: "12px", color: "var(--color-text-secondary)" }}>
        Hamro Khata v1.0.0 · Made with ♥ for Nepal
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// STOCK / INVENTORY SCREEN
// ══════════════════════════════════════════════════════════════════
export function StockScreen({ products, setProducts }) {
  const [modal,   setModal]   = useState(null);  // "add" | "edit" | "adjust"
  const [selProd, setSelProd] = useState(null);
  const [form,    setForm]    = useState({});
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all"); // all | low | out

  const closeM = () => { setModal(null); setSelProd(null); setForm({}); };
  const sF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const stockValue = useMemo(() => products.reduce((s, p) => s + p.stock * p.buyPrice, 0), [products]);
  const lowCount   = useMemo(() => products.filter(p => p.stock > 0 && p.stock <= p.lowAt).length, [products]);
  const outCount   = useMemo(() => products.filter(p => p.stock === 0).length, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (filter === "low") list = list.filter(p => p.stock > 0 && p.stock <= p.lowAt);
    if (filter === "out") list = list.filter(p => p.stock === 0);
    return list;
  }, [products, search, filter]);

  const addProduct = () => {
    if (!form.name?.trim()) return;
    const p = { id: "p" + Date.now(), name: form.name.trim(), unit: form.unit || "pcs", buyPrice: +(form.buy || 0), sellPrice: +(form.sell || 0), stock: +(form.qty || 0), lowAt: +(form.lowAt || 5) };
    setProducts(prev => [...prev, p]);
    closeM();
  };

  const adjustStock = (id, delta) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  };

  const stockColor = (p) => p.stock === 0 ? RED : p.stock <= p.lowAt ? AMBER : TEAL;
  const stockLabel = (p) => p.stock === 0 ? "Out of stock" : p.stock <= p.lowAt ? "Low stock" : "In stock";

  const Sheet = ({ title, onClose, children }) => (
    <div style={{ position: "absolute", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.48)", display: "flex", alignItems: "flex-end" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", background: "var(--color-background-primary)", borderRadius: "16px 16px 0 0", padding: "20px 20px 36px", maxHeight: "80vh", overflowY: "auto", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <span style={{ fontSize: "17px", fontWeight: 500 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
            <i className="ti ti-x" style={{ fontSize: "20px" }} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ padding: "0 16px 16px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 12px" }}>
        <span style={{ fontSize: "18px", fontWeight: 500 }}>Stock / Inventory</span>
        <button onClick={() => setModal("add")} style={{ background: TEAL, color: "#fff", border: "none", borderRadius: "20px", padding: "7px 14px", fontSize: "13px", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
          <i className="ti ti-plus" style={{ fontSize: "14px" }} aria-hidden="true" /> New item
        </button>
      </div>

      {/* Summary metrics */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <MiniMetric label="Total products"  value={products.length} />
        <MiniMetric label="Stock value"     value={fmtNPR(stockValue)} color={GREEN} />
      </div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        <MiniMetric label="Low stock"  value={`${lowCount} items`}  color={AMBER} />
        <MiniMetric label="Out of stock" value={`${outCount} items`} color={outCount > 0 ? RED : "var(--color-text-secondary)"} />
      </div>

      {/* Alerts */}
      {(lowCount > 0 || outCount > 0) && (
        <div style={{ padding: "10px 14px", background: AMBER + "12", border: `0.5px solid ${AMBER}40`, borderRadius: "var(--border-radius-md)", marginBottom: "14px", fontSize: "13px", color: AMBER, display: "flex", alignItems: "center", gap: "8px" }}>
          <i className="ti ti-alert-circle" style={{ fontSize: "16px", flexShrink: 0 }} aria-hidden="true" />
          {outCount > 0 && <span>{outCount} item{outCount > 1 ? "s" : ""} out of stock. </span>}
          {lowCount > 0 && <span>{lowCount} item{lowCount > 1 ? "s" : ""} running low.</span>}
        </div>
      )}

      {/* Search + filter */}
      <div style={{ position: "relative", marginBottom: "10px" }}>
        <i className="ti ti-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "15px", color: "var(--color-text-secondary)" }} aria-hidden="true" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" style={{ paddingLeft: "36px", width: "100%", boxSizing: "border-box" }} />
      </div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
        {[["all", "All"], ["low", "Low stock"], ["out", "Out of stock"]].map(([k, lab]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ padding: "5px 12px", borderRadius: "20px", border: `0.5px solid ${filter === k ? TEAL : "var(--color-border-secondary)"}`, background: filter === k ? TEAL + "15" : "none", cursor: "pointer", fontSize: "12px", color: filter === k ? TEAL : "var(--color-text-secondary)", fontWeight: filter === k ? 500 : 400 }}>
            {lab}
          </button>
        ))}
      </div>

      {/* Product list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-text-secondary)" }}>
          <i className="ti ti-packages" style={{ fontSize: "36px", display: "block", marginBottom: "8px" }} aria-hidden="true" />
          No products found
        </div>
      ) : (
        filtered.map(p => (
          <MiniCard key={p.id} style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "var(--border-radius-md)", background: stockColor(p) + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="ti ti-package" style={{ fontSize: "16px", color: stockColor(p) }} aria-hidden="true" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                  Buy: {fmtNPR(p.buyPrice)} · Sell: {fmtNPR(p.sellPrice)} · Unit: {p.unit}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                  <span style={{ fontSize: "11px", background: stockColor(p) + "15", color: stockColor(p), padding: "2px 8px", borderRadius: "10px", fontWeight: 500 }}>
                    {stockLabel(p)}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "18px", fontWeight: 500, color: stockColor(p) }}>{p.stock}</div>
                <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{p.unit}</div>
              </div>
            </div>

            {/* Quick stock adjust */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", paddingTop: "10px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
              <button onClick={() => adjustStock(p.id, -1)} disabled={p.stock === 0} style={{ width: 30, height: 30, borderRadius: "var(--border-radius-md)", border: `1px solid ${RED}`, background: RED + "10", cursor: p.stock === 0 ? "not-allowed" : "pointer", color: RED, fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", opacity: p.stock === 0 ? 0.4 : 1 }}>−</button>
              <span style={{ flex: 1, textAlign: "center", fontSize: "13px", color: "var(--color-text-secondary)" }}>Adjust stock</span>
              <button onClick={() => adjustStock(p.id, +1)} style={{ width: 30, height: 30, borderRadius: "var(--border-radius-md)", border: `1px solid ${GREEN}`, background: GREEN + "10", cursor: "pointer", color: GREEN, fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              <button onClick={() => { setSelProd(p); setForm({ qty: "" }); setModal("adjust"); }} style={{ padding: "5px 12px", border: `0.5px solid ${TEAL}`, borderRadius: "var(--border-radius-md)", background: TEAL + "10", cursor: "pointer", fontSize: "12px", color: TEAL, fontWeight: 500 }}>
                Set qty
              </button>
            </div>
          </MiniCard>
        ))
      )}

      {/* Modals */}
      {modal === "add" && (
        <Sheet title="Add new product" onClose={closeM}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { k: "name",  label: "Product name *",  type: "text",   ph: "e.g. Basmati Rice 25kg" },
              { k: "unit",  label: "Unit",             type: "text",   ph: "pcs / kg / ltr / pkt" },
              { k: "buy",   label: "Buy price (Rs.)",  type: "number", ph: "0" },
              { k: "sell",  label: "Sell price (Rs.)", type: "number", ph: "0" },
              { k: "qty",   label: "Current stock",    type: "number", ph: "0" },
              { k: "lowAt", label: "Low-stock alert at", type: "number", ph: "5" },
            ].map(({ k, label, type, ph }) => (
              <div key={k}>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>{label}</label>
                <input type={type} placeholder={ph} value={form[k] || ""} onChange={e => sF(k, e.target.value)} style={{ width: "100%", boxSizing: "border-box" }} />
              </div>
            ))}
            <button onClick={addProduct} style={{ padding: "12px", background: TEAL, color: "#fff", border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontWeight: 500, fontSize: "14px", marginTop: "4px", opacity: form.name?.trim() ? 1 : 0.45 }}>
              Add product
            </button>
          </div>
        </Sheet>
      )}

      {modal === "adjust" && selProd && (
        <Sheet title={`Set stock — ${selProd.name}`} onClose={closeM}>
          <div style={{ padding: "12px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", marginBottom: "14px", fontSize: "14px", color: "var(--color-text-secondary)" }}>
            Current stock: <strong style={{ color: "var(--color-text-primary)" }}>{selProd.stock} {selProd.unit}</strong>
          </div>
          <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", display: "block", marginBottom: "5px" }}>New quantity ({selProd.unit}) *</label>
          <input type="number" min="0" placeholder="0" value={form.qty || ""} onChange={e => sF("qty", e.target.value)} style={{ width: "100%", boxSizing: "border-box", fontSize: "22px", marginBottom: "14px" }} autoFocus />
          <button onClick={() => {
            if (form.qty === "" || +form.qty < 0) return;
            setProducts(prev => prev.map(p => p.id === selProd.id ? { ...p, stock: +form.qty } : p));
            closeM();
          }} style={{ width: "100%", padding: "12px", background: TEAL, color: "#fff", border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontWeight: 500, fontSize: "14px" }}>
            Update stock
          </button>
        </Sheet>
      )}
    </div>
  );
}
