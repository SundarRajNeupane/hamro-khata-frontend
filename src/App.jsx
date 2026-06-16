import { useState, useMemo, useEffect, useRef } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().split("T")[0];
const TEAL = "#1D9E75";
const GREEN = "#639922";
const RED = "#E24B4A";
const AMBER = "#BA7517";
const WA = "#25D366";

const fmtNPR = (n) => `Rs.\u202F${Math.round(Math.abs(+n)).toLocaleString("en-IN")}`;
const fmtDate = (s) => new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const initials = (n) => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const ago = (d) => {
  const x = Math.floor((new Date(TODAY) - new Date(d)) / 864e5);
  return x === 0 ? "Today" : x === 1 ? "Yesterday" : `${x}d ago`;
};

let _uid = 500;
const nuid = () => ++_uid;

// ── Seed Data ──────────────────────────────────────────────────────────────
const CUSTS = [
  {
    id: 1, name: "Ram Bahadur Thapa", phone: "9841234567", createdAt: "2026-05-01",
    transactions: [
      { id: nuid(), type: "credit",  amount: 2500, desc: "Rice 25kg, Dal 5kg",   date: "2026-06-01" },
      { id: nuid(), type: "payment", amount: 1000, desc: "Cash payment",          date: "2026-06-05" },
      { id: nuid(), type: "credit",  amount: 800,  desc: "Oil 2L, Sugar 3kg",    date: "2026-06-10" },
    ],
  },
  {
    id: 2, name: "Sita Sharma", phone: "9812345678", createdAt: "2026-05-15",
    transactions: [
      { id: nuid(), type: "credit",  amount: 1200, desc: "Monthly grocery items", date: "2026-06-03" },
      { id: nuid(), type: "payment", amount: 1200, desc: "Full payment",           date: "2026-06-08" },
    ],
  },
  {
    id: 3, name: "Krishna Prasad Gautam", phone: "", createdAt: "2026-06-01",
    transactions: [
      { id: nuid(), type: "credit",  amount: 3500, desc: "Grocery items — bulk", date: "2026-06-01" },
      { id: nuid(), type: "payment", amount: 500,  desc: "Partial payment",       date: "2026-06-12" },
    ],
  },
  {
    id: 4, name: "Maya Devi Karki", phone: "9823456789", createdAt: "2026-06-05",
    transactions: [
      { id: nuid(), type: "credit", amount: 650, desc: "Snacks, drinks, soap", date: "2026-06-08" },
    ],
  },
  {
    id: 5, name: "Bikram Singh Rana", phone: "9867890123", createdAt: "2026-06-10",
    transactions: [
      { id: nuid(), type: "credit",  amount: 1800, desc: "Tea, biscuits, soap", date: "2026-06-10" },
      { id: nuid(), type: "payment", amount: 1800, desc: "Paid in full",         date: "2026-06-13" },
    ],
  },
];

const CASH = [
  { id: nuid(), type: "income",  amount: 4500, desc: "Counter sales",              category: "Sales",     date: TODAY },
  { id: nuid(), type: "expense", amount: 800,  desc: "Wholesale stock restock",    category: "Stock",     date: TODAY },
  { id: nuid(), type: "income",  amount: 1200, desc: "Customer payment received",  category: "Sales",     date: TODAY },
  { id: nuid(), type: "income",  amount: 3800, desc: "Morning + afternoon sales",  category: "Sales",     date: "2026-06-14" },
  { id: nuid(), type: "expense", amount: 200,  desc: "Electricity bill",           category: "Utilities", date: "2026-06-14" },
  { id: nuid(), type: "income",  amount: 6200, desc: "Full day sales",             category: "Sales",     date: "2026-06-13" },
  { id: nuid(), type: "expense", amount: 5000, desc: "Monthly shop rent",          category: "Rent",      date: "2026-06-13" },
  { id: nuid(), type: "income",  amount: 4100, desc: "Daily counter sales",        category: "Sales",     date: "2026-06-12" },
  { id: nuid(), type: "expense", amount: 1200, desc: "Dal, rice, lentils stock",   category: "Stock",     date: "2026-06-12" },
  { id: nuid(), type: "income",  amount: 5300, desc: "Sales",                      category: "Sales",     date: "2026-06-11" },
  { id: nuid(), type: "expense", amount: 600,  desc: "Packaging materials",        category: "Other",     date: "2026-06-11" },
  { id: nuid(), type: "income",  amount: 3600, desc: "Sales",                      category: "Sales",     date: "2026-06-10" },
  { id: nuid(), type: "income",  amount: 4800, desc: "Sales",                      category: "Sales",     date: "2026-06-09" },
  { id: nuid(), type: "expense", amount: 900,  desc: "Wholesale stock",            category: "Stock",     date: "2026-06-09" },
];

const INVS = [
  {
    id: nuid(), customerName: "Ram Bahadur Thapa",
    items: [{ desc: "Oil 2L", amt: 400 }, { desc: "Sugar 3kg", amt: 240 }, { desc: "Dal 1kg", amt: 160 }],
    total: 800, date: "2026-06-10",
  },
  {
    id: nuid(), customerName: "Sita Sharma",
    items: [{ desc: "Monthly grocery bundle", amt: 1200 }],
    total: 1200, date: "2026-06-03",
  },
];

// ── Shared UI Components ───────────────────────────────────────────────────

const Card = ({ children, style, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "1rem 1.25rem",
      cursor: onClick ? "pointer" : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

const Metric = ({ label, value, color, icon }) => (
  <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "10px 12px", flex: 1, minWidth: 0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: "3px", marginBottom: "3px" }}>
      {icon && <i className={`ti ${icon}`} style={{ fontSize: "11px", color: "var(--color-text-secondary)" }} aria-hidden="true" />}
      <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
    </div>
    <div style={{ fontSize: "15px", fontWeight: 500, color: color || "var(--color-text-primary)", lineHeight: 1.2 }}>{value}</div>
  </div>
);

const Avt = ({ name, size = 36, color = TEAL }) => (
  <div
    style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "22", display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
      fontSize: Math.round(size * 0.35), fontWeight: 500, color,
    }}
  >
    {initials(name)}
  </div>
);

const BtnFill = ({ label, icon, color, onClick, style }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
      padding: "12px 16px", border: "none", borderRadius: "var(--border-radius-md)",
      background: color || TEAL, color: "#fff", cursor: "pointer", fontWeight: 500, fontSize: "14px",
      ...style,
    }}
  >
    {icon && <i className={`ti ${icon}`} style={{ fontSize: "15px" }} aria-hidden="true" />}
    {label}
  </button>
);

const BtnLine = ({ label, icon, color, onClick, style }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
      padding: "12px 16px", border: `1px solid ${color || TEAL}`,
      borderRadius: "var(--border-radius-md)", background: (color || TEAL) + "10",
      color: color || TEAL, cursor: "pointer", fontWeight: 500, fontSize: "14px",
      ...style,
    }}
  >
    {icon && <i className={`ti ${icon}`} style={{ fontSize: "15px" }} aria-hidden="true" />}
    {label}
  </button>
);

const Sheet = ({ title, onClose, children }) => (
  <div
    style={{
      position: "absolute", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.48)", display: "flex", alignItems: "flex-end",
    }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div
      style={{
        width: "100%", background: "var(--color-background-primary)",
        borderRadius: "16px 16px 0 0", padding: "20px 20px 36px",
        maxHeight: "80vh", overflowY: "auto", boxSizing: "border-box",
      }}
    >
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

const Fld = ({ label, children }) => (
  <div style={{ marginBottom: "14px" }}>
    <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", display: "block", marginBottom: "5px" }}>{label}</label>
    {children}
  </div>
);

// ── Analytics Screen ───────────────────────────────────────────────────────
function AnalyticsScreen({ cashbook, customers }) {
  const [period, setPeriod] = useState("week");
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  const getDates = (n) =>
    Array.from({ length: n }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (n - 1 - i));
      return d.toISOString().split("T")[0];
    });

  const dates = period === "week" ? getDates(7) : getDates(30);
  const incomes = dates.map((d) =>
    cashbook.filter((e) => e.date === d && e.type === "income").reduce((s, e) => s + e.amount, 0)
  );
  const exps = dates.map((d) =>
    cashbook.filter((e) => e.date === d && e.type === "expense").reduce((s, e) => s + e.amount, 0)
  );
  const labels = dates.map((d) => {
    const dt = new Date(d);
    return period === "week"
      ? dt.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2) + dt.getDate()
      : `${dt.getDate()}/${dt.getMonth() + 1}`;
  });

  const totalInc = incomes.reduce((s, v) => s + v, 0);
  const totalExp = exps.reduce((s, v) => s + v, 0);
  const topDebtors = [...customers].filter((c) => c.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 5);
  const topCusts = [...customers].sort((a, b) => b.txCount - a.txCount).slice(0, 3);

  const buildChart = () => {
    if (!chartRef.current || !window.Chart) return;
    if (chartInst.current) chartInst.current.destroy();
    chartInst.current = new window.Chart(chartRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Income",  data: incomes, backgroundColor: GREEN, borderRadius: 3 },
          { label: "Expense", data: exps,    backgroundColor: RED,   borderRadius: 3 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9 }, color: "#888", maxRotation: 0 } },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(128,128,128,.08)" },
            ticks: { callback: (v) => (v >= 1000 ? `${v / 1000}k` : v), font: { size: 9 }, color: "#888" },
          },
        },
      },
    });
  };

  useEffect(() => {
    let ok = true;
    const init = () => { if (ok) buildChart(); };
    if (window.Chart) {
      init();
    } else {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
      s.onload = init;
      document.head.appendChild(s);
    }
    return () => {
      ok = false;
      if (chartInst.current) { chartInst.current.destroy(); chartInst.current = null; }
    };
  }, [period, JSON.stringify(cashbook)]);

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ padding: "16px 0 12px", fontSize: "18px", fontWeight: 500 }}>Analytics</div>

      {/* Period toggle */}
      <div style={{ display: "flex", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "3px", marginBottom: "14px" }}>
        {[["week", "Last 7 days"], ["month", "Last 30 days"]].map(([p, lab]) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              flex: 1, padding: "7px", border: "none", borderRadius: "var(--border-radius-md)",
              background: period === p ? "var(--color-background-primary)" : "none",
              cursor: "pointer", fontWeight: period === p ? 500 : 400, fontSize: "13px",
              color: period === p ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            }}
          >
            {lab}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <Metric label="Total income"  value={fmtNPR(totalInc)} color={GREEN} icon="ti-arrow-up" />
        <Metric label="Total expense" value={fmtNPR(totalExp)} color={RED}   icon="ti-arrow-down" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: (totalInc - totalExp >= 0 ? GREEN : RED) + "10", borderRadius: "var(--border-radius-md)", marginBottom: "14px" }}>
        <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Net profit</span>
        <span style={{ fontSize: "17px", fontWeight: 500, color: totalInc - totalExp >= 0 ? GREEN : RED }}>
          {totalInc - totalExp >= 0 ? "+" : ""}{fmtNPR(totalInc - totalExp)}
        </span>
      </div>

      {/* Chart */}
      <Card style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", gap: "16px", marginBottom: "10px", fontSize: "12px", color: "var(--color-text-secondary)" }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: GREEN, borderRadius: 2, marginRight: 4, verticalAlign: "middle" }} />Income</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: RED,   borderRadius: 2, marginRight: 4, verticalAlign: "middle" }} />Expense</span>
        </div>
        <div style={{ position: "relative", height: "160px" }}>
          <canvas ref={chartRef} role="img" aria-label="Income vs expense bar chart">Income and expense data</canvas>
        </div>
      </Card>

      {/* Top debtors */}
      {topDebtors.length > 0 && (
        <Card style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "10px" }}>
            <i className="ti ti-trophy" style={{ color: AMBER, marginRight: "6px", fontSize: "14px" }} aria-hidden="true" />
            Top outstanding balances
          </div>
          {topDebtors.map((c, i) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 500, flexShrink: 0, color: "var(--color-text-secondary)" }}>{i + 1}</div>
              <span style={{ flex: 1, fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
              <span style={{ fontSize: "13px", fontWeight: 500, color: RED }}>{fmtNPR(c.balance)}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Most active customers */}
      <Card>
        <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "10px" }}>
          <i className="ti ti-users" style={{ color: TEAL, marginRight: "6px", fontSize: "14px" }} aria-hidden="true" />
          Most active customers
        </div>
        {topCusts.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            <Avt name={c.name} size={32} color={TEAL} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
              <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{c.txCount} transactions</div>
            </div>
            <span style={{ fontSize: "12px", background: (c.balance > 0 ? RED : TEAL) + "15", color: c.balance > 0 ? RED : TEAL, padding: "3px 8px", borderRadius: "12px", whiteSpace: "nowrap" }}>
              {c.balance > 0 ? fmtNPR(c.balance) + " due" : "Settled"}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function HamroKhata() {
  const [screen,   setScreen]   = useState("home");
  const [customers, setCustomers] = useState(CUSTS);
  const [cashbook,  setCashbook]  = useState(CASH);
  const [invoices,  setInvoices]  = useState(INVS);
  const [modal,    setModal]    = useState(null);
  const [mCtx,     setMCtx]     = useState({});
  const [form,     setForm]     = useState({});
  const [custId,   setCustId]   = useState(null);
  const [invId,    setInvId]    = useState(null);
  const [cashDate, setCashDate] = useState(TODAY);
  const [search,   setSearch]   = useState("");
  const [sync,     setSync]     = useState("synced");
  const [nextId,   setNextId]   = useState(2000);

  const nid    = () => { const n = nextId; setNextId(n + 1); return n; };
  const doSync = () => { setSync("syncing"); setTimeout(() => setSync("synced"), 1600); };
  const openM  = (name, ctx = {}) => { setModal(name); setMCtx(ctx); setForm({}); };
  const closeM = () => setModal(null);
  const sF     = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const go     = (s) => { setScreen(s); setCustId(null); setInvId(null); setSearch(""); };

  // ── Computed values ──────────────────────────────────────────────────────
  const cwb = useMemo(() =>
    customers.map((c) => {
      const credit = c.transactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
      const paid   = c.transactions.filter((t) => t.type === "payment").reduce((s, t) => s + t.amount, 0);
      const lastDate = c.transactions.length
        ? [...c.transactions].sort((a, b) => b.date.localeCompare(a.date))[0].date
        : c.createdAt;
      return { ...c, credit, paid, balance: credit - paid, lastDate, txCount: c.transactions.length };
    }),
  [customers]);

  const selCust  = useMemo(() => cwb.find((c) => c.id === custId), [cwb, custId]);
  const selInv   = useMemo(() => invoices.find((i) => i.id === invId), [invoices, invId]);
  const totalOut = useMemo(() => cwb.reduce((s, c) => s + Math.max(0, c.balance), 0), [cwb]);
  const overdue  = useMemo(() => cwb.filter((c) => c.balance > 0).sort((a, b) => b.balance - a.balance), [cwb]);
  const filtCust = useMemo(() => cwb.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())), [cwb, search]);

  const todaySt = useMemo(() => {
    const es = cashbook.filter((e) => e.date === TODAY);
    const income  = es.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
    const expense = es.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
    return { income, expense, net: income - expense };
  }, [cashbook]);

  const dateSt = useMemo(() => {
    const es = cashbook.filter((e) => e.date === cashDate);
    const income  = es.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
    const expense = es.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
    return { income, expense, net: income - expense, entries: es };
  }, [cashbook, cashDate]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const addCust = () => {
    if (!form.name?.trim()) return;
    setCustomers((p) => [...p, { id: nid(), name: form.name.trim(), phone: form.phone || "", createdAt: TODAY, transactions: [] }]);
    doSync(); closeM();
  };

  const addTx = (type) => {
    const cid = mCtx.cid || form.cid;
    if (!cid || !form.amt || !form.desc?.trim()) return;
    setCustomers((p) =>
      p.map((c) =>
        c.id !== cid ? c : { ...c, transactions: [...c.transactions, { id: nid(), type, amount: +form.amt, desc: form.desc.trim(), date: TODAY }] }
      )
    );
    doSync(); closeM();
  };

  const addCash = (type) => {
    if (!form.amt || !form.desc?.trim()) return;
    setCashbook((p) => [...p, { id: nid(), type, amount: +form.amt, desc: form.desc.trim(), category: form.cat || (type === "income" ? "Sales" : "Other"), date: cashDate }]);
    doSync(); closeM();
  };

  const addInv = () => {
    const items = (form.items || []).filter((i) => i.desc && i.amt);
    if (!form.iCust?.trim() || !items.length) return;
    const total = items.reduce((s, i) => s + +i.amt, 0);
    const inv = { id: nid(), customerName: form.iCust.trim(), items: items.map((i) => ({ desc: i.desc, amt: +i.amt })), total, date: TODAY };
    setInvoices((p) => [...p, inv]);
    setInvId(inv.id);
    doSync(); closeM(); setScreen("invoices");
  };

  const shiftDate = (d) => {
    const nd = new Date(cashDate);
    nd.setDate(nd.getDate() + d);
    if (nd <= new Date(TODAY)) setCashDate(nd.toISOString().split("T")[0]);
  };

  // ── Screen: Home ─────────────────────────────────────────────────────────
  const homeScreen = () => {
    const recent = [...cashbook].sort((a, b) => b.id - a.id).slice(0, 5);
    return (
      <div style={{ padding: "0 16px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 8px" }}>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 500, color: TEAL, letterSpacing: "-.2px" }}>Hamro Pasale</div>
            <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>
          <button onClick={doSync} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }} aria-label="Sync">
            <i
              className={`ti ${sync === "syncing" ? "ti-loader-2" : sync === "offline" ? "ti-wifi-off" : "ti-cloud-check"}`}
              style={{ fontSize: "22px", color: sync === "synced" ? TEAL : "var(--color-text-secondary)" }}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Today stats */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <Metric label="Today's income"  value={fmtNPR(todaySt.income)}  color={GREEN} icon="ti-arrow-up" />
          <Metric label="Today's expense" value={fmtNPR(todaySt.expense)} color={RED}   icon="ti-arrow-down" />
        </div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <Metric label="Net today"   value={(todaySt.net >= 0 ? "+" : "") + fmtNPR(todaySt.net)} color={todaySt.net >= 0 ? TEAL : RED} icon="ti-trending-up" />
          <Metric label="Outstanding" value={fmtNPR(totalOut)} color={AMBER} icon="ti-alert-circle" />
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: "10px" }}>Quick actions</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { label: "Credit",  icon: "ti-arrow-up-right",  color: RED,   action: () => openM("credit") },
              { label: "Payment", icon: "ti-arrow-down-left", color: TEAL,  action: () => openM("payment") },
              { label: "+ Sale",  icon: "ti-currency-rupee",  color: GREEN, action: () => openM("income") },
              { label: "Expense", icon: "ti-minus-circle",    color: AMBER, action: () => openM("expense") },
            ].map(({ label, icon, color, action }) => (
              <button
                key={label}
                onClick={action}
                style={{
                  flex: 1, padding: "10px 2px",
                  border: `0.5px solid ${color}40`,
                  borderRadius: "var(--border-radius-md)",
                  background: color + "10", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
                }}
              >
                <i className={`ti ${icon}`} style={{ fontSize: "20px", color }} aria-hidden="true" />
                <span style={{ fontSize: "11px", color, fontWeight: 500 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overdue dues */}
        {overdue.length > 0 && (
          <Card style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: 500 }}>
                <i className="ti ti-alert-circle" style={{ color: AMBER, marginRight: "5px", fontSize: "14px" }} aria-hidden="true" />
                Outstanding dues
              </span>
              <span style={{ fontSize: "11px", background: RED + "15", color: RED, padding: "2px 8px", borderRadius: "20px" }}>{overdue.length} due</span>
            </div>
            {overdue.slice(0, 3).map((c) => (
              <div
                key={c.id}
                onClick={() => { setCustId(c.id); setScreen("custDetail"); }}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer" }}
              >
                <Avt name={c.name} size={32} color={RED} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{ago(c.lastDate)}</div>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 500, color: RED, flexShrink: 0 }}>{fmtNPR(c.balance)}</span>
                <i className="ti ti-chevron-right" style={{ fontSize: "14px", color: "var(--color-text-secondary)" }} aria-hidden="true" />
              </div>
            ))}
            {overdue.length > 3 && (
              <button onClick={() => go("customers")} style={{ width: "100%", padding: "8px 0", background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: TEAL, marginTop: "4px" }}>
                View all {overdue.length} overdue →
              </button>
            )}
          </Card>
        )}

        {/* Recent activity */}
        <Card>
          <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "10px" }}>Recent activity</div>
          {recent.map((e) => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: (e.type === "income" ? GREEN : RED) + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={`ti ${e.type === "income" ? "ti-arrow-up" : "ti-arrow-down"}`} style={{ fontSize: "12px", color: e.type === "income" ? GREEN : RED }} aria-hidden="true" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.desc}</div>
                <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{fmtDate(e.date)} · {e.category}</div>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 500, color: e.type === "income" ? GREEN : RED, flexShrink: 0 }}>
                {e.type === "income" ? "+" : "-"}{fmtNPR(e.amount)}
              </span>
            </div>
          ))}
        </Card>
      </div>
    );
  };

  // ── Screen: Customers ─────────────────────────────────────────────────────
  const customersScreen = () => (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 12px" }}>
        <span style={{ fontSize: "18px", fontWeight: 500 }}>Customer Khata</span>
        <BtnFill label="+ New" onClick={() => openM("addCust")} style={{ padding: "7px 14px", fontSize: "13px", borderRadius: "20px" }} />
      </div>

      <div style={{ position: "relative", marginBottom: "12px" }}>
        <i className="ti ti-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "15px", color: "var(--color-text-secondary)" }} aria-hidden="true" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers…" aria-label="Search customers" style={{ paddingLeft: "36px" }} />
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        <Metric label="Customers"  value={customers.length} icon="ti-users" />
        <Metric label="Total due" value={fmtNPR(totalOut)} color={RED} icon="ti-alert-circle" />
      </div>

      {filtCust.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-secondary)" }}>
          <i className="ti ti-users-off" style={{ fontSize: "36px", display: "block", marginBottom: "8px" }} aria-hidden="true" />
          No customers found
        </div>
      ) : (
        filtCust.map((c) => (
          <Card key={c.id} style={{ marginBottom: "10px" }} onClick={() => { setCustId(c.id); setScreen("custDetail"); }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Avt name={c.name} size={40} color={c.balance > 0 ? RED : TEAL} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{c.phone || "No phone"} · {ago(c.lastDate)}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {c.balance > 0 ? (
                  <>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: RED }}>{fmtNPR(c.balance)}</div>
                    <div style={{ fontSize: "11px", color: RED }}>Due</div>
                  </>
                ) : (
                  <div style={{ fontSize: "12px", background: TEAL + "15", color: TEAL, padding: "3px 8px", borderRadius: "12px" }}>✓ Settled</div>
                )}
              </div>
              <i className="ti ti-chevron-right" style={{ fontSize: "16px", color: "var(--color-text-secondary)" }} aria-hidden="true" />
            </div>
          </Card>
        ))
      )}
    </div>
  );

  // ── Screen: Customer Detail ───────────────────────────────────────────────
  const custDetailScreen = () => {
    if (!selCust) return null;
    const c = selCust;
    const sorted = [...c.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    const waMsg = `Namaskar ${c.name.split(" ")[0]} ji,\n\nAapko Hamro Pasale ma ${fmtNPR(c.balance)} tirnu baki chha.\n\nKripa garni payment garnus.\n\nDhanyabad!`;

    return (
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 0 8px" }}>
          <button onClick={() => setScreen("customers")} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
            <i className="ti ti-arrow-left" style={{ fontSize: "22px" }} aria-hidden="true" />
          </button>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 500 }}>{c.name}</div>
            {c.phone && <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{c.phone}</div>}
          </div>
        </div>

        <Card style={{ marginBottom: "14px", borderColor: c.balance > 0 ? RED + "40" : TEAL + "40" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <Metric label="Total credit given" value={fmtNPR(c.credit)} color={RED} />
            <Metric label="Total received"     value={fmtNPR(c.paid)}   color={TEAL} />
          </div>
          <div style={{ textAlign: "center", padding: "12px", background: (c.balance > 0 ? RED : TEAL) + "10", borderRadius: "var(--border-radius-md)" }}>
            <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginBottom: "2px" }}>Balance</div>
            <div style={{ fontSize: "24px", fontWeight: 500, color: c.balance > 0 ? RED : c.balance < 0 ? GREEN : TEAL }}>
              {c.balance > 0 ? fmtNPR(c.balance) + " due" : c.balance < 0 ? fmtNPR(Math.abs(c.balance)) + " advance" : "Settled ✓"}
            </div>
          </div>
        </Card>

        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <BtnLine label="Give Credit"     icon="ti-arrow-up-right"  color={RED}  onClick={() => openM("credit",  { cid: c.id })} style={{ flex: 1 }} />
          <BtnFill label="Record Payment"  icon="ti-arrow-down-left"              onClick={() => openM("payment", { cid: c.id })} style={{ flex: 1 }} />
        </div>

        {c.balance > 0 && c.phone && (
          <button
            onClick={() => window.open(`https://wa.me/${c.phone}?text=${encodeURIComponent(waMsg)}`)}
            style={{ width: "100%", padding: "10px", marginBottom: "14px", background: WA + "15", border: `0.5px solid ${WA}`, borderRadius: "var(--border-radius-md)", cursor: "pointer", color: "#0A7B3A", fontWeight: 500, fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          >
            <i className="ti ti-brand-whatsapp" style={{ fontSize: "16px" }} aria-hidden="true" />
            Send payment reminder via WhatsApp
          </button>
        )}

        <Card>
          <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>History ({sorted.length})</div>
          {sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", fontSize: "13px", color: "var(--color-text-secondary)" }}>No transactions yet</div>
          ) : (
            sorted.map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: (t.type === "credit" ? RED : TEAL) + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={`ti ${t.type === "credit" ? "ti-arrow-up-right" : "ti-arrow-down-left"}`} style={{ fontSize: "13px", color: t.type === "credit" ? RED : TEAL }} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.desc}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{fmtDate(t.date)}</div>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 500, color: t.type === "credit" ? RED : TEAL, flexShrink: 0 }}>
                  {t.type === "credit" ? "+" : "-"}{fmtNPR(t.amount)}
                </span>
              </div>
            ))
          )}
        </Card>
      </div>
    );
  };

  // ── Screen: Cashbook ──────────────────────────────────────────────────────
  const cashbookScreen = () => {
    const entries = [...dateSt.entries].sort((a, b) => b.id - a.id);
    return (
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ padding: "16px 0 12px", fontSize: "18px", fontWeight: 500 }}>Daily Cashbook</div>

        <div style={{ display: "flex", alignItems: "center", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "6px 12px", marginBottom: "14px" }}>
          <button onClick={() => shiftDate(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
            <i className="ti ti-chevron-left" style={{ fontSize: "18px" }} aria-hidden="true" />
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "15px", fontWeight: 500 }}>{cashDate === TODAY ? "Today" : fmtDate(cashDate)}</div>
            {cashDate !== TODAY && <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{new Date(cashDate).toLocaleDateString("en-IN", { weekday: "long" })}</div>}
          </div>
          <button onClick={() => shiftDate(1)} disabled={cashDate >= TODAY} style={{ background: "none", border: "none", cursor: cashDate >= TODAY ? "not-allowed" : "pointer", padding: "4px", opacity: cashDate >= TODAY ? 0.3 : 1 }}>
            <i className="ti ti-chevron-right" style={{ fontSize: "18px" }} aria-hidden="true" />
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <Metric label="Income"  value={fmtNPR(dateSt.income)}  color={GREEN} icon="ti-arrow-up" />
          <Metric label="Expense" value={fmtNPR(dateSt.expense)} color={RED}   icon="ti-arrow-down" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: (dateSt.net >= 0 ? GREEN : RED) + "10", borderRadius: "var(--border-radius-md)", marginBottom: "14px" }}>
          <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Net profit / loss</span>
          <span style={{ fontSize: "17px", fontWeight: 500, color: dateSt.net >= 0 ? GREEN : RED }}>{dateSt.net >= 0 ? "+" : ""}{fmtNPR(dateSt.net)}</span>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          <BtnLine label="+ Income"  icon="ti-arrow-up"   color={GREEN} onClick={() => openM("income")}  style={{ flex: 1 }} />
          <BtnLine label="+ Expense" icon="ti-arrow-down" color={RED}   onClick={() => openM("expense")} style={{ flex: 1 }} />
        </div>

        {entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-secondary)" }}>
            <i className="ti ti-book-off" style={{ fontSize: "36px", display: "block", marginBottom: "8px" }} aria-hidden="true" />
            No entries for this day
          </div>
        ) : (
          <Card>
            {entries.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: (e.type === "income" ? GREEN : RED) + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={`ti ${e.type === "income" ? "ti-arrow-up" : "ti-arrow-down"}`} style={{ fontSize: "13px", color: e.type === "income" ? GREEN : RED }} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.desc}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{e.category}</div>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 500, color: e.type === "income" ? GREEN : RED, flexShrink: 0 }}>
                  {e.type === "income" ? "+" : "-"}{fmtNPR(e.amount)}
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>
    );
  };

  // ── Screen: Invoices ──────────────────────────────────────────────────────
  const invoicesScreen = () => {
    if (selInv) {
      const waMsg = `*Hamro Pasale*\nInvoice #${String(selInv.id).padStart(3, "0")}\nDate: ${fmtDate(selInv.date)}\nCustomer: ${selInv.customerName}\n\n${selInv.items.map((i) => `• ${i.desc}: Rs. ${i.amt.toLocaleString("en-IN")}`).join("\n")}\n\n*Total: ${fmtNPR(selInv.total)}*\n\nThank you for your business!`;
      return (
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 0 8px" }}>
            <button onClick={() => setInvId(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
              <i className="ti ti-arrow-left" style={{ fontSize: "22px" }} aria-hidden="true" />
            </button>
            <span style={{ fontSize: "17px", fontWeight: 500 }}>Invoice #{String(selInv.id).padStart(3, "0")}</span>
          </div>

          <Card style={{ marginBottom: "16px" }}>
            <div style={{ textAlign: "center", paddingBottom: "16px", marginBottom: "16px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ fontSize: "20px", fontWeight: 500, color: TEAL }}>Hamro Pasale</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Digital Invoice</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>Bill to</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{selInv.customerName}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>Date</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{fmtDate(selInv.date)}</div>
              </div>
            </div>
            <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "10px 12px", marginBottom: "12px" }}>
              {selInv.items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < selInv.items.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                  <span style={{ fontSize: "13px" }}>{item.desc}</span>
                  <span style={{ fontSize: "13px", fontWeight: 500 }}>{fmtNPR(item.amt)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "15px", fontWeight: 500 }}>Total</span>
              <span style={{ fontSize: "18px", fontWeight: 500, color: TEAL }}>{fmtNPR(selInv.total)}</span>
            </div>
          </Card>

          <BtnFill
            label="Share via WhatsApp"
            icon="ti-brand-whatsapp"
            color={WA}
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(waMsg)}`)}
            style={{ width: "100%", justifyContent: "center" }}
          />
        </div>
      );
    }

    return (
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 12px" }}>
          <span style={{ fontSize: "18px", fontWeight: 500 }}>Invoices</span>
          <BtnFill label="+ New" onClick={() => openM("createInv")} style={{ padding: "7px 14px", fontSize: "13px", borderRadius: "20px" }} />
        </div>
        {invoices.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-secondary)" }}>
            <i className="ti ti-receipt-off" style={{ fontSize: "36px", display: "block", marginBottom: "8px" }} aria-hidden="true" />
            No invoices yet
          </div>
        ) : (
          [...invoices].reverse().map((inv) => (
            <Card key={inv.id} style={{ marginBottom: "10px" }} onClick={() => setInvId(inv.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 40, height: 40, borderRadius: "var(--border-radius-md)", background: TEAL + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className="ti ti-receipt" style={{ fontSize: "18px", color: TEAL }} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>#{String(inv.id).padStart(3, "0")} · {inv.customerName}</div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{fmtDate(inv.date)} · {inv.items.length} item{inv.items.length > 1 ? "s" : ""}</div>
                </div>
                <span style={{ fontSize: "15px", fontWeight: 500, color: TEAL }}>{fmtNPR(inv.total)}</span>
                <i className="ti ti-chevron-right" style={{ fontSize: "16px", color: "var(--color-text-secondary)" }} aria-hidden="true" />
              </div>
            </Card>
          ))
        )}
      </div>
    );
  };

  // ── Modals ────────────────────────────────────────────────────────────────
  const renderModal = () => {
    if (!modal) return null;

    if (modal === "addCust") return (
      <Sheet title="Add new customer" onClose={closeM}>
        <Fld label="Name *">
          <input type="text" placeholder="e.g. Ram Bahadur" value={form.name || ""} onChange={(e) => sF("name", e.target.value)} autoFocus />
        </Fld>
        <Fld label="Phone (optional)">
          <input type="tel" placeholder="98XXXXXXXX" value={form.phone || ""} onChange={(e) => sF("phone", e.target.value)} />
        </Fld>
        <BtnFill label="Add customer" onClick={addCust} style={{ width: "100%", justifyContent: "center", marginTop: "8px", opacity: form.name?.trim() ? 1 : 0.45 }} />
      </Sheet>
    );

    if (modal === "credit" || modal === "payment") {
      const isCr = modal === "credit";
      const col = isCr ? RED : TEAL;
      return (
        <Sheet title={isCr ? "Give credit to customer" : "Record payment received"} onClose={closeM}>
          {!mCtx.cid ? (
            <Fld label="Customer">
              <select value={form.cid || ""} onChange={(e) => sF("cid", +e.target.value)}>
                <option value="">Choose customer…</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Fld>
          ) : (
            <div style={{ padding: "10px 12px", background: col + "10", borderRadius: "var(--border-radius-md)", marginBottom: "14px", fontSize: "14px", fontWeight: 500, color: col }}>
              {cwb.find((c) => c.id === mCtx.cid)?.name}
            </div>
          )}
          <Fld label="Amount (Rs.) *">
            <input type="number" placeholder="0" value={form.amt || ""} onChange={(e) => sF("amt", e.target.value)} style={{ fontSize: "22px" }} autoFocus={!!mCtx.cid} />
          </Fld>
          <Fld label="Description *">
            <input type="text" placeholder={isCr ? "e.g. Rice 5kg, Dal 2kg" : "e.g. Cash payment"} value={form.desc || ""} onChange={(e) => sF("desc", e.target.value)} />
          </Fld>
          <BtnFill label={isCr ? "Record credit" : "Record payment"} color={col} onClick={() => addTx(isCr ? "credit" : "payment")} style={{ width: "100%", justifyContent: "center", marginTop: "8px" }} />
        </Sheet>
      );
    }

    if (modal === "income" || modal === "expense") {
      const isInc = modal === "income";
      const col = isInc ? GREEN : RED;
      const cats = isInc
        ? ["Sales", "Payment received", "Interest", "Other"]
        : ["Stock", "Rent", "Utilities", "Salary", "Transport", "Other"];
      return (
        <Sheet title={isInc ? "Add income" : "Add expense"} onClose={closeM}>
          <Fld label="Amount (Rs.) *">
            <input type="number" placeholder="0" value={form.amt || ""} onChange={(e) => sF("amt", e.target.value)} style={{ fontSize: "22px" }} autoFocus />
          </Fld>
          <Fld label="Category">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {cats.map((cat) => (
                <button
                  key={cat}
                  onClick={() => sF("cat", cat)}
                  style={{ padding: "5px 12px", borderRadius: "20px", border: `0.5px solid ${form.cat === cat ? col : "var(--color-border-secondary)"}`, background: form.cat === cat ? col + "15" : "none", cursor: "pointer", fontSize: "12px", color: form.cat === cat ? col : "var(--color-text-secondary)", fontWeight: form.cat === cat ? 500 : 400 }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Fld>
          <Fld label="Description *">
            <input type="text" placeholder={isInc ? "e.g. Counter sales" : "e.g. Monthly rent"} value={form.desc || ""} onChange={(e) => sF("desc", e.target.value)} />
          </Fld>
          <BtnFill label={isInc ? "Add income" : "Add expense"} color={col} onClick={() => addCash(isInc ? "income" : "expense")} style={{ width: "100%", justifyContent: "center", marginTop: "8px" }} />
        </Sheet>
      );
    }

    if (modal === "createInv") {
      const items = form.items || [{ desc: "", amt: "" }];
      const upd = (i, k, v) => setForm((f) => ({ ...f, items: (f.items || [{ desc: "", amt: "" }]).map((it, idx) => idx === i ? { ...it, [k]: v } : it) }));
      const total = items.reduce((s, i) => s + (+i.amt || 0), 0);
      return (
        <Sheet title="Create invoice" onClose={closeM}>
          <Fld label="Customer name *">
            <input type="text" placeholder="Customer name" value={form.iCust || ""} onChange={(e) => sF("iCust", e.target.value)} autoFocus />
          </Fld>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", display: "block", marginBottom: "6px" }}>Items *</label>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                <input placeholder="Item description" value={item.desc} onChange={(e) => upd(i, "desc", e.target.value)} style={{ flex: 2 }} />
                <input type="number" placeholder="Rs." value={item.amt} onChange={(e) => upd(i, "amt", e.target.value)} style={{ flex: 1 }} />
                {items.length > 1 && (
                  <button onClick={() => setForm((f) => ({ ...f, items: (f.items || []).filter((_, idx) => idx !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: RED, padding: "4px", flexShrink: 0 }}>
                    <i className="ti ti-trash" style={{ fontSize: "16px" }} aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setForm((f) => ({ ...f, items: [...(f.items || [{ desc: "", amt: "" }]), { desc: "", amt: "" }] }))} style={{ fontSize: "12px", color: TEAL, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "4px 0" }}>
              <i className="ti ti-plus" style={{ fontSize: "14px" }} aria-hidden="true" />
              Add item
            </button>
          </div>
          {total > 0 && <div style={{ textAlign: "right", fontSize: "16px", fontWeight: 500, color: TEAL, marginBottom: "12px" }}>Total: {fmtNPR(total)}</div>}
          <BtnFill label="Create invoice" onClick={addInv} style={{ width: "100%", justifyContent: "center" }} />
        </Sheet>
      );
    }

    return null;
  };

  // ── Root render ───────────────────────────────────────────────────────────
  const SCREENS = {
    home:       homeScreen,
    customers:  customersScreen,
    custDetail: custDetailScreen,
    cashbook:   cashbookScreen,
    analytics:  () => <AnalyticsScreen cashbook={cashbook} customers={cwb} />,
    invoices:   invoicesScreen,
  };

  const showNav = screen !== "custDetail";

  return (
    <div style={{ maxWidth: "420px", margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "720px", background: "var(--color-background-tertiary)", position: "relative", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
      <h2 className="sr-only">Hamro Khata — Digital Business Ledger for Nepal</h2>

      {/* Main content area */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {(SCREENS[screen] || homeScreen)()}
      </div>

      {/* Bottom navigation */}
      {showNav && (
        <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-primary)", display: "flex", padding: "6px 0 10px", flexShrink: 0 }}>
          {[
            { id: "home",      icon: "ti-home",      label: "Home" },
            { id: "customers", icon: "ti-users",     label: "Khata" },
            { id: "cashbook",  icon: "ti-book",      label: "Cashbook" },
            { id: "analytics", icon: "ti-chart-bar", label: "Reports" },
            { id: "invoices",  icon: "ti-receipt",   label: "Invoice" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => go(t.id)}
              style={{ flex: 1, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "4px 0", color: screen === t.id ? TEAL : "var(--color-text-secondary)" }}
            >
              <i className={`ti ${t.icon}`} style={{ fontSize: "21px" }} aria-hidden="true" />
              <span style={{ fontSize: "10px", fontWeight: screen === t.id ? 500 : 400 }}>{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Modal overlay */}
      {renderModal()}
    </div>
  );
}
