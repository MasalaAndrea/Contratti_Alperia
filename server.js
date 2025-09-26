const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
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

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'andreamasala1970@gmail.com',
    pass: 'gprz pttn vfwk emby' // App password
  }
});

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

    const mailOptions = {
      from: '"Contratti Energia" <andreamasala1970@gmail.com>',
      to: 'masalaenergia@outlook.it',
      cc: ccList.length > 0 ? ccList.join(',') : undefined,
      subject: `Contratto Residenziale per ${nome} ${cognome}`,
      text: `Ciao ${nome} ${cognome},\n\nIn allegato trovi il contratto Res. e la documentazione compilata.\n\nSaluti.`,
      attachments: [{
        filename: req.file.originalname || 'contratto-retail.pdf',
        content: req.file.buffer,
        contentType: 'application/pdf'
      }]
    };
    await transporter.sendMail(mailOptions);
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

    const mailOptions = {
      from: '"Contratti Business" <andreamasala1970@gmail.com>',
      to: 'masalaenergia@outlook.it',
      cc: ccList.length > 0 ? ccList.join(',') : undefined,
      subject: `Contratto Business per ${ragioneSociale} (P.IVA ${partitaIva})`,
      text: `Ciao,\n\nIn allegato trovi il contratto BUSINESS compilato per ${ragioneSociale}.\n\nSaluti.`,
      attachments: [{
        filename: req.file.originalname || 'contratto-business.pdf',
        content: req.file.buffer,
        contentType: 'application/pdf'
      }]
    };
    await transporter.sendMail(mailOptions);
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
    let subject = '';
    let text = '';
    if (ragioneSociale) {
      subject = `Contratto Business per ${ragioneSociale} (P.IVA ${partitaIva})`;
      text = `Ciao,\n\nIn allegato trovi il contratto BUSINESS compilato per ${ragioneSociale}.\n\nSaluti.`;
    } else {
      subject = `Contratto Residenziale per ${nome} ${cognome}`;
      text = `Ciao ${nome} ${cognome},\n\nIn allegato trovi il contratto Res. e la documentazione compilata.\n\nSaluti.`;
    }

    const mailOptions = {
      from: '"Contratti Energia" <andreamasala1970@gmail.com>',
      to: 'masalaenergia@outlook.it',
      cc: ccList.length > 0 ? ccList.join(',') : undefined,
      subject: subject,
      text: text,
      attachments: [{
        filename: filename || 'contratto.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    };
    await transporter.sendMail(mailOptions);
    console.log("Email inviata!");
    res.json({ ok: true, message: 'PDF base64 ricevuto e email inviata!' });
  } catch (err) {
    console.error('Errore invio email (base64):', err);
    res.status(500).json({ error: 'Errore invio email base64.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server attivo su porta', PORT));