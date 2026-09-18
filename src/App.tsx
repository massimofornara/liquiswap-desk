import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import SwapTokens from "./components/SwapTokens";
import Trading from "./components/Trading";
import OffRampConto from "./components/OffRampConto";
import FinanceRamp from "./components/FinanceRamp";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  return (
    <div style={{ display: "flex", background: "#0d1117", minHeight: "100vh", color: "#c9d1d9", fontFamily: "sans-serif" }}>
      {/* Menu laterale sinistro Cyber-Dark */}
      <Sidebar currentTab={activeTab} setActiveTab={setActiveTab} />

      {/* Area dei contenuti dinamica basata sul selettore della Sidebar */}
      <div style={{ flex: 1, padding: "40px", boxSizing: "border-box", overflowY: "auto" }}>
        
        {/* DASHBOARD INTEGRATA E PULITA (Risolve il named export broken dello ZIP) */}
        {activeTab === "dashboard" && (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid #21262d", paddingBottom: "15px" }}>
              <h2 style={{ margin: 0, color: "#fff", fontSize: "24px" }}>📊 Creator Desk Panoramica</h2>
              <div style={{ fontSize: "12px", color: "#1f6feb", background: "rgba(31,110,235,0.1)", padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(31,110,235,0.2)" }}>
                Rete: Base Mainnet · Connesso Pro
              </div>
            </div>
            
            <div style={{ background: "linear-gradient(135deg, #161b22 0%, #0d1117 100%)", border: "1px solid #21262d", padding: "30px", borderRadius: "12px", marginBottom: "25px" }}>
              <h3 style={{ marginTop: 0, color: "#fff" }}>Infrastruttura Enterprise Attiva</h3>
              <p style={{ color: "#8b949e", lineHeight: "1.6", fontSize: "15px" }}>
                Il Desk è operativo su scala globale. Le transazioni e gli swap di criptovalute reali 
                sono interamente sponsorizzati a gas zero (0 gas) tramite il piano Growth, e i canali 
                di Off-Ramp bancario sono agganciati h24 alle API di Monerium Live su PM2.
              </p>
            </div>
          </div>
        )}

        {activeTab === "swap" && <SwapTokens />}
        {activeTab === "trading" && <Trading />}
        {activeTab === "offramp" && <OffRampConto />}
        {activeTab === "onramp" && <FinanceRamp />}
      </div>
    </div>
  );
}
