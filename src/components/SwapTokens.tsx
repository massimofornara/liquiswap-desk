import React, { useState } from "react";
import { createThirdwebClient, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { base, ethereum, bsc, arbitrum } from "thirdweb/chains";
import { smartWallet } from "thirdweb/wallets";
import { useActiveAccount, useConnect } from "thirdweb/react";
import axios from "axios";

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "IL_TUO_THIRDWEB_CLIENT_ID_PUBBLICO"
});

// Mappatura delle reti e degli indirizzi dei contratti manager ERC-2771 distribuiti sulle varie catene
const MANAGER_CHAIN_ADDRESSES: Record<number, string> = {
  8453: "0xBaseManagerAddress",     // Base Mainnet Manager
  1:    "0xEthereumManagerAddress", // Ethereum Mainnet Manager
  56:   "0xBscManagerAddress",      // Binance Smart Chain Manager
  42161:"0xArbitrumManagerAddress"  // Arbitrum Manager
};

// Registro dei Token Reali e Liquidi di mercato con mappatura della loro catena nativa a gas zero
const ASSET_REGISTRY: Record<string, { address: string; chain: any; chainId: number }> = {
  USDC: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913", chain: base, chainId: 8453 },      // USDC su Base
  ETH:  { address: "0x4200000000000000000000000000000000000006", chain: base, chainId: 8453 },      // WETH su Base
  BTC:  { address: "0x1a25b25916A810a0C35924765666f4e19572b160", chain: base, chainId: 8453 },      // WBTC su Base
  BNB:  { address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", chain: bsc, chainId: 56 },        // BNB su BSC
  USDT: { address: "0xfde4c96c8593536e31f229ea8f37b2ad3e390225", chain: base, chainId: 8453 },      // USDT su Base
  DAI:  { address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", chain: arbitrum, chainId: 42161 }, // DAI su Arbitrum
  EURC: { address: "0x60a3c68b70bc25a41a41764eb86ff0ff58509dB14", chain: base, chainId: 8453 },      // EURC su Base
  EURe: { address: "0x43544b4930786666636138323135614566363961", chain: base, chainId: 8453 }       // eEUR Monerium
};

export default function SwapTokens() {
  const account = useActiveAccount();
  const { connect } = useConnect();

  const [fromToken, setFromToken] = useState<string>("ALPHA");
  const [quantity, setQuantity] = useState<string>("1");
  const [toCrypto, setToCrypto] = useState<string>("USDC");
  const [loading, setLoading] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Connessione dinamica allo Smart Wallet in base alla catena di destinazione dell'asset scelto
  const handleConnectChain = async (targetChain: any) => {
    try {
      console.log(`[⚙️ AA] Connessione al Paymaster Multi-Chain per la rete ID: ${targetChain.id}...`);
      await connect(async () => {
        return smartWallet({
          chain: targetChain,
          sponsorGas: true, // Attiva la sponsorizzazione globale a costo zero per l'operatore
          factoryAddress: "0x11C9C718607fa6bd67fAA74C01eF567Ff4661882" // Factory unificata di Thirdweb
        });
      });
    } catch (error: any) {
      console.error("[-] Connessione fallita:", error.message);
    }
  };

  const handleMultiChainSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return alert("Connetti prima MetaMask!");

    const targetAssetInfo = ASSET_REGISTRY[toCrypto];
    setLoading(true);
    setTxHash(null);

    try {
      // Istanzia il contratto sulla catena ottimale selezionata per quel token specifico
      const contract = getContract({
        client,
        chain: targetAssetInfo.chain,
        address: MANAGER_CHAIN_ADDRESSES[targetAssetInfo.chainId]
      });

      const usdcAmountIn = BigInt(Math.floor(Number(quantity) * 10**6));
      const minAmountOutExpected = BigInt(0); 

      console.log(`[🚀 Router Multi-Chain] Invio ordine di swap atomico su catena ID: ${targetAssetInfo.chainId}`);

      const tx = prepareContractCall({
        contract,
        method: "function executeMarketSwap(address _tokenOut, uint256 _amountUsdcIn, uint256 _amountOutMin)",
        params: [targetAssetInfo.address, usdcAmountIn, minAmountOutExpected],
      });

      // La transazione viene firmata localmente ed inviata tramite il Relayer senza consumare ETH
      const txResult = await sendTransaction({ transaction: tx, account });
      setTxHash(txResult.transactionHash);

      // Notifica immediata del movimento al backend di PM2
      await axios.post("http://localhost:3000/api/swap/multi-chain", {
        user: account.address,
        asset: toCrypto,
        amount: quantity,
        chainId: targetAssetInfo.chainId,
        txHash: txResult.transactionHash
      });

    } catch (error: any) {
      alert("Errore durante l'accredito reale multi-chain: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#080b11", color: "#ffffff", padding: "40px", borderRadius: "12px", maxWidth: "520px", margin: "40px auto", border: "1px solid #1f242c" }}>
      <h2>Swap &rarr; Wallet (Multi-Chain Real Assets)</h2>
      <div style={{ backgroundColor: "#111622", padding: "30px", borderRadius: "8px" }}>
        <form onSubmit={handleMultiChainSwap}>
          <label>TOKEN DISINVESTITO</label>
          <select value={fromToken} onChange={(e) => setFromToken(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", color: "#fff", marginBottom: "20px" }}>
            <option value="ALPHA">ALPHA (Valore Desk: €1500)</option>
            <option value="BETA">BETA (Valore Desk: €280)</option>
          </select>

          <label>QUANTITÀ</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", color: "#fff", marginBottom: "20px" }} required />

          <label>RICEVI CRYPTO REALE SU RETE AD OTTIMIZZAZIONE FISCALE</label>
          <select value={toCrypto} onChange={(e) => setToCrypto(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", color: "#fff", marginBottom: "20px" }}>
            <option value="USDC">USDC (Rete Base - Gas Zero)</option>
            <option value="BTC">BTC (Wrapped Bitcoin Rete Base)</option>
            <option value="ETH">ETH (Wrapped Ethereum Rete Base)</option>
            <option value="BNB">BNB (Rete Binance Smart Chain - Gas Zero)</option>
            <option value="USDT">USDT (Rete Base Stablecoin)</option>
            <option value="DAI">DAI (Rete Arbitrum L2)</option>
            <option value="EURC">EURC (Circle Euro Rete Base)</option>
            <option value="EURe">EURe (Monerium Banking eEUR Rete Base)</option>
          </select>

          {!account ? (
            <button type="button" onClick={() => handleConnectChain(ASSET_REGISTRY[toCrypto].chain)} style={{ width: "100%", padding: "14px", backgroundColor: "#3182ce", color: "#fff", border: "none", cursor: "pointer" }}>
              Connetti MetaMask (Gasless)
            </button>
          ) : (
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", backgroundColor: "#2b6cb0", color: "#fff", border: "none", cursor: "pointer" }}>
              {loading ? "Routing dell'ordine in corso..." : "Swap e accredito reale multi-chain"}
            </button>
          )}
        </form>

        {txHash && (
          <div style={{ marginTop: "20px", color: "#34d399" }}>
            ✅ **Accredito Multi-Chain Effettuato!** L'asset di mercato è nel tuo wallet.<br />
            <a href={`https://basescan.org{txHash}`} target="_blank" rel="noreferrer" style={{ color: "#63b3ed" }}>Apri Registro Esploratore ↗</a>
          </div>
        )}
      </div>
    </div>
  );
}
