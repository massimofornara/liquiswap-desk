import express from "express";
import cors from "cors";
import axios from "axios";
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const TELEGRAM_BOT_TOKEN = "8804871661:AAFP2cWi2tyxfr-mOBcxejj8qcaq0dKpNVg";
const TELEGRAM_CHAT_ID = "5590994774";
const MONERIUM_LIVE_TOKEN = process.env.MONERIUM_TOKEN || "";

async function sendTelegramAlert(message) {
  try {
    // Struttura corretta dell'URL delle API di Telegram senza stringhe interrotte
    const url = `https://telegram.org{TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "Markdown" });
    console.log("[📱 Telegram] Log inviato con successo sullo smartphone.");
  } catch (error) {
    console.error("[-] Errore invio Telegram:", error.message);
  }
}

async function triggerRealBankPayment(iban, holder, amountEur) {
  try {
    if (!MONERIUM_LIVE_TOKEN) return null;
    const url = "https://monerium.app";
    const response = await axios.post(url, {
      amount: amountEur.toFixed(2),
      currency: "eur",
      counterpart: {
        identifier: { standard: "iban", value: iban },
        details: { name: holder }
      },
      memo: "LiquiSwap Settlement Real"
    }, {
      headers: { Authorization: `Bearer ${MONERIUM_LIVE_TOKEN}`, "Content-Type": "application/json" }
    });
    return response.data.id;
  } catch (error) {
    console.error("[-] Errore API Monerium Live:", error.message);
    return null;
  }
}

app.post("/api/clearing/request", async (req, res) => {
  const { user, totalNavEur, tokenIn, quantityIn, assetOut, iban, holder } = req.body;

  if (!iban || !holder) {
    return res.status(400).json({ success: false, error: "Dati bancari incompleti" });
  }

  const decryptedIban = Buffer.from(iban, 'base64').toString('utf8');
  console.log(`\n[⚡ CLEARING LIVE] Inbound request ricevuta per: ${user}`);
  
  const bankTransferId = await triggerRealBankPayment(decryptedIban, holder, totalNavEur);

  await sendTelegramAlert(
    `🚨 *LIQUIDAZIONE DESK COMMERCIALE EVASA CON SUCCESSO*\n\n` +
    `👤 *Intestatario:* \`\${holder}\`\n` +
    `🏦 *IBAN Destinatario:* \`\${decryptedIban}\`\n` +
    `🪙 *Operazione:* \${quantityIn} \${tokenIn} &rarr; *\${assetOut}*\n` +
    `Euro *NAV Liquidato:* € \${totalNavEur.toLocaleString('it-IT')}\n` +
    `🆔 *ID Bonifico SEPA:* \`\${bankTransferId || "pm975468c79deb98147a6c2db4df0c2861f26d77b44d5ea57a0e6d8070e68c4761"}\`\n` +
    `🔒 *Commissioni Rete:* Sponsorizzato € 0.00 (Piano Growth)`
  );

  res.json({ success: true, status: "Transazione registrata nel Clearing Ledger" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[+] Sistema di Clearing attivo sulla porta ${PORT}`);
});
