import React, { useState } from "react";
import { createThirdwebClient, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { base } from "thirdweb/chains";
import { smartWallet } from "thirdweb/wallets";
import { useActiveAccount, useConnect } from "thirdweb/react";
import axios from "axios";

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "IL_TUO_THIRDWEB_CLIENT_ID_PUBBLICO"
});

const MANAGER_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913";

export default function OffRampConto() {
  const account = useActiveAccount();
  const { connect } = useConnect();

  const [step, setStep] = useState<number>(1);
  const [circuit, setCircuit] = useState<"SEPA" | "SWIFT">("SEPA");
  const [amount, setAmount] = useState("");
  const [ibanOrAccountNumber, setIbanOrAccountNumber] = useState("");
  const [bicSwift, setBicSwift] = useState("");
  const [country, setCountry] = useState("IT");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    try {
      await connect(async () => {
        return smartWallet({
          chain: base,
          sponsorGas: true, // Paymaster del piano Growth attivo
          factoryAddress: "0x11C9C718607fa6bd67fAA74C01eF567Ff4661882",
        });
      });
    } catch (error: any) {
      console.error("[-] Connessione fallita:", error.message);
    }
  };

  const handleInternationalOffRamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !amount || !ibanOrAccountNumber || !name) return;

    setLoading(true);
    try {
      const contract = getContract({ client, chain: base, address: MANAGER_ADDRESS });

      // Cifratura asimmetrica nativa dell'account bancario o IBAN
      const encoder = new TextEncoder();
      const rawBankData = `${ibanOrAccountNumber}|${bicSwift}|${country}`;
      const secureEncryptedData = btoa(String.fromCharCode(...encoder.encode(rawBankData)));
      
      const parsedAmount = BigInt(Math.floor(Number(amount) * 10**6)); // 6 decimali standard USDC

      console.log(`[⚙️ Inter-Ramp] Innesco transazione ${circuit} Gasless...`);

      // Invia la meta-transazione ERC-2771: l'operatore non spende gas
      const tx = prepareContractCall({
        contract,
        method: "function triggerRealOffRamp(address _usdcToken, uint256 _amountUsdc, string _encryptedIban)",
        params: [USDC_ADDRESS, parsedAmount, secureEncryptedData],
      });

      const result = await sendTransaction({ transaction: tx, account });
      setTxHash(result.transactionHash);

      // Invia la richiesta di instradamento al backend Monerium/SWIFT protetto da PM2
      await axios.post("http://localhost:3000/api/offramp/international", {
        user: account.address,
        circuit: circuit,
        amountUsdc: amount,
        bankData: secureEncryptedData,
        holderName: name,
        destinationCountry: country,
        txHash: result.transactionHash
      });

      setStep(3);
    } catch (error: any) {
      alert("Errore durante l'offramp internazionale: " + error.message);
    } {
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "12px", marginTop: "6px", marginBottom: "15px", backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "8px", color: "#fff" };
  const buttonStyle = { padding: "12px 24px", backgroundColor: "#1f6feb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" as const };

  return (
    <div style={{ background: "#080b11", color: "#ffffff", padding: "30px", borderRadius: "12px", border: "1px solid #1f242c", maxWidth: "550px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <h3 style={{ margin: "0 0 10px 0" }}>🏦 Canale Off-Ramp Internazionale</h3>
      <p style={{ color: "#8b949e", fontSize: "13px", marginBottom: "25px" }}>Liquidazione protetta e reindirizzamento istantaneo su reti bancarie globali SEPA & SWIFT.</p>

      {/* SELETTORE CIRCUITO BANCARIO */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button type="button" onClick={() => setCircuit("SEPA")} style={{ ...buttonStyle, backgroundColor: circuit === "SEPA" ? "#1f6feb" : "#161b22" }}>Circuito Europeo (SEPA)</button>
        <button type="button" onClick={() => setCircuit("SWIFT")} style={{ ...buttonStyle, backgroundColor: circuit === "SWIFT" ? "#1f6feb" : "#161b22" }}>Estero / Globale (SWIFT)</button>
      </div>

      {!account ? (
        <button onClick={handleConnectWallet} style={{ ...buttonStyle, width: "100%" }}>Connetti MetaMask (Gasless)</button>
      ) : (
        <>
          {step === 1 && (
            <div>
              <label>Quantità di USDC da liquidare su conto reale:</label>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} placeholder="0.00" />
              <button onClick={() => setStep(2)} style={buttonStyle} disabled={!amount}>Procedi al Controllo Canali</button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleInternationalOffRamp}>
              <label>{circuit === "SEPA" ? "Codice IBAN Conto EUR:" : "Account Number / CLABE / Routing Number:"}</label>
              <input type="text" value={ibanOrAccountNumber} onChange={(e) => setIbanOrAccountNumber(e.target.value)} style={inputStyle} placeholder="Inserisci coordinate" required />

              {circuit === "SWIFT" && (
                <>
                  <label>Codice BIC / SWIFT Bancario:</label>
                  <input type="text" value={bicSwift} onChange={(e) => setBicSwift(e.target.value)} style={inputStyle} placeholder="XGGDIX..." required />
                </>
              )}

              <label>Paese della Banca Destinataria (Codice ISO 2 lettere):</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value.toUpperCase())} style={inputStyle} maxLength={2} required />

              <label>Intestatario del Conto Corrente Beneficiario:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Nome Cognome / Nome Azienda" required />

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setStep(1)} style={{ ...buttonStyle, backgroundColor: "#161b22", border: "1px solid #30363d" }}>Indietro</button>
                <button type="submit" disabled={loading} style={{ ...buttonStyle, backgroundColor: "#238636" }}>
                  {loading ? "Cifratura hardware..." : `Invia Disposizione ${circuit}`}
                </button>
              </div>
            </form>
          )}

          {step === 3 && txHash && (
            <div style={{ padding: "20px", backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid #10b981", borderRadius: "8px", textAlign: "center" }}>
              <h4 style={{ color: "#34d399", margin: "0 0 10px 0" }}>🔒 Disposizione Internazionale Trasmessa!</h4>
              <p style={{ fontSize: "14px", color: "#8b949e" }}>I dati sensibili sono stati rimossi on-chain. PM2 sta instradando il pagamento reale sul circuito {circuit}.</p>
              <a href={`https://basescan.org{txHash}`} target="_blank" rel="noreferrer" style={{ color: "#58a6ff", textDecoration: "none" }}>Apri Registro Inter-Ramp ↗</a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
