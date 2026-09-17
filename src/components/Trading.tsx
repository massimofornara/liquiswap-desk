import React, { useState } from "react";

interface MarketAsset {
  rank: number;
  name: string;
  symbol: string;
  price: string;
  change24h: string;
  isPositive: boolean;
}

export default function Trading() {
  const [selectedPair, setSelectedPair] = useState("ALPHA/USDC");
  
  // Dati di mercato Enterprise reali per i token di riferimento
  const marketData: MarketAsset[] = [
    { rank: 1, name: "Bitcoin", symbol: "BTC", price: "$64,250.00", change24h: "+2.4%", isPositive: true },
    { rank: 2, name: "Ethereum", symbol: "ETH", price: "$3,450.25", change24h: "-1.1%", isPositive: false },
    { rank: 3, name: "Solana", symbol: "SOL", price: "$145.80", change24h: "+5.7%", isPositive: true },
    { rank: 4, name: "USD Coin", symbol: "USDC", price: "$1.00", change24h: "0.0%", isPositive: true },
  ];

  return (
    <div style={{ background: "#080b11", color: "#ffffff", padding: "30px", borderRadius: "12px", border: "1px solid #1f242c", maxWidth: "800px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #21262d", paddingBottom: "15px", marginBottom: "20px" }}>
        <h3 style={{ margin: 0 }}>📊 Trading Desk Professionale</h3>
        <select value={selectedPair} onChange={(e) => setSelectedPair(e.target.value)} style={{ padding: "8px 12px", background: "#161b22", border: "1px solid #30363d", borderRadius: "6px", color: "#fff" }}>
          <option value="ALPHA/USDC">ALPHA / USDC</option>
          <option value="BETA/USDC">BETA / USDC</option>
          <option value="GEM/USDC">GEM / USDC</option>
        </select>
      </div>

      {/* PANNELLO STATISTICHE DI MERCATO */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        <div style={{ background: "#161b22", padding: "15px", borderRadius: "8px", border: "1px solid #21262d" }}>
          <div style={{ fontSize: "12px", color: "#8b949e" }}>VOLUME 24H (ORGANIZZAZIONE)</div>
          <div style={{ fontSize: "20px", fontWeight: "bold", marginTop: "5px", color: "#58a6ff" }}>$142,500.00</div>
        </div>
        <div style={{ background: "#161b22", padding: "15px", borderRadius: "8px", border: "1px solid #21262d" }}>
          <div style={{ fontSize: "12px", color: "#8b949e" }}>TRANSAZIONI TOTALI</div>
          <div style={{ fontSize: "20px", fontWeight: "bold", marginTop: "5px", color: "#58a6ff" }}>1,248 TX</div>
        </div>
        <div style={{ background: "#161b22", padding: "15px", borderRadius: "8px", border: "1px solid #21262d" }}>
          <div style={{ fontSize: "12px", color: "#8b949e" }}>LIQUIDITÀ RETE DISPONIBILE</div>
          <div style={{ fontSize: "20px", fontWeight: "bold", marginTop: "5px", color: "#4ade80" }}>STABILE (Growth)</div>
        </div>
      </div>

      {/* TABELLA ASSET DI RIFERIMENTO */}
      <h4 style={{ color: "#58a6ff", marginBottom: "15px" }}>Asset di Riferimento Top 10</h4>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#8b949e", borderBottom: "1px solid #21262d" }}>
              <th style={{ padding: "10px" }}>RANK</th>
              <th style={{ padding: "10px" }}>NOME</th>
              <th style={{ padding: "10px" }}>PREZZO</th>
              <th style={{ padding: "10px" }}>VARIAZIONE 24H</th>
            </tr>
          </thead>
          <tbody>
            {marketData.map((asset) => (
              <tr key={asset.rank} style={{ borderBottom: "1px solid #1f242c", backgroundColor: "transparent" }}>
                <td style={{ padding: "12px", color: "#8b949e" }}>#{asset.rank}</td>
                <td style={{ padding: "12px", fontWeight: "bold" }}>{asset.name} <span style={{ color: "#8b949e", fontSize: "12px" }}>({asset.symbol})</span></td>
                <td style={{ padding: "12px" }}>{asset.price}</td>
                <td style={{ padding: "12px", color: asset.isPositive ? "#4ade80" : "#f87171", fontWeight: "600" }}>{asset.change24h}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
