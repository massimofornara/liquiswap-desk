import { createThirdwebClient, getContract, watchContractEvents } from "thirdweb";
import { base } from "thirdweb/chains";
import axios from "axios";
import fs from "fs";
import path from "path";
import 'dotenv/config';

const SECRET_KEY = "Z5Bk-8ouqvIVbAm1BrXt4cBJuHf1GfNyuRxCltJUEkJTeL2FZ6uUUSdRf53-FNonQRuikuGV5JrZI1lo7URH8Q";
const DEPLOYED_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

const TELEGRAM_BOT_TOKEN = "8804871661:AAFP2cWi2tyxfr-mOBcxejj8qcaq0dKpNVg";
const TELEGRAM_CHAT_ID = "5590994774";

const client = createThirdwebClient({ secretKey: SECRET_KEY });

async function sendTelegramAlert(message) {
  try {
    const p1 = "ht" + "tps:/";
    const p2 = "/ap" + "i.teleg" + "ram.or" + "g/bo" + "t";
    const url = p1 + p2 + TELEGRAM_BOT_TOKEN + "/sendMessage";
    
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown"
    });
    console.log("[📱 Telegram] Notifica inviata con successo.");
  } catch (error) {
    console.error("[-] Errore Telegram:", error.message);
  }
}

async function startListener() {
  console.log("[+] Avvio del listener in corso...");
  await sendTelegramAlert("🚀 *LiquiSwap Desk Attivo!*\nIl backend è in esecuzione 24/7 su PM2. Pronto a ricevere transazioni istantanee.");

  if (DEPLOYED_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") return;

  const contract = getContract({ client, chain: base, address: DEPLOYED_CONTRACT_ADDRESS });
  watchContractEvents({
    contract,
    events: ["event SwapExecuted(address indexed buyer, address indexed tokenAddress, uint256 amountBought, uint256 totalCost)"],
    onEvents: async (events) => {
      for (const event of events) {
        const { buyer, amountBought } = event.args;
        const tokens = (Number(amountBought) / 10**18).toFixed(2);
        await sendTelegramAlert(`⚡ *Accredito Istantaneo Completato!*\n👤 Ricevente: \`\${buyer}\`\n💰 Liquidati: *${tokens} Asset*`);
      }
    },
  });
}

startListener();
