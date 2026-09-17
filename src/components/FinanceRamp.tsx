import React, { useState } from "react";
import { createThirdwebClient, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { base } from "thirdweb/chains";
import { useActiveAccount } from "thirdweb/react";

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "IL_TUO_THIRDWEB_CLIENT_ID_PUBBLICO"
});

export default function FinanceRamp() {
  const account = useActiveAccount();
  const [activeTab, setActiveTab] = useState<"onramp" | "offramp">("onramp");
  const [fiatAmount, setFiatAmount] = useState("100");
  const [selectedFiat, setSelectedFiat] = useState("EUR");
  const [cryptoToReceive, setCryptoToReceive] = useState("USDC");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [targetIban, setTargetIban] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleOnRampSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rampUrl = `https://thirdweb.com{fiatAmount}&fiatCurrency=${selectedFiat}&cryptoCurrency=${cryptoToReceive}&walletAddress=${account?.address || ""}`;
    window.open(rampUrl, "_blank");
  };

  const handleOffRampSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !cryptoAmount || !targetIban || !accountHolder) return;
    setLoading(true);
    try {
      const contract = getContract({
        client, chain: base,
        address: import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"
      });
      const encryptedIban = btoa(targetIban);
      const parsedAmount = BigInt(Math.floor(Number(cryptoAmount) * 10**6));
      const tx = prepareContractCall({
        contract,
        method: "function triggerOffRamp(uint256 _amountIn, string _targetIBAN, string _accountHolderName)",
        params: [parsedAmount, encryptedIban, accountHolder],
      });
      const result = await sendTransaction({ transaction: tx, account });
      setTxHash(result.transactionHash);
    } catch (error: any) {
      alert("Errore transazione: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "12px", marginTop: "6px", marginBottom: "15px", backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "8px", color: "#fff" };

  return (
    <div style={{ background: "#0b0e14", color: "#fff", padding: "30px", borderRadius: "12px", border: "1px solid #1f242c", maxWidth: "600px", margin: "20px auto" }}>
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #21262d", paddingBottom: "15px", marginBottom: "20px" }}>
        <button type="button" onClick={() => setActiveTab("onramp")} style={{ padding: "10px 20px", background: activeTab === "onramp" ? "#1f6feb" : "#161b22", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer" }}>On-Ramp</button>
        <button type="button" onClick={() => setActiveTab("offramp")} style={{ padding: "10px 20px", background: activeTab === "offramp" ? "#1f6feb" : "#161b22", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer" }}>Off-Ramp Conto</button>
      </div>
      {activeTab === "onramp" ? (
        <form onSubmit={handleOnRampSubmit}>
          <input type="number" value={fiatAmount} onChange={(e) => setFiatAmount(e.target.value)} style={inputStyle} required />
          <button type="submit" style={{ width: "100%", padding: "14px", background: "#238636", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Apri Gateway</button>
        </form>
      ) : (
        <form onSubmit={handleOffRampSubmit}>
          <input type="number" step="0.01" value={cryptoAmount} onChange={(e) => setCryptoAmount(e.target.value)} style={inputStyle} placeholder="0.00" required />
          <input type="text" value={targetIban} onChange={(e) => setTargetIban(e.target.value)} style={inputStyle} placeholder="IT60..." required />
          <input type="text" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} style={inputStyle} placeholder="Intestatario" required />
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", background: "#1f6feb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Invia Ordine</button>
        </form>
      )}
    </div>
  );
}
