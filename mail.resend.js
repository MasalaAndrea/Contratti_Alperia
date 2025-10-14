const { Resend } = require('resend');
const fs = require('fs');

// Inserisci la tua API Key Resend qui
const resend = new Resend('re_68QyqgGy_GBd9mwRm98ZTyaYfcdnqb2K5');

// Se vuoi allegare un PDF, togli il commento qui sotto e metti il nome giusto del file
// const pdfBuffer = fs.readFileSync('contratto-di-prova.pdf');

(async () => {
  try {
    const emailOptions = {
      from: 'noreply@masalaenergia.it',       // Mittente verificato
      to: 'masalaenergia@outlook.it',         // Destinatario di test (puoi cambiarlo)
      subject: 'Test invio email da Resend',
      text: 'Ciao! Questa è una mail di test inviata tramite Resend e il dominio verificato.',
      // attachments: [
      //   {
      //     filename: 'contratto-di-prova.pdf',
      //     content: pdfBuffer,
      //     contentType: 'application/pdf'
      //   }
      // ]
    };

    const data = await resend.emails.send(emailOptions);
    console.log('Risposta Resend:', data);
  } catch (err) {
    console.error('Errore invio mail:', err);
  }
})();