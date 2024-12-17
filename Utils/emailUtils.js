import transporter from '../Config/mailConfig.js';

/**
 * Envoie un email de bienvenue aux nouveaux membres de LeKlub.
 *
 * @param {string} to - Adresse email du destinataire.
 * @param {string} firstName - Prénom du destinataire.
 * @param {string} lastName - Nom de famille du destinataire.
 * @param {Array} attachments - (Optionnel) Liste des pièces jointes.
 */
export const sendEmail = async (to, firstName, lastName, attachments = []) => {

    const subject = `Bienvenue chez LeKlub, ${firstName} ${lastName} !`;

    const htmlBody = `
        <p>Bonjour ${firstName} ${lastName},</p>
        <p>Merci d'avoir rejoint <strong>LeKlub</strong> ! Nous sommes ravis de vous compter parmi nos membres.</p>
        <p>Votre abonnement est désormais actif. Vous pouvez commencer à profiter de nombreux avantages exclusifs et réductions dans nos restaurants partenaires dès maintenant.</p>
        
        <h3>Comment profiter de votre abonnement ?</h3>
        <ol>
            <li>Présentez votre carte LeKlub lors de votre visite dans l'un de nos établissements partenaires.</li>
            <li>Profitez des offres et réductions exclusives réservées à nos membres. <a href="https://leklubtoulouse.fr/">Découvrez nos partenaires</a>.</li>
        </ol>
        
        <p>Pour découvrir toutes les offres disponibles, consultez votre <a href="https://leklubtoulouse.fr/espace-membre">offres disponibles</a>.</p>
        
        <h3>Une question ?</h3>
        <p>Notre équipe est à votre disposition pour répondre à toutes vos questions à l'adresse <a href="mailto:info@leklubtoulouse.com">info@leklubtoulouse.com</a>.</p>
        
        <p>Bienvenue dans l'aventure <strong>LeKlub</strong> et bon appétit !</p>
        
        <p>Cordialement,<br>L'équipe LeKlub</p>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER, 
        to,                            
        subject,                       
        html: htmlBody,                
        attachments,                   
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé avec succès:', info.response);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
};

/**
 * Envoie un email de bienvenue aux nouveaux membres de LeKlub.
 *
 * @param {string} to - Adresse email du destinataire.
 * @param {string} firstName - Prénom du destinataire.
 * @param {string} lastName - Nom de famille du destinataire.
 * @param {Array} attachments - (Optionnel) Liste des pièces jointes.
 */
export const sendQrCodeEmail = async (to, firstName, lastName, qrCodeImage) => {

    const subject = `QR Code LeKlub, ${firstName} ${lastName} !`;

    const htmlBody = `
    <p>Bonjour <strong>${firstName} ${lastName}</strong>,</p>

    <p>Nous avons le plaisir de vous transmettre votre <strong>QR Code personnel</strong>. Celui-ci vous permettra d'accéder facilement à nos services et avantages exclusifs.</p>

    <p>Veuillez trouver votre QR Code en pièce jointe de cet email.</p>

    <p>En cas de besoin ou pour toute question, n'hésitez pas à nous contacter par email à <a href="mailto:info@leklubtoulouse.com">info@leklubtoulouse.com</a>. Nous sommes toujours disponibles pour vous accompagner.</p>

    <p>Merci de faire partie de l'aventure <strong>LeKlub</strong> !</p>

    <p>Cordialement,<br>
    <strong>L'équipe LeKlub</strong></p>
`;


    const attachments = [
        {
            filename: 'qrcode.png', 
            content: qrCodeImage, 
            encoding: 'base64',    
        },
    ];

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: htmlBody,
        attachments, // Passer l'objet d'attachement ici
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé avec succès:', info.response);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        throw error;
    }
};

export default sendEmail;
