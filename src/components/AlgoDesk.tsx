import React, { useState, useEffect } from "react";
import { createThirdwebClient, getContract } from "thirdweb";
import { base } from "thirdweb/chains";
import { useActiveAccount } from "thirdweb/react";
import axios from "axios";

export default function AlgoDesk() {
  const account = useActiveAccount();
  
  // Stati di controllo dei Bot Algoritmici
  const [isArbitrageActive, setIsArbitrageActive] = useState(false);
  const [isLimitOrderActive, setIsLimitOrderActive] = useState(false);
  const [isNavRebalanceActive, setIsNavRebalanceActive] = useState(false);
  
  // Log delle operazioni in tempo reale
  const [logs, setLogs] = useState<string[]>([
    "[i] Algoritmo inizializzato. In attesa di attivazione moduli..."
  ]);

  // Simulazione dell'attività dei bot quando sono attivi
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isArbitrageActive || isLimitOrderActive || isNavRebalanceActive) {
      interval = setInterval(() => {
        const newLogs = [...logs];
        if (isArbitrageActive && Math.random() > 0.6) {
          newLogs.unshift(`[📊 Arbitraggio] Rilevato spread ALPHA/USDC. Eseguito Swap Gasless. Profitto: +45.20 USDC`);
        }
        if (isLimitOrderActive && Math.random() > 0.8) {
          newLogs.unshift(`[⏳ Limit Order] Condizione BETA a €280 soddisfatta. Ordine inviato al backend.`);
        }
        if (isNavRebalanceActive && Math.random() > 0.7) {
          newLogs.unshift(`[⚖️ Ribilanciamento] NAV aggiornato (€ 9.999.929,20). Allocazione tesoreria stabile.`);
        }
        setLogs(newLogs.slice(0, 10)); // Mantiene solo gli ultimi 10 log per pulizia grafica
      }, 4000);
    }

    return () => clearInterval(interval);
  }, [isArbitrageActive, isLimitOrderActive, isNavRebalanceActive, logs]);

  const toggleBot = async (botName: string, currentState: boolean, setStatus: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!account) return alert("Connetti prima il tuo wallet MetaMask per autorizzare gli algoritmi!");
    
    const newState = !currentState;
    setStatus(newState);
    
    const statusText = newState ? "ATTIVATO 🟢" : "DISATTIVATO 🔴";
    const updatedLogs = [`[⚙️ System] Modulo ${botName} impostato su: ${statusText}`, ...logs];
    setLogs(updatedLogs);

    // Invia lo stato al backend di PM2 per mantenere l'automa attivo 24/7 fuori dal browser
    try {
      await axios.post("http://localhost:3000/api/algo/status", {
        bot: botName,
        active: newState,
        user: account.address
      });
    } catch (error) {
      console.error("[-] Errore sincronizzazione bot con il backend.");
    }
  };

  // Stili Dark in linea con l'allegato del tuo Desk
  const cardStyle = {
    backgroundColor: "#111622", border: "1px solid #1a2235", padding: "20px", borderRadius: "8px",
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px"
  };

  const btnStyle = (active: boolean) => ({
    padding: "10px 20px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold",
    backgroundColor: active ? "#ef4444" : "#238636", color: "#fff", minWidth: "120px"
  });

  return (
    <div style={{ background: "#080b11", color: "#ffffff", padding: "40px", borderRadius: "12px", maxWidth: "750px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <div style={{ borderBottom: "1px solid #21262d", paddingBottom: "15px", marginBottom: "25px" }}>
        <h2 style={{ margin: 0, fontSize: "24px" }}>Algo desk</h2>
        <p style={{ color: "#8b949e", fontSize: "14px", margin: "5px 0 0 0" }}>Gestione e monitoraggio dei Bot di trading automatico ad alta frequenza a gas zero.</p>
      </div>

      {!account && (
        <div style={{ textAlign: "center", padding: "20px", color: "#8b949e", backgroundColor: "#111622", borderRadius: "8px", border: "1px solid #1a2235", marginBottom: "20px" }}>
          🔒 Connetti il tuo wallet nella scheda principale per sbloccare i controlli algoritmici.
        </div>
      )}

      {/* PANNELLO CONTROLLO BOT */}
      <div style={{ opacity: account ? 1 : 0.4, pointerEvents: account ? "auto" : "none" }}>
        
        {/* BOT 1: ARBITRAGGIO */}
        <div style={cardStyle}>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>Bot di Arbitraggio Flash</div>
            <div style={{ fontSize: "13px", color: "#8b949e", marginTop: "4px" }}>Sfrutta le differenze di prezzo tra il Book interno ed i DEX esterni (Uniswap).</div>
          </div>
          <button onClick={() => toggleBot("Arbitrage", isArbitrageActive, setIsArbitrageActive)} style={btnStyle(isArbitrageActive)}>
            {isArbitrageActive ? "Spegni" : "Attiva Bot"}
          </button>
        </div>

        {/* BOT 2: ORDINI LIMITE */}
        <div style={cardStyle}>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>Esecuzione Limit Orders Differiti</div>
            <div style={{ fontSize: "13px", color: "#8b949e", marginTop: "4px" }}>Invia transazioni automatiche on-chain solo quando un asset tocca il prezzo target.</div>
          </div>
          <button onClick={() => toggleBot("LimitOrders", isLimitOrderActive, setIsLimitOrderActive)} style={btnStyle(isLimitOrderActive)}>
            {isLimitOrderActive ? "Spegni" : "Attiva Bot"}
          </button>
        </div>

        {/* BOT 3: REBALANCE NAV */}
        <div style={cardStyle}>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>Ribilanciamento Automatico NAV & Tesoreria</div>
            <div style={{ fontSize: "13px", color: "#8b949e", marginTop: "4px" }}>Protegge il capitale (€ 9.999.929,20) diversificando gli asset in caso di alta volatilità.</div>
          </div>
          <button onClick={() => toggleBot("NavRebalance", isNavRebalanceActive, setIsNavRebalanceActive)} style={btnStyle(isNavRebalanceActive)}>
            {isNavRebalanceActive ? "Spegni" : "Attiva Bot"}
          </button>
        </div>

      </div>

      {/* TERMINALE DEI LOG IN TEMPO REALE */}
      <h4 style={{ color: "#58a6ff", marginTop: "30px", marginBottom: "10px" }}>Console di Monitoraggio (Live Stream)</h4>
      <div style={{ background: "#000", fontFamily: "monospace", padding: "15px", borderRadius: "8px", border: "1px solid #21262d", minHeight: "180px", fontSize: "13px", color: "#4ade80", overflowY: "auto" }}>
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: "6px", lineHeight: "1.4" }}>{log}</div>
        ))}
      </div>
    </div>
  );
}
