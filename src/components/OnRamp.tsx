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

// Mappatura degli identificativi virtuali reali dei tuoi token del book
const TOKEN_ADDRESSES: Record<string, string> = {
  ALPHA: "0x414c504841307866666361383231356145663639",
  BETA:  "0x4245544130786666636138323135614566363961",
  CTKI:  "0x43544b4930786666636138323135614566363961"
};

export default function OnRamp() {
  const account = useActiveAccount();
  const { connect } = useConnect();

  // Stati per il flusso fiat -> token immediato
  const [tokenToBuy, setTokenToBuy] = useState("ALPHA");
  const [fiatSpend, setFiatSpend] = useState("1500");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    try {
      await connect(async () => {
        return smartWallet({
          chain: base,
          sponsorGas: true, // Paymaster Growth attivo
          factoryAddress: "0x11C9C718607fa6bd67fAA74C01eF567Ff4661882",
        });
      });
    } catch (error: any) {
      console.error("[-] Connessione fallita:", error.message);
    }
  };

  const handleImmediateOnRamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return alert("Connetti prima il wallet MetaMask di destinazione!");

    setLoading(true);
    setTxHash(null);

    try {
      const contract = getContract({ client, chain: base, address: MANAGER_ADDRESS });

      // Calcolo quantitativo: 1 token ALPHA per 1500€ inseriti, convertito in 18 decimali standard
      const tokenPriceMap: Record<string, number> = { ALPHA: 1500, BETA: 280, CTKI: 1000 };
      const calculatedTokens = Number(fiatSpend) / tokenPriceMap[tokenToBuy];
      const parsedAmount = BigInt(Math.floor(calculatedTokens * 10**18));

      const targetTokenAddress = TOKEN_ADDRESSES[tokenToBuy];

      console.log(`[⚙️] Innesco On-Ramp Istantaneo: Generazione di ${calculatedTokens} ${tokenToBuy}...`);

      // Invocazione immediata on-chain per l'emissione istantanea direttamente sul wallet collegato
      const tx = prepareContractCall({
        contract,
        method: "function mintInstantToken(address _to, address _tokenAddress, uint256 _amount, string _targetAsset)",
        params: [account.address, targetTokenAddress, parsedAmount, "FIAT_ONRAMP"],
      });

      const txResult = await sendTransaction({ transaction: tx, account });
      setTxHash(txResult.transactionHash);

      // Notifica al backend per inoltrare la ricevuta via Telegram
      await axios.post("http://localhost:3000/api/onramp/notification", {
        user: account.address,
        fiatPaid: fiatSpend,
        tokenReceived: tokenToBuy,
        amountTokens: calculatedTokens,
        txHash: txResult.transactionHash
      });

    } catch (error: any) {
      console.error("[-] Errore On-Ramp:", error.message);
      alert("Errore durante il caricamento fiat: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#080b11", color: "#ffffff", padding: "40px", borderRadius: "12px", maxWidth: "520px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ borderBottom: "1px solid #21262d", paddingBottom: "15px", marginBottom: "25px" }}>
        <h2 style={{ margin: 0, fontSize: "24px" }}>On-ramp</h2>
        <p style={{ color: "#8b949e", fontSize: "14px", margin: "5px 0 0 0" }}>Acquista i token con carta o bonifico e ricevili all'istante su MetaMask.</p>
      </div>

      <div style={{ backgroundColor: "#111622", border: "1px solid #1a2235", padding: "30px", borderRadius: "8px" }}>
        <form onSubmit={handleImmediateOnRamp}>
          <label style={{ fontSize: "11px", color: "#68778d", fontWeight: "700" }}>SELEZIONA TOKEN DA ACQUISTARE</label>
          <select value={tokenToBuy} onChange={(e) => setTokenToBuy(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42", borderRadius: "6px", color: "#fff", marginTop: "6px", marginBottom: "20px" }}>
            <option value="ALPHA">ALPHA (Prezzo: €1500)</option>
            <option value="BETA">BETA (Prezzo: €280)</option>
            <option value="CTKI">CTKI (Prezzo: €1000)</option>
          </select>

          <label style={{ fontSize: "11px", color: "#68778d", fontWeight: "700" }}>IMPORTO DA PAGARE (EUR)</label>
          <input type="number" value={fiatSpend} onChange={(e) => setFiatSpend(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42", borderRadius: "6px", color: "#fff", marginTop: "6px", marginBottom: "20px" }} required />

          <label style={{ fontSize: "11px", color: "#68778d", fontWeight: "700" }}>METODO DI PAGAMENTO FIAT</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: "100%", padding: "12px", backgroundColor: "#080b11", border: "1px solid #232d42", borderRadius: "6px", color: "#fff", marginTop: "6px", marginBottom: "25px" }}>
            <option value="CARD">Carta di Credito / Debito</option>
            <option value="SEPA">Bonifico Istantaneo SEPA</option>
          </select>

          {!account ? (
            <button type="button" onClick={handleConnectWallet} style={{ width: "100%", padding: "14px", backgroundColor: "#3182ce", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>
              Connetti MetaMask (Gasless)
            </button>
          ) : (
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", backgroundColor: "#238636", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>
              {loading ? "Esecuzione acquisto..." : "Acquista e accredita wallet"}
            </button>
          )}
        </form>

        {txHash && (
          <div style={{ marginTop: "20px", padding: "14px", backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid #10b981", borderRadius: "6px", fontSize: "13px", color: "#34d399" }}>
            ✅ <strong>On-Ramp Completato con Successo!</strong><br />
            I token sono stati generati on-chain ed inviati al tuo wallet.<br />
            <a href={`https://basescan.org{txHash}`} target="_blank" rel="noreferrer" style={{ color: "#63b3ed", textDecoration: "none" }}>Apri registro BaseScan ↗</a>
          </div>
        )}
      </div>
    </div>
  );
}
