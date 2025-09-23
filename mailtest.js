const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'andreamasala1970@gmail.com',
    pass: 'olwm wjfe hjyp dgzt'
  }
});

(async () => {
  try {
    console.log('Invio test...');
    let info = await transporter.sendMail({
      from: '"Test app" <andreamasala1970@gmail.com>',
      to: 'andrew.masala@libero.it',
      subject: 'Test mail nodemailer',
      text: 'Questa è una mail di test.'
    });
    console.log('Risposta sendMail:', info);
  } catch (err) {
    console.error('Errore invio mail:', err);
  }
})();