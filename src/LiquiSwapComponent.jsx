import React, { useState } from "react";
import { createThirdwebClient, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { base } from "thirdweb/chains";
import { smartWallet, useActiveAccount, useConnect } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: "IL_TUO_THIRDWEB_CLIENT_ID" // Inserisci il Client ID pubblico della tua dashboard Thirdweb
});

export default function LiquiSwapComponent() {
  const account = useActiveAccount();
  const { connect } = useConnect();

  // Stati del modulo derivati dall'allegato
  const [selectedToken, setSelectedToken] = useState("ALPHA");
  const [quantity, setAmount] = useState("1");
  const [destinationCrypto, setDestinationCrypto] = useState("BTC");
  
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);

  // Mappatura degli indirizzi dei tuoi token illiquidi on-chain su Base Mainnet
  // Sostituisci questi indirizzi fittizi con quelli reali generati dal tuo script di deploy dei token
  const tokenAddresses = {
    ALPHA: "0x0000000000000000000000000000000000000000",
    BETA:  "0x0000000000000000000000000000000000000000",
    GEM:   "0x0000000000000000000000000000000000000000",
    NEBULA:"0x0000000000000000000000000000000000000000"
  };

  const handleConnectWallet = async () => {
    try {
      await connect(async () => {
        return smartWallet({
          chain: base,
          sponsorGas: true, // Sfrutta il piano Growth per non far pagare il gas di esecuzione all'utente
          factoryAddress: "0x11C9C718607fa6bd67fAA74C01eF567Ff4661882",
        });
      });
    } catch (error) {
      console.error("[-] Errore connessione wallet:", error.message);
    }
  };

  const handleExecuteSwap = async (e) => {
    e.preventDefault();
    if (!account || !quantity) return;

    setLoading(true);
    setTxHash(null);

    try {
      // Istanzia lo smart contract principale LiquiSwapManager distribuitosi sulla rete Base
      const contract = getContract({
        client,
        chain: base,
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "INSERISCI_INDIRIZZO_CONTRATTO_MANAGER_QUI"
      });

      const targetTokenAddress = tokenAddresses[selectedToken];
      if (targetTokenAddress === "0x0000000000000000000000000000000000000000") {
        alert("Errore: Configura l'indirizzo reale del token ALPHA/BETA nel codice prima di scambiare!");
        setLoading(false);
        return;
      }

      // Conversione quantitativa nei 18 decimali standard dei token ERC-20
      const parsedTokenAmount = BigInt(Math.floor(Number(quantity) * 10**18));

      console.log(`[⚙️] Generazione dello swap gasless per ${quantity} ${selectedToken}...`);
      
      // Prepara la chiamata alla funzione 'swapToken' definita nel tuo contratto Solidity
      const tx = prepareContractCall({
        contract,
        method: "function swapToken(address _tokenAddress, uint256 _tokenAmount)",
        params: [targetTokenAddress, parsedTokenAmount],
      });

      // Esegue la transazione: la firma è dell'utente, il gas viene scalato dai crediti Growth
      const result = await sendTransaction({
        transaction: tx,
        account: account,
      });

      setTxHash(result.transactionHash);
      console.log(`[🎉 Swap Success] Transazione completata. Hash: ${result.transactionHash}`);
    } catch (error) {
      console.error("[-] Errore esecuzione swap on-chain:", error.message);
      alert("Errore durante lo swap: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Stili grafici speculari al Desk dello screenshot
  const deskStyle = {
    background: "#080b11", color: "#ffffff", padding: "40px", borderRadius: "12px",
    maxWidth: "500px", margin: "40px auto", fontFamily: "sans-serif"
  };

  const cardStyle = {
    backgroundColor: "#111622", border: "1px solid #1a2235", padding: "30px", borderRadius: "8px"
  };

  const selectStyle = {
    width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42",
    borderRadius: "6px", color: "#fff", marginTop: "8px", marginBottom: "20px", fontSize: "15px"
  };

  const inputStyle = {
    width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42",
    borderRadius: "6px", color: "#fff", marginTop: "8px", marginBottom: "20px", fontSize: "15px"
  };

  return (
    <div style={deskStyle}>
      <h2 style={{ marginBottom: "30px", fontWeight: "600" }}>Swap &rarr; wallet</h2>
      
      <div style={cardStyle}>
        <form onSubmit={handleExecuteSwap}>
          <label style={{ fontSize: "12px", color: "#68778d", trackingSpacing: "1px" }}>TOKEN</label>
          <select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value)} style={selectStyle}>
            <option value="ALPHA">ALPHA</option>
            <option value="BETA">BETA</option>
            <option value="GEM">GEM</option>
            <option value="NEBULA">NEBULA</option>
          </select>

          <label style={{ fontSize: "12px", color: "#68778d", trackingSpacing: "1px" }}>QUANTITÀ</label>
          <input type="number" value={quantity} onChange={(e) => setAmount(e.target.value)} style={inputStyle} placeholder="1" required />

          <label style={{ fontSize: "12px", color: "#68778d", trackingSpacing: "1px" }}>DESTINAZIONE</label>
          <select value={destinationCrypto} onChange={(e) => setDestinationCrypto(e.target.value)} style={selectStyle}>
            <option value="BTC">BTC</option>
            <option value="USDC">USDC (Base)</option>
            <option value="ETH">ETH (Base)</option>
          </select>

          {!account ? (
            <button type="button" onClick={handleConnectWallet} style={{ width: "100%", padding: "14px", backgroundColor: "#ff5a00", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
              Connetti Wallet Destinazione
            </button>
          ) : (
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", backgroundColor: "#2b6cb0", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Elaborazione in corso..." : "Swap e accredito wallet"}
            </button>
          )}
        </form>

        {txHash && (
          <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#1c281f", border: "1px solid #273e2a", borderRadius: "6px", fontSize: "13px", color: "#81e694" }}>
            ✅ <strong>Accredito crypto eseguito!</strong><br />
            I fondi sono stati inviati all'indirizzo {account.address.substring(0,6)}...<br />
            <a href={`https://basescan.org{txHash}`} target="_blank" rel="noreferrer" style={{ color: "#63b3ed", textDecoration: "none" }}>Dettagli transazione su BaseScan ↗</a>
          </div>
        )}
      </div>
    </div>
  );
}
