import QRCode from 'qrcode';

/**
 * Fonction pour générer un QR code pour un utilisateur donné
 * et le sauvegarder dans un fichier local.
 * @param {string} userId - L'ID de l'utilisateur
 */
export function generateQRCode(userId) {
  return new Promise((resolve, reject) => {

    const url = `http://180.149.197.7/valider?userId=${userId}`;
    const filePath = `./qrcode_${userId}.png`;

    QRCode.toFile(filePath, url, (err) => {
      if (err) {
        reject("Erreur lors de la génération du QR code : " + err);
      } else {
        resolve(`QR Code sauvegardé sous ${filePath}`);
      }
    });
  });
}