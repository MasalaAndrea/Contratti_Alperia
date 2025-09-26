const nodemailer = require('nodemailer');
const fs = require('fs');

// Configura il transporter Gmail (App Password!)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'andreamasala1970@gmail.com',
    pass: 'gprz pttn vfwk emby'
  }
});

// Leggi il file PDF da allegare
const pdfBuffer = fs.readFileSync('A-0018-C-0524_PDA_CG_Retail.pdf'); // Cambia nome se vuoi

(async () => {
  try {
    let info = await transporter.sendMail({
      from: '"Test Allegato" <andreamasala1970@gmail.com>',
      to: 'masalaenergia@outlook.it', // Cambia destinatario se vuoi
      subject: 'Test invio PDF come allegato',
      text: 'Questa è una mail di test con allegato PDF.',
      attachments: [{
        filename: 'contratto-test.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });
    console.log('Mail inviata:', info);
  } catch (err) {
    console.error('Errore invio mail:', err);
  }
})();