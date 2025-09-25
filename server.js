const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const sgMail = require('@sendgrid/mail'); // <--- SendGrid
const app = express();
const upload = multer();

app.use(cors());

// Serve tutti i file statici dalla cartella "public"
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({ limit: '50mb' })); // Limite aumentato!
app.use(express.urlencoded({ extended: true }));

// Serve la pagina principale dalla cartella public
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- SendGrid setup ---
sgMail.setApiKey('***REMOVED***');

// Funzione per invio email con allegato PDF
async function inviaEmail(destinatario, mittente, ccList, oggetto, testo, pdfBuffer, filename) {
  const msg = {
    to: destinatario,
    from: mittente, // deve essere verificato su SendGrid!
    cc: ccList.length > 0 ? ccList : undefined,
    subject: oggetto,
    text: testo,
    attachments: [
      {
        content: pdfBuffer.toString('base64'),
        filename: filename || 'contratto.pdf',
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ]
  };

  await sgMail.send(msg);
}

// Invio contratto Retail
app.post('/generate-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File PDF mancante' });

    // Recupera email collaboratore e cliente dalla richiesta
    const mailCollaboratore = req.body.mail_collaboratore;
    let mailCliente = req.body.mail_cliente;
    let datiCliente = {};
    if (req.body.dati) {
      try { datiCliente = JSON.parse(req.body.dati); } catch (e) {}
    }

    // Se non è stata inserita la mail cliente, prova a prenderla dai dati del cliente
    if (!mailCliente && datiCliente.email) {
      mailCliente = datiCliente.email;
    }

    const nome = datiCliente.nome || '';
    const cognome = datiCliente.cognome || '';

    // Costruisci array CC con collaboratore e (se presente) cliente
    const ccList = [];
    if (mailCollaboratore) ccList.push(mailCollaboratore);
    if (mailCliente) ccList.push(mailCliente);

    const destinatario = 'masalaenergia@outlook.it';
    const mittente = 'andreamasala1970@gmail.com'; // deve essere verificata su SendGrid!
    const oggetto = `Contratto Residenziale per ${nome} ${cognome}`;
    const testo = `Ciao ${nome} ${cognome},\n\nIn allegato trovi il contratto Res. e la documentazione compilata.\n\nSaluti.`;
    const pdfBuffer = req.file.buffer;
    const filename = req.file.originalname || 'contratto-retail.pdf';

    await inviaEmail(destinatario, mittente, ccList, oggetto, testo, pdfBuffer, filename);
    res.json({ ok: true, message: 'PDF retail ricevuto e email inviata!' });
  } catch (err) {
    console.error('Errore invio email retail:', err);
    res.status(500).json({ error: 'Errore invio email retail.' });
  }
});

// Invio contratto Business
app.post('/generate-pdf-business', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File PDF mancante' });

    // Recupera email collaboratore e cliente dalla richiesta
    const mailCollaboratore = req.body.mail_collaboratore;
    let mailCliente = req.body.mail_cliente;
    let datiAzienda = {};
    if (req.body.dati) {
      try { datiAzienda = JSON.parse(req.body.dati); } catch (e) {}
    }

    // Se non è stata inserita la mail cliente, prova a prenderla dai dati dell'azienda
    if (!mailCliente && datiAzienda.email) {
      mailCliente = datiAzienda.email;
    }

    const ragioneSociale = datiAzienda.ragione_sociale || '';
    const partitaIva = datiAzienda.partita_iva || '';

    // Costruisci array CC con collaboratore e (se presente) cliente
    const ccList = [];
    if (mailCollaboratore) ccList.push(mailCollaboratore);
    if (mailCliente) ccList.push(mailCliente);

    const destinatario = 'masalaenergia@outlook.it';
    const mittente = 'andreamasala1970@gmail.com'; // deve essere verificata su SendGrid!
    const oggetto = `Contratto Business per ${ragioneSociale} (P.IVA ${partitaIva})`;
    const testo = `Ciao,\n\nIn allegato trovi il contratto BUSINESS compilato per ${ragioneSociale}.\n\nSaluti.`;
    const pdfBuffer = req.file.buffer;
    const filename = req.file.originalname || 'contratto-business.pdf';

    await inviaEmail(destinatario, mittente, ccList, oggetto, testo, pdfBuffer, filename);
    res.json({ ok: true, message: 'PDF business ricevuto e email inviata!' });
  } catch (err) {
    console.error('Errore invio email business:', err);
    res.status(500).json({ error: 'Errore invio email business.' });
  }
});

// --- PATCH PER iOS/Safari: invio PDF come base64 ---
app.post('/generate-pdf-base64', async (req, res) => {
  try {
    console.log("BODY ricevuto:", req.body); // <--- LOG DI DEBUG
    const { pdf_base64, filename, dati, mail_collaboratore, mail_cliente } = req.body;

    if (!pdf_base64 || !filename) {
      console.log("Errore: base64 o filename mancante");
      return res.status(400).json({ error: 'Missing base64 or filename' });
    }
    // Decodifica il PDF da base64
    const pdfBuffer = Buffer.from(pdf_base64, 'base64');
    console.log("Buffer PDF creato, lunghezza:", pdfBuffer.length);

    // Per ulteriore debug, salva sempre un file temporaneo
    fs.writeFileSync('./debug.pdf', pdfBuffer);
    console.log("PDF salvato come debug.pdf");

    // Recupera dati cliente (per retail) o azienda (per business)
    let datiCliente = {};
    let datiAzienda = {};
    if (dati) {
      try {
        const parsed = typeof dati === "string" ? JSON.parse(dati) : dati;
        datiCliente = parsed;
        datiAzienda = parsed;
      } catch (e) { console.log("Errore parsing dati:", e); }
    }

    // Prova a estrarre info
    const nome = datiCliente.nome || '';
    const cognome = datiCliente.cognome || '';
    const ragioneSociale = datiAzienda.ragione_sociale || '';
    const partitaIva = datiAzienda.partita_iva || '';

    // Costruisci array CC con collaboratore e (se presente) cliente
    const ccList = [];
    if (mail_collaboratore) ccList.push(mail_collaboratore);
    if (mail_cliente) ccList.push(mail_cliente);

    // Imposta subject e testo
    let oggetto = '';
    let testo = '';
    if (ragioneSociale) {
      oggetto = `Contratto Business per ${ragioneSociale} (P.IVA ${partitaIva})`;
      testo = `Ciao,\n\nIn allegato trovi il contratto BUSINESS compilato per ${ragioneSociale}.\n\nSaluti.`;
    } else {
      oggetto = `Contratto Residenziale per ${nome} ${cognome}`;
      testo = `Ciao ${nome} ${cognome},\n\nIn allegato trovi il contratto Res. e la documentazione compilata.\n\nSaluti.`;
    }

    const destinatario = 'masalaenergia@outlook.it';
    const mittente = 'andreamasala1970@gmail.com'; // deve essere verificata su SendGrid!

    await inviaEmail(destinatario, mittente, ccList, oggetto, testo, pdfBuffer, filename);
    console.log("Email inviata!");
    res.json({ ok: true, message: 'PDF base64 ricevuto e email inviata!' });
  } catch (err) {
    console.error('Errore invio email (base64):', err);
    res.status(500).json({ error: 'Errore invio email base64.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server attivo su porta', PORT));