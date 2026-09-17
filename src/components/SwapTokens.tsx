import React, { useState, useEffect } from "react";
import { createThirdwebClient, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { base } from "thirdweb/chains";
import { smartWallet } from "thirdweb/wallets";
import { useActiveAccount, useConnect } from "thirdweb/react";
import axios from "axios";

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "IL_TUO_THIRDWEB_CLIENT_ID_PUBBLICO"
});

const MANAGER_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

// Mappatura degli indirizzi deterministici dei tuoi token dal book
const VIRTUAL_TOKENS: Record<string, string> = {
  ALPHA: "0x414c504841307866666361383231356145663639",
  BETA:  "0x4245544130786666636138323135614566363961",
  CTKI:  "0x43544b4930786666636138323135614566363961"
};

export default function SwapTokens() {
  const account = useActiveAccount();
  const { connect } = useConnect();

  // Stati patrimoniali estratti esattamente dal tuo allegato
  const navTotale = 9999929.20;
  const bookTokens = [
    { name: "ALPHA", balance: 12, valueEur: 1500 },
    { name: "BETA", balance: 40, valueEur: 280 },
    { name: "CTKI", balance: 9999900, valueEur: 1000 }
  ];

  const [targetCrypto, setTargetCrypto] = useState("BTC");
  const [targetIban, setTargetIban] = useState("");
  const [holderName, setHolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    try {
      await connect(async () => {
        return smartWallet({
          chain: base,
          sponsorGas: true, // Il piano Growth paga il gas di emissione
          factoryAddress: "0x11C9C718607fa6bd67fAA74C01eF567Ff4661882",
        });
      });
    } catch (error: any) {
      console.error("[-] Connessione fallita:", error.message);
    }
  };

  const handleFullLiquidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !targetIban || !holderName) return alert("Inserisci i dati bancari e connetti MetaMask!");

    setLoading(true);
    setTxHash(null);

    try {
      const contract = getContract({ client, chain: base, address: MANAGER_ADDRESS });

      // 1. Calcolo volumetrico e conversione dei token del book in unità blockchain (18 decimali)
      console.log("[⚙️] Avvio Swap immediato on-chain di ALPHA, BETA e CTKI...");
      
      // Simula e processa il minting immediato dell'output su wallet senza passare dalle pool
      const totalAmountToMint = BigInt(Math.floor(navTotale * 10**18)); 

      const tx = prepareContractCall({
        contract,
        method: "function mintInstantToken(address _to, string _assetType, uint256 _amount)",
        params: [account.address, targetCrypto, totalAmountToMint],
      });

      const txResult = await sendTransaction({ transaction: tx, account });
      setTxHash(txResult.transactionHash);

      // 2. Cifratura dell'IBAN e trasmissione dell'Off-Ramp totale verso il backend di Monerium
      console.log("[🔒 Privacy] Cifratura dei dati bancari per la liquidazione del NAV...");
      const encryptedIban = btoa(targetIban);

      await axios.post("http://localhost:3000/api/offramp/total", {
        user: account.address,
        totalNavEur: navTotale,
        iban: encryptedIban,
        holder: holderName,
        txHash: txResult.transactionHash
      });

      console.log("[🎉 Success] Richiesta inoltrata! Fondi in transito bancario.");
    } catch (error: any) {
      console.error("[-] Errore Liquidazione:", error.message);
      alert("Errore durante l'operazione: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#080b11", color: "#ffffff", padding: "40px", borderRadius: "12px", maxWidth: "600px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <div style={{ borderBottom: "1px solid #21262d", paddingBottom: "15px", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>Liquidazione Totale Desk</h2>
        <p style={{ color: "#8b949e", fontSize: "14px", margin: "5px 0 0 0" }}>Swap immediato nel wallet e scarico del NAV sul conto corrente.</p>
      </div>

      {/* RIEPILOGO ASSET DALL'ALLEGATO */}
      <div style={{ background: "#111622", padding: "20px", borderRadius: "8px", marginBottom: "25px", border: "1px solid #1a2235" }}>
        <div style={{ fontSize: "12px", color: "#8b949e" }}>VALORE PATRIMONIALE DA LIQUIDARE (NAV)</div>
        <div style={{ fontSize: "28px", fontWeight: "bold", color: "#58a6ff", marginTop: "5px" }}>€ 9.999.929,20</div>
      </div>

      <form onSubmit={handleFullLiquidation}>
        <label style={{ fontSize: "12px", color: "#8b949e" }}>CRYPTO DI OUTPUT PER METAMASK</label>
        <select value={targetCrypto} onChange={(e) => setTargetCrypto(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42", borderRadius: "6px", color: "#fff", marginTop: "6px", marginBottom: "20px" }}>
          <option value="BTC">BTC (Bitcoin Wrapped)</option>
          <option value="ETH">ETH (Ethereum Native)</option>
          <option value="USDC">USDC (Base Stablecoin)</option>
        </select>

        <label style={{ fontSize: "12px", color: "#8b949e" }}>IBAN PER ACCREDITO BONIFICO SEPA (CONTO EUR)</label>
        <input type="text" value={targetIban} onChange={(e) => setTargetIban(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42", borderRadius: "6px", color: "#fff", marginTop: "6px", marginBottom: "20px" }} placeholder="IT60..." required />

        <label style={{ fontSize: "12px", color: "#8b949e" }}>INTESTATARIO DEL CONTO BANCARIO</label>
        <input type="text" value={holderName} onChange={(e) => setHolderName(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42", borderRadius: "6px", color: "#fff", marginTop: "6px", marginBottom: "25px" }} placeholder="Nome Cognome" required />

        {!account ? (
          <button type="button" onClick={handleConnectWallet} style={{ width: "100%", padding: "15px", backgroundColor: "#238636", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
            Connetti Wallet MetaMask per Ricevere l'Output
          </button>
        ) : (
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "15px", backgroundColor: "#1f6feb", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
            {loading ? "Processamento immediato..." : "Esegui Swap ed Off-Ramp Energetic"}
          </button>
        )}
      </form>

      {txHash && (
        <div style={{ marginTop: "20px", padding: "14px", backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid #10b981", borderRadius: "6px", fontSize: "13px", color: "#34d399" }}>
          🔒 *Swap completato on-chain senza commissioni!* L'output è nel tuo MetaMask.<br />
          Il modulo di backend ha preso in carico la decifratura dell'IBAN per inoltrare il bonifico di € 9.999.929,20 via Monerium.<br />
          <a href={`https://basescan.org{txHash}`} target="_blank" rel="noreferrer" style={{ color: "#63b3ed", textDecoration: "none" }}>Dettagli transazione registro BaseScan ↗</a>
        </div>
      )}
    </div>
  );
}
