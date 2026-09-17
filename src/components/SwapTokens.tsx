import React, { useState } from "react";
import { createThirdwebClient, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { base } from "thirdweb/chains";
import { smartWallet, useActiveAccount, useConnect } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "IL_TUO_THIRDWEB_CLIENT_ID_PUBBLICO"
});

const LIQUISWAP_MANAGER_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

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
          sponsorGas: true,
          factoryAddress: "0x11C9C718607fa6bd67fAA74C01eF567Ff4661882",
        });
      });
    } catch (error: any) {
      console.error("[-] Connessione fallita:", error.message);
    }
  };

  const handleImmediateSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return alert("Connetti prima il wallet!");

    setLoading(true);
    setTxHash(null);

    try {
      const contract = getContract({
        client,
        chain: base,
        address: LIQUISWAP_MANAGER_ADDRESS
      });

      const parsedAmount = BigInt(Math.floor(Number(quantity) * 10**18));

      const tx = prepareContractCall({
        contract,
        method: "function mintInstantToken(address _to, string _tokenSymbol, uint256 _amount)",
        params: [account.address, fromToken, parsedAmount],
      });

      const txResult = await sendTransaction({
        transaction: tx,
        account: account,
      });

      setTxHash(txResult.transactionHash);
    } catch (error: any) {
      alert("Errore on-chain: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#080b11", color: "#ffffff", padding: "40px", borderRadius: "12px", maxWidth: "520px", margin: "40px auto" }}>
      <h2>Swap &rarr; wallet</h2>
      <div style={{ backgroundColor: "#111622", padding: "30px", borderRadius: "8px" }}>
        <form onSubmit={handleImmediateSwap}>
          <label>TOKEN</label>
          <select value={fromToken} onChange={(e) => setFromToken(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", color: "#fff", marginBottom: "20px" }}>
            <option value="ALPHA">ALPHA</option>
            <option value="BETA">BETA</option>
            <option value="GEM">GEM</option>
            <option value="NEBULA">NEBULA</option>
          </select>

          <label>QUANTITÀ</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", color: "#fff", marginBottom: "20px" }} required />

          <label>DESTINAZIONE</label>
          <select value={toCrypto} onChange={(e) => setToCrypto(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", color: "#fff", marginBottom: "20px" }}>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH (Base)</option>
            <option value="USDC">USDC (Base)</option>
          </select>

          {!account ? (
            <button type="button" onClick={handleConnect} style={{ width: "100%", padding: "14px", backgroundColor: "#3182ce", color: "#fff", border: "none", cursor: "pointer" }}>
              Connetti MetaMask (Gasless)
            </button>
          ) : (
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", backgroundColor: "#2b6cb0", color: "#fff", border: "none", cursor: "pointer" }}>
              {loading ? "Accredito immediato..." : "Swap e accredito wallet"}
            </button>
          )}
        </form>

        {txHash && (
          <div style={{ marginTop: "20px", color: "#34d399" }}>
            ✅ Accredito Eseguito! <a href={`https://basescan.org{txHash}`} target="_blank" rel="noreferrer" style={{ color: "#63b3ed" }}>Vedi su BaseScan ↗</a>
          </div>
        )}
      </div>
    </div>
  );
}
