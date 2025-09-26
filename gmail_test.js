const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'andreamasala1970@gmail.com',
        pass: 'gprz pttn vfwk emby'
    }
});

transporter.sendMail({
    from: '"Test invio" <andreamasala1970@gmail.com>',
    to: 'masalaenergia@outlook.it', // prova a te stesso!
    subject: 'Test invio nodemailer',
    text: 'Mail di test senza allegato'
}, (err, info) => {
    if (err) return console.log('Errore:', err);
    console.log('Mail inviata:', info);
});