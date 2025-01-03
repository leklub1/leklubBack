// passGeneratorService.js

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import passkit from 'passkit-generator';
const { PKPass } = passkit;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CERTS_DIR = path.resolve(__dirname, '../certs');
const MODEL_DIR = path.resolve(__dirname, '../models/custom.pass');
const OUTPUT_DIR = path.resolve(__dirname, '../output');
const SIGNER_KEY_PASSPHRASE = ''; 

/**
 * Charge les certificats depuis le système de fichiers.
 */
async function loadCertificates() {
  try {

    const [signerCert, signerKey, wwdr] = await Promise.all([
      fs.readFile(path.join(CERTS_DIR, 'signerCert.pem')),
      fs.readFile(path.join(CERTS_DIR, 'signerKey.key')),
      fs.readFile(path.join(CERTS_DIR, 'wwdr.pem')),
    ]);

    return {
      signerCert,
      signerKey,
      wwdr,
      signerKeyPassphrase: SIGNER_KEY_PASSPHRASE || undefined,
    };
  } catch (error) {
    console.error('Erreur lors du chargement des certificats :', error);
    throw error;
  }
}

/**
 * Charge le modèle du pass (le dossier .pass).
 */
async function loadModel() {
  try {
    const modelDir = MODEL_DIR;
    await fs.access(modelDir);

    return modelDir;
  } catch (error) {
    console.error('Erreur lors du chargement du modèle du pass :', error);
    throw error;
  }
}

/**
 * Génère un Buffer PKPass prêt à être renvoyé au client.
 * @param {Object} passData - Les données personnalisées pour le pass.
 * @returns {Promise<Buffer>}
 */
async function generatePKPass(passData,token) {
  try {
    const certificates = await loadCertificates();
    const modelPath = await loadModel();

    const pass = await PKPass.from({
      model: modelPath,
      certificates: certificates,
    });

    pass.passTypeIdentifier = 'pass.fr.leklubtoulouse.carteabonnement'; 
    pass.teamIdentifier = 'S6VUB6HRUD';                             
    pass.organizationName = 'Le Klub Toulouse';                   
    pass.description = 'Carte d\'abonnement';
    pass.serialNumber = 'PASS-213213';
    pass.type = 'storeCard';

    const strip = await fs.readFile('models/custom.pass/strip.png');
    pass.addBuffer('strip.png', strip);
    const strip2x = await fs.readFile('models/custom.pass/strip@2x.png');
    pass.addBuffer('strip@2x.png', strip2x)

    pass.setBarcodes({
      message: token,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
    });
    
    
    if (passData.headerFields) {
      passData.headerFields.forEach(field => pass.headerFields.push(field));
    }
    if (passData.primaryFields) {
      passData.primaryFields.forEach(field => pass.primaryFields.push(field));
    }
    if (passData.secondaryFields) {
      passData.secondaryFields.forEach(field => pass.secondaryFields.push(field));
    }
    if (passData.auxiliaryFields) {
      passData.auxiliaryFields.forEach(field => pass.auxiliaryFields.push(field));
    }
    if (passData.backFields) {
      passData.backFields.forEach(field => pass.backFields.push(field));
    }

    const buffer = await pass.getAsBuffer();

    const outputFilePath = path.join(OUTPUT_DIR, `pass-${Date.now()}.pkpass`);
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outputFilePath, buffer);
    console.log('Fichier PKPass généré et stocké à :', outputFilePath);

    return buffer;

  } catch (error) {
    console.error('Erreur lors de la génération du pass :', error);
    throw error;
  }
}

export { generatePKPass };