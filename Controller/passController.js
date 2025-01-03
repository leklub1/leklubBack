import { generatePKPass } from '../Service/passGeneratorService.js';
import { getUserWalletData } from '../Service/userService.js';

export const generatePassHandler = async (req, res) => {
  try {

    const userId = req.query.id;
    if (!userId) {return res.status(400).json({ error: "Missing userId in the query string." });}
    let data = await getUserWalletData(userId);

    const passData = {
      secondaryFields: [
        { key: 'secondary1', label: 'Abonné depuis le : ', value: new Date(data.subscriptionCreatedAt).toISOString().split('T')[0], textAlignment: 'PKTextAlignmentCenter' },
        { key: 'sec2', label: 'Nom du client : ', value: data.lastName + ' ' + data.firstName, textAlignment: 'PKTextAlignmentCenter' },
      ],
    };

    console.log('Génération du PKPass...');
    const passBuffer = await generatePKPass(passData,data.token);
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