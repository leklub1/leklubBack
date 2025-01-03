import QRCode from 'qrcode';
import crypto from 'crypto';

export const generateToken =() =>{
  return crypto.randomBytes(32).toString('hex'); // Génère un token de 64 caractères hexadécimaux
}

/**
 * Fonction pour générer un QR code pour un utilisateur donné
 * et le sauvegarder dans un fichier local.
 * @param {string} userId - L'ID de l'utilisateur
 */
export const generateQRCode = (subId,token) => {
  return new Promise((resolve, reject) => {
    let finalToken = token + '_' + subId;

    const url = `https://leklubtoulouse.fr/valider.html?token=${finalToken}`;

    QRCode.toBuffer(url, { type: 'png' }, (err, buffer) => {
      if (err) {
        reject("Erreur lors de la génération du QR code : " + err);
      } else {
        resolve({ buffer, finalToken });
      }
    });
  });
};


