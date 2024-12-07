import transporter from '../Config/mailConfig.js';

/**
 * Envoie un email à un utilisateur.
 * @param {string} to - Adresse email du destinataire.
 * @param {string} subject - Sujet de l'email.
 * @param {string} body - Corps de l'email (texte brut ou HTML).
 */
export const sendEmail = async (to, subject, body, attachments = []) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, 
        to,                            
        subject,                       
        text: body,                   
        attachments: attachments
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé avec succès:', info.response);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
};

export default sendEmail;
