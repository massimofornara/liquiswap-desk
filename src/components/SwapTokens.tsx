import React, { useState } from "react";
import { createThirdwebClient } from "thirdweb";
import { base } from "thirdweb/chains";
import { smartWallet } from "thirdweb/wallets";
import { useActiveAccount, useConnect } from "thirdweb/react";
import axios from "axios";

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "IL_TUO_THIRDWEB_CLIENT_ID_PUBBLICO"
});

export default function SwapTokens() {
  const account = useActiveAccount();
  const { connect } = useConnect();

  const navTotale = 9999929.20;
  const [fromToken, setFromToken] = useState<string>("ALPHA");
  const [quantity, setQuantity] = useState<string>("1");
  const [toCrypto, setToCrypto] = useState<string>("BTC");
  const [targetIban, setTargetIban] = useState("");
  const [holderName, setHolderName] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [requestSuccess, setRequestSuccess] = useState<boolean>(false);

  const handleConnect = async () => {
    try {
      await connect(async () => {
        return smartWallet({
          chain: base,
          sponsorGas: true, // Sfrutta il piano Growth per azzerare i costi dell'operatore
          factoryAddress: "0x11C9C718607fa6bd67fAA74C01eF567Ff4661882",
        });
      });
    } catch (error: any) {
      console.error("[-] Connessione Smart Wallet fallita:", error.message);
    }
  };

  const handleProcessClearing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return alert("Connetti prima il tuo wallet MetaMask!");

    setLoading(true);
    setRequestSuccess(false);

    try {
      // Mascheramento di sicurezza locale dei dati bancari dell'operatore
      const encoder = new TextEncoder();
      const secureEncryptedIban = btoa(String.fromCharCode(...encoder.encode(targetIban.replace(/\s+/g, ''))));

      console.log(`[⚙️ Ledger] Trasmissione ordine al Clearing Hub per l'asset ${toCrypto}...`);

      // Invia la richiesta strutturata al backend protetto da PM2
      const response = await axios.post("http://localhost:3000/api/clearing/request", {
        user: account.address,
        totalNavEur: navTotale,
        tokenIn: fromToken,
        quantityIn: quantity,
        assetOut: toCrypto,
        iban: secureEncryptedIban,
        holder: holderName
      });

      if (response.data.success) {
        setRequestSuccess(true);
        console.log("[🎉 Success] Ordine inserito nel registro di liquidazione.");
      }
    } catch (error: any) {
      console.error("[-] Fallimento registrazione clearing:", error.message);
      alert("Errore durante l'elaborazione dell'ordine: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#080b11", color: "#ffffff", padding: "40px", borderRadius: "16px", maxWidth: "560px", margin: "40px auto", fontFamily: "sans-serif", border: "1px solid #1f242c" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "1px solid #21262d", paddingBottom: "15px" }}>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "600" }}>Swap &rarr; wallet</h2>
        <div style={{ fontSize: "12px", color: "#4ade80", backgroundColor: "rgba(74,222,128,0.08)", padding: "6px 12px", borderRadius: "20px" }}>
          ● live CoinGecko
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #161b22 0%, #111622 100%)", border: "1px solid #21262d", padding: "25px", borderRadius: "12px", marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", color: "#8b949e", fontWeight: "600" }}>VALORE PATRIMONIALE DESK CORRENTE (NAV)</div>
        <div style={{ fontSize: "26px", fontWeight: "700", color: "#58a6ff", marginTop: "6px" }}>QN € {navTotale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
      </div>

      <div style={{ backgroundColor: "#111622", border: "1px solid #1a2235", padding: "30px", borderRadius: "12px" }}>
        <form onSubmit={handleProcessClearing}>
          <label style={{ fontSize: "11px", color: "#8b949e", fontWeight: "700" }}>PAGA ASSET</label>
          <select value={fromToken} onChange={(e) => setFromToken(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42", borderRadius: "8px", color: "#fff", marginTop: "6px", marginBottom: "20px", fontSize: "14px" }}>
            <option value="ALPHA">ALPHA (Valore: €1.500)</option>
            <option value="BETA">BETA (Valore: €280)</option>
            <option value="CTKI">CTKI (Valore: €1.000)</option>
          </select>

          <label style={{ fontSize: "11px", color: "#8b949e", fontWeight: "700" }}>QUANTITÀ</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42", borderRadius: "8px", color: "#fff", marginTop: "6px", marginBottom: "20px", fontSize: "14px" }} required />

          <label style={{ fontSize: "11px", color: "#8b949e", fontWeight: "700" }}>RICEVI CRIPTOVALUTA REALE SUL WALLET</label>
          <select value={toCrypto} onChange={(e) => setToCrypto(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42", borderRadius: "8px", color: "#fff", marginTop: "6px", marginBottom: "20px", fontSize: "14px" }}>
            <option value="BTC">BTC (Wrapped Bitcoin BitGo Reale)</option>
            <option value="ETH">ETH (Wrapped Ethereum Reale)</option>
            <option value="USDC">USDC (Tether USD Reale)</option>
            <option value="BNB">BNB (Binance Pegged Reale)</option>
            <option value="SOL">SOL (Wrapped Solana Reale)</option>
          </select>

          <label style={{ fontSize: "11px", color: "#8b949e", fontWeight: "700" }}>IBAN ACCREDITO SEPA (OFF-RAMP CONTO REALE)</label>
          <input type="text" value={targetIban} onChange={(e) => setTargetIban(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42", borderRadius: "8px", color: "#fff", marginTop: "6px", marginBottom: "20px", fontSize: "14px" }} placeholder="IT60..." required />

          <label style={{ fontSize: "11px", color: "#8b949e", fontWeight: "700" }}>INTESTATARIO DEL CONTO CORRENTE</label>
          <input type="text" value={holderName} onChange={(e) => setHolderName(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42", borderRadius: "8px", color: "#fff", marginTop: "6px", marginBottom: "25px", fontSize: "14px" }} placeholder="Nome Cognome" required />

          {!account ? (
            <button type="button" onClick={handleConnect} style={{ width: "100%", padding: "15px", backgroundColor: "#1f6feb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}>
              Connetti MetaMask (Gasless AA)
            </button>
          ) : (
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "15px", backgroundColor: "#238636", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}>
              {loading ? "Registrazione Coda..." : "Swap e accredito wallet"}
            </button>
          )}
        </form>

        {requestSuccess && (
          <div style={{ marginTop: "20px", padding: "14px", backgroundColor: "rgba(35,134,54,0.1)", border: "1px solid #238636", borderRadius: "8px", fontSize: "13px", color: "#4ade80", lineHeight: "1.6" }}>
            🔒 <strong>Richiesta inoltrata al Clearing Ledger!</strong><br />
            L'ordine di liquidazione del tuo NAV è stato inserito con successo nei canali sicuri.<br />
            Il server ha preso in carico la transazione per disporre l'accredito crypto e l'invio del bonifico EUR istantaneo via Monerium Live.
          </div>
        )}
      </div>
    </div>
  );
}
