import { generatePKPass } from '../Service/passGeneratorService.js';

export const generatePassHandler = async (req, res) => {
  try {

    const passData = {
      // headerFields: [],
      // primaryFields: [],

      secondaryFields: [
        { key: 'secondary1', label: 'Abonné depuis le : ', value: '18:40', textAlignment: 'PKTextAlignmentCenter' },
        { key: 'sec2', label: 'Nom du client : ', value: '19:10', textAlignment: 'PKTextAlignmentCenter' },
      ],
      // auxiliaryFields: [],
      // backFields: [],
    };

    console.log('Génération du PKPass...');
    const passBuffer = await generatePKPass(passData);
    console.log(passBuffer);
    console.log('PKPass généré.');

    res.set({
      'Content-Type': 'application/vnd.apple.pkpass',
      'Content-Disposition': 'attachment; filename="pass.pkpass"',
      'Content-Length': passBuffer.length,
      'Cache-Control': 'no-store',
    });

    return res.send(passBuffer);
  } catch (error) {
    console.error('Erreur lors de la génération du pass :', error);
    res.status(500).json({
      message: 'Erreur lors de la génération du pass',
      error: error.message,
    });
  }
};