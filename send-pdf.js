const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

(async () => {
  try {
    // Carica entrambi i contratti
    const pdfRetail = await fs.readFile(path.join(__dirname, 'A-0018-C-0524_PDA_CG_Retail.pdf'));
    const pdfBusiness = await fs.readFile(path.join(__dirname, 'A-0009-C-0524_PDA_CG_Business.pdf'));

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'andreamasala1970@gmail.com',
        pass: 'olwm wjfe hjyp dgzt'
      }
    });

    console.log('Sto per inviare la mail...');
    let info = await transporter.sendMail({
      from: '"Test app" <andreamasala1970@gmail.com>',
      to: 'masalaenergia@outlook.it',
      subject: 'Test mail nodemailer con allegati RETAIL e BUSINESS',
      text: 'Questa è una mail di test con allegati PDF RETAIL e BUSINESS.',
      attachments: [
        {
          filename: 'contratto_retail.pdf',
          content: Buffer.from(pdfRetail),
          contentType: 'application/pdf'
        },
        {
          filename: 'contratto_business.pdf',
          content: Buffer.from(pdfBusiness),
          contentType: 'application/pdf'
        }
      ]
    });
    console.log('Risposta sendMail:', info);
    console.log('Mail inviata!');
  } catch (err) {
    console.error('Errore invio mail:', err);
  }
})();