import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import SwapTokens from "./components/SwapTokens";
import Trading from "./components/Trading";
import OffRampConto from "./components/OffRampConto";
import FinanceRamp from "./components/FinanceRamp";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  return (
    <div style={{ display: "flex", background: "#0d1117", minHeight: "100vh", color: "#c9d1d9" }}>
      {/* Menu laterale sinistro */}
      <Sidebar currentTab={activeTab} setActiveTab={setActiveTab} />

      {/* Area dei contenuti dinamici */}
      <div style={{ flex: 1, padding: "40px", boxSizing: "border-box", overflowY: "auto" }}>
        {activeTab === "dashboard" && (
          <div style={{ maxWidth: "800px", margin: "0 auto", background: "#161b22", padding: "30px", borderRadius: "12px", border: "1px solid #21262d" }}>
            <h2 style={{ marginTop: 0, color: "#fff" }}>Benvenuto nel tuo Creator Desk Enterprise</h2>
            <p style={{ color: "#8b949e", lineHeight: "1.6" }}>
              Seleziona una voce dal menu laterale per gestire gli swap istantanei senza gas on-chain,
              emettere asset illiquidi o processare prelievi con cifratura asimmetrica end-to-end.
            </p>
          </div>
        )}

        {activeTab === "swap" && <SwapTokens />}
        {activeTab === "trading" && <Trading />}
        {activeTab === "offramp-conto" && <OffRampConto />}
        {activeTab === "finance-ramp" && <FinanceRamp />}
      </div>
    </div>
  );
}
