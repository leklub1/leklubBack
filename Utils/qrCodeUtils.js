import QRCode from 'qrcode';
import crypto from 'crypto';

const generateToken =() =>{
  return crypto.randomBytes(32).toString('hex'); // Génère un token de 64 caractères hexadécimaux
}

/**
 * Fonction pour générer un QR code pour un utilisateur donné
 * et le sauvegarder dans un fichier local.
 * @param {string} userId - L'ID de l'utilisateur
 */
export const generateQRCode = (subId) => {
  return new Promise((resolve, reject) => {
    let token = generateToken();
    let finalToken = token + '_' + subId;

    const url = `http://180.149.197.7/valider.html?token=${finalToken}`;

    QRCode.toBuffer(url, { type: 'png' }, (err, buffer) => {
      if (err) {
        reject("Erreur lors de la génération du QR code : " + err);
      } else {
        resolve({ buffer, finalToken });
      }
    });
  });
};


