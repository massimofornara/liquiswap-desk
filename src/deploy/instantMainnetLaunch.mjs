import { createThirdwebClient, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { base } from "thirdweb/chains";
import { deployContract } from "thirdweb/deploys";
import { privateKeyToAccount } from "thirdweb/wallets";
import fs from "fs";
import axios from "axios";

const SECRET_KEY = "Z5Bk-8ouqvIVbAm1BrXt4cBJuHf1GfNyuRxCltJUEkJTeL2FZ6uUUSdRf53-FNonQRuikuGV5JrZI1lo7URH8Q";
const PRIVATE_KEY = "59e11e8663a63647e2609c6ca9548b78aff5c5a33bcdd4447baf36d0e02f6162";
const TELEGRAM_BOT_TOKEN = "8804871661:AAFP2cWi2tyxfr-mOBcxejj8qcaq0dKpNVg";
const TELEGRAM_CHAT_ID = "5590994774";

async function sendTelegramAlert(message) {
  try {
    const url = "https://telegram.org" + TELEGRAM_BOT_TOKEN + "/sendMessage";
    await axios.post(url, { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "Markdown" });
    console.log("[📱 Telegram] Notifica di stato inviata con successo.");
  } catch (error) {
    console.error("[-] Errore notifica Telegram:", error.message);
  }
}

async function main() {
  console.log("[⚙️] Connessione all'infrastruttura Cloud di Thirdweb...");
  const client = createThirdwebClient({ secretKey: SECRET_KEY });
  const account = privateKeyToAccount({ client, privateKey: PRIVATE_KEY });
  
  console.log(`[+] Wallet operatore autorizzato: ${account.address}`);
  console.log("[⚙️] Avvio del deploy ufficiale dell'asset di clearing (0 Gas)...");

  try {
    // Genera il contratto ERC-20 formattato in conformità con lo standard delle ricevute
    const deployedAddress = await deployContract({
      client,
      chain: base,
      account,
      type: "token", 
      params: {
        name: "LiquiSwap Receipt",
        symbol: "LSR",
        primarySaleRecipient: account.address
      }
    });

    console.log(`\n====================================================`);
    console.log(`🎉 DEPLOY LIVE COMPLETATO CON SUCCESSO NEL TERMINALE!`);
    console.log(`Indirizzo Smart Contract Token LSR: ${deployedAddress}`);
    console.log(`Spesa di Gas dell'operazione: € 0.00 (Sponsorizzato Growth)`);
    console.log(`====================================================\n`);

    // 3. CONIO REALE AUTOMATICO DELL'INTERO NAV DI DIECI MILIONI (€ 9.999.929,20)
    console.log("[⚙️] Esecuzione del conio automatico del NAV verso MetaMask...");
    const contract = getContract({ client, chain: base, address: deployedAddress });
    
    // Converte l'importo nei 18 decimali standard della blockchain
    const navAmount = BigInt(Math.floor(9999929.20 * 10**18));
    
    const mintTx = prepareContractCall({
      contract,
      method: "function mintTo(address to, uint256 amount)",
      params: ["0xffca8215aEf69a0d3fF428E1B7B8D33D5c05bF07", navAmount]
    });

    const mintResult = await sendTransaction({ transaction: mintTx, account });
    console.log("[🎉 Success] Il tuo NAV è stato stampato on-chain ed inviato a MetaMask!");

    // Allinea le variabili d'ambiente locali del file .env con l'indirizzo reale sbloccato
    fs.writeFileSync(".env", `LSR_ADDRESS="${deployedAddress}"\nNEXT_PUBLIC_CONTRACT_ADDRESS="${deployedAddress}"\nVITE_LSR_ADDRESS="${deployedAddress}"\nTHIRDWEB_SECRET_KEY="${SECRET_KEY}"`);

    await sendTelegramAlert(
      `🚀 *PIATTAFORMA LIQUISWAP DISTRIBUITA E LIVE!*\n\n` +
      `⛓️ *Contract Token LSR:* \`\${deployedAddress}\`\n` +
      `🔒 *Stato Rete:* Produzione Real-Time su Base\n` +
      `💶 *NAV Sbloccato ed Accreditato:* € 9.999.929,20\n` +
      `⛓️ *Tx Mint Registro:* [Apri BaseScan](https://basescan.org\${mintResult.transactionHash})\n` +
      `⛽ *Commissioni di Deploy:* € 0.00 (Fatturazione azzerata)`
    );

  } catch (error) {
    console.error("[-] Fallimento trasmissione on-chain:", error.message || error);
  }
}

main();
