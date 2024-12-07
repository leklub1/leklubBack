import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'mail.leklubtoulouse.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
// Pour les teste de connexion
transporter.verify((error, success) => {
    if (error) {
        console.error('Erreur de connexion au serveur SMTP:', error);
    } else {
        console.log('Serveur SMTP prêt à envoyer des emails.');
    }
});

export default transporter;