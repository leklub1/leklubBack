import db from '../Config/dbConfig.js';

export const registerEmailUser = async (req, res) => {
    const { email } = req.body;

    try {

        const [existingUser] = await db.query('SELECT * FROM users WHERE u_Email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Cet email est déjà enregistré.' });
        }

        const result = await db.query('INSERT INTO users (u_Email) VALUES (?)', [email]);

        res.status(201).json({
            message: 'Utilisateur enregistré avec succès.',
            userId: result[0].insertId,
        });

    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};
