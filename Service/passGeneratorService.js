// passGeneratorService.js

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import passkit from 'passkit-generator';
const { PKPass } = passkit;

// Obtenir le répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins d'accès
const CERTS_DIR = path.resolve(__dirname, '../certs');
const MODEL_DIR = path.resolve(__dirname, '../models/custom.pass');
// (OUTPUT_DIR n'est pas forcément utilisé dans ce code)
const OUTPUT_DIR = path.resolve(__dirname, '../output');

// Passphrase de la clé privée (si vous en avez une)
const SIGNER_KEY_PASSPHRASE = ''; 

/**
 * Charge les certificats depuis le système de fichiers.
 */
async function loadCertificates() {
  try {
    console.log('CERTS_DIR:', CERTS_DIR);

    const [signerCert, signerKey, wwdr] = await Promise.all([
      fs.readFile(path.join(CERTS_DIR, 'signerCert.pem')),
      fs.readFile(path.join(CERTS_DIR, 'signerKey.key')),
      fs.readFile(path.join(CERTS_DIR, 'wwdr.pem')),
    ]);

    console.log('Signer Certificate:', signerCert.toString('utf-8'));
    console.log('Signer Key:', signerKey.toString('utf-8'));
    console.log('WWDR Certificate:', wwdr.toString('utf-8'));

    console.log('Certificats chargés.');

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
    console.log('MODEL_DIR:', MODEL_DIR);
    console.log('MODEL_NAME:', 'custom.pass');

    const modelDir = MODEL_DIR;
    console.log('Resolved modelDir:', modelDir);

    await fs.access(modelDir);
    console.log('Modèle accessible.');

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
async function generatePKPass(passData) {
  try {
    console.log('Chargement des certificats...');
    const certificates = await loadCertificates();
    console.log('Certificats chargés.');

    console.log('Chargement du modèle...');
    const modelPath = await loadModel();
    console.log('Modèle chargé:', modelPath);

    console.log('Création du PKPass...');
    const pass = await PKPass.from({
      model: modelPath,
      certificates: certificates,
    });
    console.log('PKPass créé.');

    // Définition des métadonnées du pass
    pass.passTypeIdentifier = 'pass.fr.leklubtoulouse.carteabonnement'; 
    pass.teamIdentifier = 'S6VUB6HRUD';                             
    pass.organizationName = 'Le Klub Toulouse';                   
    pass.description = 'Carte d\'abonnement';
    pass.serialNumber = 'PASS-213213';

    pass.setBarcodes({
      message: 'https://leklubtoulouse.fr/',
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

    console.log('Champs personnalisés ajoutés.');

    // Générez le pass en mémoire (Buffer)
    console.log('Génération du buffer...');
    const buffer = await pass.getAsBuffer();
    console.log('Buffer généré.');

    // (Optionnel) Écrire sur disque, si vous voulez en garder une copie
    const outputFilePath = path.join(OUTPUT_DIR, `pass-${Date.now()}.pkpass`);
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outputFilePath, buffer);
    console.log('Fichier PKPass généré et stocké à :', outputFilePath);

    // RETOURNEZ LE BUFFER, et pas le chemin
    return buffer;
  } catch (error) {
    console.error('Erreur lors de la génération du pass :', error);
    throw error;
  }
}

export { generatePKPass };