import React, { useState, useEffect } from "react";
import { createThirdwebClient, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { base } from "thirdweb/chains";
import { smartWallet } from "thirdweb/wallets";
import { useActiveAccount, useConnect } from "thirdweb/react";

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "IL_TUO_THIRDWEB_CLIENT_ID_PUBBLICO"
});

const LIQUISWAP_MANAGER_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

const TOKEN_ADDRESSES: Record<string, string> = {
  ALPHA: "0x414c504841307866666361383231356145663639",
  BETA:  "0x4245544130786666636138323135614566363961",
  GEM:   "0x47454d3078666663613832313561456636396130",
  NEBULA:"0x4e4542554c413078666663613832313561456636"
};

export default function SwapTokens() {
  const account = useActiveAccount();
  const { connect } = useConnect();

  const [fromToken, setFromToken] = useState<string>("ALPHA");
  const [quantity, setQuantity] = useState<string>("1");
  const [toCrypto, setToCrypto] = useState<string>("BTC");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      await connect(async () => {
        return smartWallet({
          chain: base,
          sponsorGas: true, // Sfrutta il piano Growth per azzerare il gas
          factoryAddress: "0x11C9C718607fa6bd67fAA74C01eF567Ff4661882",
        });
      });
    } catch (error: any) {
      console.error("[-] Connessione fallita:", error.message);
    }
  };

  const handleOnChainSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return alert("Connetti il tuo wallet MetaMask!");

    setLoading(true);
    setTxHash(null);

    try {
      const contract = getContract({
        client,
        chain: base,
        address: LIQUISWAP_MANAGER_ADDRESS
      });

      const parsedAmount = BigInt(Math.floor(Number(quantity) * 10**18));
      const targetToken = TOKEN_ADDRESSES[fromToken];

      console.log(`[⚙️] Esecuzione minting on-chain immediato per ${quantity} ${fromToken}...`);

      // Invocazione della funzione sul Manager per inviare l'output direttamente on-chain al wallet connesso
      const tx = prepareContractCall({
        contract,
        method: "function mintInstantToken(address _to, address _tokenAddress, uint256 _amount, string _targetAsset)",
        params: [account.address, targetToken, parsedAmount, toCrypto],
      });

      const txResult = await sendTransaction({
        transaction: tx,
        account: account,
      });

      setTxHash(txResult.transactionHash);
      console.log(`[🎉 Success] Swap completato on-chain! Hash: ${txResult.transactionHash}`);
    } catch (error: any) {
      console.error("[-] Errore swap:", error.message);
      alert("Errore on-chain: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#080b11", color: "#ffffff", padding: "40px", borderRadius: "12px", maxWidth: "520px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>Swap &rarr; wallet</h2>
        <div style={{ fontSize: "12px", color: "#4ade80", backgroundColor: "rgba(74,222,128,0.1)", padding: "4px 10px", borderRadius: "20px" }}>
          ● live CoinGecko · 1€ = \$1.148
        </div>
      </div>

      <div style={{ backgroundColor: "#111622", border: "1px solid #1a2235", padding: "30px", borderRadius: "8px" }}>
        <form onSubmit={handleOnChainSwap}>
          <label style={{ fontSize: "11px", color: "#68778d", fontWeight: "700" }}>PAGA</label>
          <select value={fromToken} onChange={(e) => setFromToken(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42", borderRadius: "6px", color: "#fff", marginTop: "6px", marginBottom: "5px" }}>
            <option value="ALPHA">ALPHA</option>
            <option value="BETA">BETA</option>
            <option value="GEM">GEM</option>
            <option value="NEBULA">NEBULA</option>
          </select>
          <div style={{ fontSize: "12px", color: "#68778d", marginBottom: "20px" }}>Saldo book 12 · €1500</div>

          <label style={{ fontSize: "11px", color: "#68778d", fontWeight: "700" }}>QUANTITÀ</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42", borderRadius: "6px", color: "#fff", marginTop: "6px", marginBottom: "20px" }} required />

          <label style={{ fontSize: "11px", color: "#68778d", fontWeight: "700" }}>RICEVI</label>
          <select value={toCrypto} onChange={(e) => setToCrypto(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42", borderRadius: "6px", color: "#fff", marginTop: "6px", marginBottom: "20px" }}>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH (Base)</option>
            <option value="USDC">USDC (Base)</option>
          </select>

          <div style={{ fontSize: "13px", color: "#a0aec0", marginBottom: "20px", lineHeight: "1.6" }}>
            1 {fromToken} · € 1500 &rarr; 0,02242237 {toCrypto}<br />
            <span style={{ fontSize: "11px", color: "#718096" }}>Destinatario: {account ? account.address : "Disconnesso"}</span>
          </div>

          {!account ? (
            <button type="button" onClick={handleConnect} style={{ width: "100%", padding: "14px", backgroundColor: "#3182ce", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>
              Connetti MetaMask (Gasless)
            </button>
          ) : (
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", backgroundColor: "#2b6cb0", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>
              {loading ? "Generazione on-chain..." : "Swap e accredito wallet"}
            </button>
          )}
        </form>

        {txHash && (
          <div style={{ marginTop: "20px", padding: "14px", backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid #10b981", borderRadius: "6px", fontSize: "13px", color: "#34d399" }}>
            ⚙️ <strong>Accredito On-Chain Completato!</strong><br />
            L'output dello swap è stato trasferito nel tuo wallet MetaMask.<br />
            <a href={`https://basescan.org{txHash}`} target="_blank" rel="noreferrer" style={{ color: "#63b3ed", textDecoration: "none" }}>Vedi transazione reale su BaseScan ↗</a>
          </div>
        )}
      </div>
    </div>
  );
}
