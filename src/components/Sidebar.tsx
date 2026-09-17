import React from "react";

interface SidebarProps {
  currentTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setActiveTab }: SidebarProps) {
  // Struttura delle schede ereditata dalla documentazione del Desk Enterprise
  const menuItems = [
    { id: "dashboard", label: "📊 Panoramica Desk", icon: "💎" },
    { id: "swap", label: "🔄 Swap → Wallet", icon: "⚡" },
    { id: "trading", label: "📈 Mercati Trading", icon: "📊" },
    { id: "offramp-conto", label: "🏦 Off-Ramp Conto", icon: "🔒" },
    { id: "finance-ramp", label: "💳 Gateway Fiat", icon: "💶" }
  ];

  return (
    <div style={{ width: "260px", background: "#0b0e14", borderRight: "1px solid #21262d", height: "100vh", padding: "20px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <div style={{ paddingBottom: "20px", borderBottom: "1px solid #21262d", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, color: "#fff", fontSize: "18px", fontWeight: "600", letterSpacing: "0.5px" }}>LiquiSwap DESK</h3>
        <span style={{ fontSize: "11px", color: "#8b949e" }}>ORGANIZZAZIONE ENTERPRISE</span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "12px 16px",
                background: isActive ? "#1f6feb" : "transparent",
                color: isActive ? "#ffffff" : "#c9d1d9",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "14px",
                fontWeight: isActive ? "600" : "500",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "#161b22";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ paddingTop: "20px", borderTop: "1px solid #21262d", color: "#8b949e", fontSize: "12px", textAlign: "center" }}>
        🔒 E2E Encryption Active
      </div>
    </div>
  );
}
